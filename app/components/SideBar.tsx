"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Workspace {
  id: string;
  name: string;
}

export default function Sidebar() {
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (status === "authenticated") {
        const res = await fetch("/api/workspaces");
        if (res.ok) {
          const data = await res.json();
          setWorkspaces(data);
        }
        setLoading(false);
      }
    };
    load();
  }, [status]);

  if (status === "loading") return null;

  return (
    <aside className='w-64 border-r p-4 flex flex-col bg-gray-50 h-full'>
      <h2 className='text-lg font-semibold mb-4'>Your Projects</h2>

      {loading && <div className='text-sm text-gray-400'>Loading…</div>}

      {!loading && workspaces.length === 0 && <div className='text-sm text-gray-500'>No projects yet.</div>}

      <ul className='space-y-2 flex-1 overflow-y-auto'>
        {workspaces.map((ws) => (
          <li key={ws.id}>
            <Link href={`/workspace/${ws.id}`} className='block px-2 py-1 rounded hover:bg-blue-100 text-sm'>
              {ws.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Create Project */}
      <button
        className='mb-3 w-full py-2 text-sm border rounded bg-white hover:bg-green-400  transition'
        onClick={async () => {
          const name = prompt("Enter project name:");
          if (!name) return;

          const res = await fetch("/api/workspaces", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          });

          if (res.ok) {
            const data = await res.json();
            alert(`Workspace '${data.name}' created!`);
            location.href = `/workspace/${data.id}`;
          } else {
            alert("Failed to create workspace");
          }
        }}
      >
        + Create Project
      </button>

      <button
        className='mt-2 py-1 text-sm border rounded bg-green-600 hover:text-green-100 transition'
        onClick={async () => {
          const code = prompt("Enter invite code:");
          if (!code) return;
          const res = await fetch("/api/workspaces/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });
          if (res.ok) location.reload();
          else alert("Invalid code");
        }}
      >
        Join Project
      </button>
    </aside>
  );
}
