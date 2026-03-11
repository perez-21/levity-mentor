import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic, buildSystemPrompt } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Fetch participant context in parallel
  const [{ data: profile }, { data: revenue }, { data: expenses }, { data: history }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("revenue_entries").select("amount").eq("user_id", user.id),
      supabase.from("expense_entries").select("amount").eq("user_id", user.id),
      supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(20),
    ]);

  const totalRevenue = (revenue ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const totalExpenses = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0);

  const systemPrompt = buildSystemPrompt({
    fullName: profile?.full_name || user.email || "Participant",
    businessName: profile?.business_name || "",
    businessDescription: profile?.business_description || "",
    initialCapital: Number(profile?.initial_capital ?? 500000),
    totalRevenue,
    totalExpenses,
  });

  // Persist user message
  await supabase.from("chat_messages").insert({
    user_id: user.id,
    role: "user",
    content: message,
  });

  // Build message history for Claude
  const priorMessages = (history ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Stream response from Claude
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

        // Persist assistant response after stream completes
        await supabase.from("chat_messages").insert({
          user_id: user.id,
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
