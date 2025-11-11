"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { pusherClient } from "@/lib/pusher";
import { FiArrowDownCircle, FiSearch, FiChevronUp, FiChevronDown } from "react-icons/fi";

type Msg = {
  id?: string;
  tempId?: string; // for optimistic dedupe
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
  const [isAtBottom, setIsAtBottom] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 🔍 Search
  const [searchQuery, setSearchQuery] = useState("");
  const [matchIndexes, setMatchIndexes] = useState<number[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // 🔔 Real-time subscription with deduplication
  useEffect(() => {
    if (!workspaceId) return;

    const channel = pusherClient.subscribe(`workspace-${workspaceId}`);
    console.log("Subscribed to", `workspace-${workspaceId}`);

    channel.bind("new-message", (message: Msg) => {
      setMessages((prev) => {
        if (message.tempId) {
          const idx = prev.findIndex((m) => m.tempId === message.tempId);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = message;
            return next;
          }
        }
        if (message.id && prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`workspace-${workspaceId}`);
    };
  }, [workspaceId]);

  // 📜 Scroll tracking
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

  // 🚀 Send message (optimistic + streaming AI)
  const send = async (text: string) => {
    if (!text.trim()) return;
    setError(null);
    setLoading(true);

    const tempId = crypto.randomUUID();

    const optimistic: Msg = {
      tempId,
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
      const savedRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content: text.trim(),
          workspaceId,
          tempId,
        }),
      });

      let saved: Msg | null = null;
      if (savedRes.ok) saved = await savedRes.json();

      if (saved) {
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.tempId === tempId);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = saved;
            return updated;
          }
          return [...prev, saved];
        });
      }

      const aiTempId = crypto.randomUUID();
      setMessages((prev) => [...prev, { role: "assistant", content: "", tempId: aiTempId }]);

      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, saved ?? optimistic],
          workspaceId,
          aiTempId,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      if (reader) {
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

  // ✏️ Edit & Delete handlers
  const handleEdit = async (msg: Msg) => {
    const newContent = prompt("Edit message:", msg.content);
    if (!newContent || newContent === msg.content) return;

    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, content: newContent } : m)));

    const res = await fetch(`/api/messages/${msg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent }),
    });

    if (!res.ok) alert("Failed to edit message");
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const confirmDelete = confirm("Delete this message?");
    if (!confirmDelete) return;

    setMessages((prev) => prev.filter((m) => m.id !== id));
    const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
    if (!res.ok) alert("Failed to delete message");
  };

  // 🔍 Highlight + navigation
  useEffect(() => {
    if (!searchQuery) {
      setMatchIndexes([]);
      setCurrentMatch(0);
      return;
    }
    const matches: number[] = [];
    messages.forEach((m, i) => {
      if (m.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        matches.push(i);
      }
    });
    setMatchIndexes(matches);
    setCurrentMatch(matches.length > 0 ? 0 : -1);
  }, [searchQuery, messages]);

  useEffect(() => {
    if (matchIndexes.length > 0 && matchIndexes[currentMatch] !== undefined) {
      const el = messageRefs.current[matchIndexes[currentMatch]];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentMatch, matchIndexes]);

  return (
    <div
      className='flex flex-col min-h-[calc(100vh-130px)]
                 bg-gray-50 dark:bg-[#0f1117]
                 text-gray-800 dark:text-gray-100 transition-colors duration-300'
    >
      {/* 🔍 Search bar */}
      <div className='flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-[#2a2f3a] bg-white/70 dark:bg-[#12161e]/90'>
        <FiSearch className='text-gray-400' />
        <input
          type='text'
          placeholder='Search messages...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-[#2a2f3a]
                     bg-white dark:bg-[#1c1f27] text-gray-800 dark:text-gray-200
                     focus:outline-none focus:ring-2 focus:ring-[#24CFA6]'
        />
        {matchIndexes.length > 0 && (
          <div className='flex items-center gap-1 text-sm text-gray-500'>
            <span>
              {currentMatch + 1}/{matchIndexes.length}
            </span>
            <button
              onClick={() => setCurrentMatch((prev) => (prev > 0 ? prev - 1 : matchIndexes.length - 1))}
              className='p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2a2f3a]'
              title='Previous'
            >
              <FiChevronUp />
            </button>
            <button
              onClick={() => setCurrentMatch((prev) => (prev < matchIndexes.length - 1 ? prev + 1 : 0))}
              className='p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2a2f3a]'
              title='Next'
            >
              <FiChevronDown />
            </button>
          </div>
        )}
      </div>

      {/* 💬 Chat area */}
      <div ref={scrollContainerRef} className='flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth'>
        {messages.map((m, i) => (
          <div
            key={m.id ?? m.tempId ?? i}
            ref={(el) => {
              messageRefs.current[i] = el;
            }}
          >
            <MessageBubble
              role={m.role}
              content={m.content}
              highlight={searchQuery}
              isHighlighted={matchIndexes[currentMatch] === i}
              userName={m.user?.name ?? (m.role === "assistant" ? "AI Assistant" : "User")}
              userId={m.user?.id}
              onEdit={() => handleEdit(m)}
              onDelete={() => handleDelete(m.id)}
              isOwn={m.user?.id === (session?.user as any)?.id}
            />
          </div>
        ))}

        {loading && (
          <div className='flex justify-start'>
            <div className='bg-gray-200 dark:bg-[#2a2f3a] text-gray-600 dark:text-gray-300 px-4 py-2 rounded-2xl rounded-bl-none text-sm animate-pulse'>
              🤖 AI is thinking...
            </div>
          </div>
        )}

        {error && <div className='text-sm text-red-600 dark:text-red-400 text-center'>⚠️ {error}</div>}

        <div ref={chatEndRef} />
      </div>

      {/* 🔽 Scroll-to-bottom button */}
      {!isAtBottom && (
        <button
          onClick={() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" })}
          className='absolute bottom-24 right-6 bg-white dark:bg-[#1c1f27]
                     border border-gray-300 dark:border-[#2a2f3a]
                     shadow-sm hover:shadow-md rounded-full p-2
                     text-gray-600 dark:text-gray-200 hover:text-[#24CFA6]
                     transition'
          title='Scroll to latest'
        >
          <FiArrowDownCircle size={22} />
        </button>
      )}

      {/* ✍️ Input area */}
      <div
        className='border-t border-gray-200 dark:border-[#2a2f3a]
                   bg-white/80 dark:bg-[#12161e]/95 backdrop-blur-md'
      >
        <div className='mx-auto px-4 sm:px-6 py-3'>
          <ChatInput onSend={send} />
        </div>
      </div>
    </div>
  );
}
