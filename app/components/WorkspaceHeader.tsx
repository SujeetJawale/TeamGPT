"use client";

import { useState } from "react";

export default function WorkspaceHeader({
  id,
  name,
  inviteCode,
  userName,
}: {
  id: string;
  name?: string | null;
  inviteCode?: string | null;
  userName?: string | null;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    alert(`${label} copied!`);
  };

  return (
    <header className='border-b p-4 bg-gray-50 flex justify-between items-center'>
      <div className='space-y-2'>
        <h2 className='text-xl font-semibold'>{name ?? "Workspace"}</h2>

        <button
          onClick={() => setShowDetails((prev) => !prev)}
          className='text-sm px-3 py-1 border rounded-md bg-white hover:bg-gray-100 transition'
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>

        {showDetails && (
          <div className='mt-2 space-y-1 text-sm text-gray-700'>
            <div className='flex items-center gap-2'>
              <span>ID: {id}</span>
              <button
                onClick={() => copy(id, "Workspace ID")}
                className='text-xs px-2 py-1 border rounded hover:bg-gray-200'
              >
                Copy
              </button>
            </div>

            {inviteCode && (
              <div className='flex items-center gap-2'>
                <span>Invite code: {inviteCode}</span>
                <button
                  onClick={() => copy(inviteCode, "Invite code")}
                  className='text-xs px-2 py-1 border rounded hover:bg-gray-200'
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <span className='text-gray-600 text-sm'>{userName ?? "User"}</span>
    </header>
  );
}
