import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPrimaryEmail } from "@/lib/auth";
import { anthropic, buildSystemPrompt } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const { supabase, userId } = await createClient();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const email = await getPrimaryEmail();

  const [{ data: profile }, { data: revenue }, { data: expenses }, { data: history }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("revenue_entries").select("amount").eq("user_id", userId),
      supabase.from("expense_entries").select("amount").eq("user_id", userId),
      supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(20),
    ]);

  const totalRevenue = (revenue ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const totalExpenses = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0);

  const systemPrompt = buildSystemPrompt({
    fullName: profile?.full_name || email || "Participant",
    businessName: profile?.business_name || "",
    businessDescription: profile?.business_description || "",
    initialCapital: Number(profile?.initial_capital ?? 500000),
    totalRevenue,
    totalExpenses,
  });

  await supabase.from("chat_messages").insert({
    user_id: userId,
    role: "user",
    content: message,
  });

  const priorMessages = (history ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  let fullResponse = "";
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [...priorMessages, { role: "user", content: message }],
        });

        for await (const chunk of claudeStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const text = chunk.delta.text;
            fullResponse += text;
            controller.enqueue(new TextEncoder().encode(text));
          }
        }

        controller.close();

        await supabase.from("chat_messages").insert({
          user_id: userId,
          role: "assistant",
          content: fullResponse,
        });
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
