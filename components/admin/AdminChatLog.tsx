import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Props {
  messages: Message[];
}

export function AdminChatLog({ messages }: Props) {
  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-gray-500">
          No chat messages yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-gray-900 text-white rounded-br-sm"
                : "bg-white border text-gray-800 rounded-bl-sm"
            }`}
          >
            <p className="text-xs mb-1 opacity-50 uppercase tracking-wide">
              {msg.role === "user" ? "Participant" : "AI Mentor"}
            </p>
            {msg.content}
            <p className="text-xs mt-2 opacity-40">
              {format(new Date(msg.created_at), "MMM d, h:mm a")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
