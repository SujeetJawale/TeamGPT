"use client";

import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";

export default function MessageBubble({
  role,
  content,
  userName,
  userId,
  isOwn,
  highlight,
  isHighlighted,
  onEdit,
  onDelete,
}: {
  role: "user" | "assistant";
  content: string;
  userName?: string | null;
  userId?: string;
  isOwn?: boolean;
  highlight?: string;
  isHighlighted?: boolean;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

  const handleSave = () => {
    if (onEdit) onEdit(editValue);
    setEditing(false);
  };

  const isAI = role === "assistant";

  const highlightText = (text: string, query?: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className='bg-yellow-300 text-gray-900 dark:bg-yellow-400/60 rounded px-0.5'>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`group relative max-w-[80%] px-4 py-3 rounded-2xl shadow-sm transition
          ${
            isAI
              ? "bg-gray-200 dark:bg-[#2a2f3a] text-gray-800 dark:text-gray-100 rounded-bl-none"
              : "bg-blue-500 text-white rounded-br-none"
          }
          ${isHighlighted ? "ring-2 ring-yellow-400" : ""}
        `}
      >
        <p className='font-semibold text-sm mb-1 opacity-90'>
          {userName ?? (isAI ? "AI Assistant" : "User")}
        </p>

        {/* Editing Mode */}
        {editing ? (
          <div className='flex flex-col gap-2'>
            <textarea
              className='w-full p-2 rounded-md text-sm text-gray-800 dark:text-gray-100 
                         bg-white dark:bg-[#1c1f27] border border-gray-300 dark:border-[#2a2f3a]'
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
            <div className='flex justify-end gap-3 text-sm'>
              <button
                onClick={() => setEditing(false)}
                className='text-white/80 hover:text-gray-300 transition'
                title='Cancel'
              >
                <FiX />
              </button>
              <button
                onClick={handleSave}
                className='text-[#24CFA6] hover:text-[#1fb994] transition'
                title='Save'
              >
                <FiCheck />
              </button>
            </div>
          </div>
        ) : (
          <p className='text-sm whitespace-pre-line'>{highlightText(content, highlight)}</p>
        )}

        {/* Action Buttons */}
        {isOwn && !isAI && !editing && (
          <div
            className='absolute -top-2 -right-2 flex gap-2 opacity-0 group-hover:opacity-100 
                       transition-opacity duration-200'
          >
            <button
              onClick={() => setEditing(true)}
              className='bg-white/20 text-white p-1.5 rounded-full hover:bg-white/30'
              title='Edit'
            >
              <FiEdit2 size={14} />
            </button>
            <button
              onClick={onDelete}
              className='bg-white/20 text-white p-1.5 rounded-full hover:bg-red-500/80'
              title='Delete'
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
