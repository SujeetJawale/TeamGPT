"use client";

import { useState } from "react";

export default function ChatInput({ onSend }: { onSend: (t: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className='flex gap-2'>
      <input
        className='flex-1 border rounded p-2'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Ask something…'
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            onSend(value.trim());
            setValue("");
          }
        }}
      />
      <button
        className='bg-blue-600 text-white rounded px-4'
        onClick={() => {
          if (!value.trim()) return;
          onSend(value.trim());
          setValue("");
        }}
      >
        Send
      </button>
    </div>
  );
}
