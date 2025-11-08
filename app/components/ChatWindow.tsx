"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { pusherClient } from "@/lib/pusher";

type Msg = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  workspaceId?: string;
  user?: { id?: string; name?: string | null; image?: string | null } | null;
};

export default function ChatWindow({ workspaceId }: { workspaceId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🧩 Load saved messages from DB (with authors)
  useEffect(() => {
    const loadMessages = async () => {
      const res = await fetch(`/api/messages?workspaceId=${workspaceId}`);
      if (res.ok) {
        const data: Msg[] = await res.json();
        setMessages(data);
      }
    };
    loadMessages();
  }, [workspaceId]);

  // 🔔 Subscribe to real-time updates with Pusher
  useEffect(() => {
    if (!workspaceId) return;

    const channel = pusherClient.subscribe(`workspace-${workspaceId}`);
    console.log("Subscribed to", `workspace-${workspaceId}`);

    channel.bind("new-message", (message: Msg) => {
      console.log("📩 received new message via pusher", message);
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`workspace-${workspaceId}`);
    };
  }, [workspaceId]);

  // 🚀 Send a message
  const send = async (text: string) => {
    if (!text.trim()) return;
    setError(null);
    setLoading(true);

    const optimistic: Msg = {
      role: "user",
      content: text.trim(),
      workspaceId,
      user: {
        id: (session?.user as any)?.id,
        name: session?.user?.name ?? "You",
      },
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      // 1️⃣ Save user message (same as before)
      const savedRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content: text.trim(),
          workspaceId,
        }),
      });

      let saved: Msg | null = null;
      if (savedRes.ok) saved = await savedRes.json();
      if (saved) setMessages((prev) => [...prev.slice(0, -1), saved]);

      // 2️⃣ Fetch AI streaming reply
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        body: JSON.stringify({
          messages: [...messages, saved ?? optimistic],
          workspaceId,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      if (reader) {
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          aiText += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") last.content = aiText;
            return updated;
          });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Chat area */}
      <div className='flex-1 overflow-y-auto px-4 py-3 space-y-2  h-full'>
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id ?? i}
            role={m.role}
            content={m.content}
            userName={m.user?.name ?? (m.role === "assistant" ? "AI Assistant" : "User")}
            userId={m.user?.id}
          />
        ))}

        {loading && (
          <div className='flex justify-start'>
            <div className='bg-gray-200 text-gray-600 px-4 py-2 rounded-2xl rounded-bl-none text-sm animate-pulse'>
              🤖 AI is thinking...
            </div>
          </div>
        )}

        {error && <div className='text-sm text-red-600'>{error}</div>}
      </div>

      {/* Input area */}
      <div className='border-t p-3 bg-white'>
        <ChatInput onSend={send} />
      </div>
    </div>
  );
}
