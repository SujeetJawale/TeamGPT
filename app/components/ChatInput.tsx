"use client";

import { useState, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";

export default function ChatInput({ onSend }: { onSend: (t: string) => void }) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [value]);

  return (
    <div className='sticky bottom-0 w-full border-t bg-gradient-to-r from-[#24CFA6]/10 to-blue-100/40 backdrop-blur-sm'>
      <div className='max-w-5xl mx-auto flex items-end gap-3 px-4 py-3'>
        {/* Input box */}
        <div
          className={`flex-1 rounded-2xl px-4 py-2 shadow-sm border transition-all duration-200 bg-white/80 ${
            isFocused ? "border-[#24CFA6] ring-2 ring-[#24CFA6]/20" : "border-gray-200"
          }`}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            className='w-full resize-none bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm sm:text-base max-h-40 overflow-y-auto'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder='Ask something…'
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!value.trim()}
          className={`flex items-center justify-center rounded-xl px-5 py-2.5 font-medium text-sm transition-all shrink-0 ${
            value.trim()
              ? "bg-[#24CFA6] hover:bg-[#1fb994] text-white shadow-sm hover:shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <FiSend className='w-5 h-5' />
        </button>
      </div>
    </div>
  );
}
