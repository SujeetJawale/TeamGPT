"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { pusherClient } from "@/lib/pusher";
import { FiArrowDownCircle } from "react-icons/fi";

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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 🧩 Load saved messages
  useEffect(() => {
    const loadMessages = async () => {
      const res = await fetch(`/api/messages?workspaceId=${workspaceId}`);
      if (res.ok) {
        const data: Msg[] = await res.json();
        setMessages(data);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "auto" }), 50);
      }
    };
    loadMessages();
  }, [workspaceId]);

  // 🔔 Real-time subscription
  useEffect(() => {
    if (!workspaceId) return;

    const channel = pusherClient.subscribe(`workspace-${workspaceId}`);
    console.log("Subscribed to", `workspace-${workspaceId}`);

    channel.bind("new-message", (message: Msg) => {
      console.log("📩 received new message via pusher", message);
      setMessages((prev) => [...prev, message]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`workspace-${workspaceId}`);
    };
  }, [workspaceId]);

  // 🧠 Track scroll position
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
      setIsAtBottom(atBottom);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

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
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    try {
      // Save user message
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

      // Stream AI reply
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
          if (isAtBottom) chatEndRef.current?.scrollIntoView({ behavior: "auto" });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
    }
  };

  return (
    <div className='flex flex-col h-[calc(100vh-130px)] bg-gradient-to-b from-white via-gray-100 to-gray-150'>
      {/* Chat area */}
      <div
        ref={scrollContainerRef}
        className='flex-1 h-[90vh] overflow-y-auto px-4 sm:px-6 py-4 space-y-3 scroll-smooth'
      >
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

        {error && <div className='text-sm text-red-600 text-center'>⚠️ {error}</div>}

        <div ref={chatEndRef} />
      </div>

      {/* Scroll-to-bottom button */}
      {!isAtBottom && (
        <button
          onClick={() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" })}
          className='absolute bottom-24 right-6 bg-white border border-gray-300 shadow-sm hover:shadow-md rounded-full p-2 text-gray-600 hover:text-[#24CFA6] transition'
          title='Scroll to latest'
        >
          <FiArrowDownCircle size={22} />
        </button>
      )}

      {/* Input area */}
      <div className='border-t bg-white/80 backdrop-blur-md'>
        <div className=' mx-auto px-4 sm:px-6 py-3'>
          <ChatInput onSend={send} />
        </div>
      </div>
    </div>
  );
}
