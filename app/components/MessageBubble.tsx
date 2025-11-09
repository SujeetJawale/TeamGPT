"use client";
import { useSession } from "next-auth/react";

export default function MessageBubble({
  role,
  content,
  userName,
  userId,
}: {
  role: "user" | "assistant";
  content: string;
  userName?: string | null;
  userId?: string | null;
}) {
  const { data: session } = useSession();
  const selfId = (session?.user as any)?.id;
  const isSelf = role === "user" && userId && selfId && userId === selfId;

  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[75%] rounded-2xl p-3 whitespace-pre-wrap ${
          isSelf
            ? "bg-blue-400 text-white rounded-br-none"
            : role === "assistant"
            ? "bg-gray-200 text-gray-800 rounded-bl-none"
            : "bg-green-200 text-gray-800 rounded-bl-none"
        }`}
      >
        <div className='text-xs font-semibold mb-1 opacity-80'>
          {userName ?? (role === "assistant" ? "AI Assistant" : "User")}
        </div>
        {content}
      </div>
    </div>
  );
}
