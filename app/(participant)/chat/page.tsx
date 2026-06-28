import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default async function ChatPage() {
  const { supabase, userId } = await createClient();
  if (!userId) redirect("/login");

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(40);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">AI Mentor</h1>
      <p className="text-sm text-gray-500">
        Your mentor knows your business and financials. Ask anything.
      </p>
      <ChatInterface initialMessages={messages ?? []} />
    </div>
  );
}
