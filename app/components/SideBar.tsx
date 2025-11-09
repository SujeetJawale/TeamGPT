"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiPlus, FiUsers, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface Workspace {
  id: string;
  name: string;
}

export default function Sidebar() {
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const activeId = useMemo(() => {
    const m = pathname?.match(/\/workspace\/([^/]+)/);
    return m?.[1] ?? null;
  }, [pathname]);

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
    <aside
      className={`relative flex flex-col bg-white border-r transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      } h-full`}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className='absolute -right-3 top-4 z-20 bg-white border rounded-full p-1.5 shadow hover:bg-gray-50 transition'
      >
        {collapsed ? (
          <FiChevronRight className='text-gray-600' />
        ) : (
          <FiChevronLeft className='text-gray-600' />
        )}
      </button>

      {/* Header */}
      <div className='px-4 py-3 border-b bg-gradient-to-r from-[#24CFA6]/10 to-blue-100/40 flex items-center gap-2'>
        <h2
          className={`text-sm font-semibold text-gray-700 tracking-wide transition-opacity duration-300 ${
            collapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
        >
          Projects
        </h2>
      </div>

      {/* Workspace list */}
      <div className='p-3 flex-1 bg-gradient-to-r from-[#24CFA6]/10 to-blue-100/40 overflow-y-auto'>
        {loading && (
          <div className='space-y-2'>
            <div className='h-8 bg-gray-100 rounded animate-pulse' />
            <div className='h-8 bg-gray-100 rounded animate-pulse' />
            <div className='h-8 bg-gray-100 rounded animate-pulse' />
          </div>
        )}

        {!loading && workspaces.length === 0 && (
          <div className={`text-sm text-gray-500 ${collapsed ? "text-center" : ""}`}>No projects</div>
        )}

        <ul className='space-y-1'>
          {workspaces.map((ws) => {
            const isActive = ws.id === activeId;
            return (
              <li key={ws.id} className='group flex items-center justify-between'>
                <Link
                  href={`/workspace/${ws.id}`}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition ${
                    isActive
                      ? "bg-[#24CFA6]/10 text-[#106e5d] ring-1 ring-[#24CFA6]/40"
                      : "text-gray-700 hover:bg-gray-50"
                  } ${collapsed ? "text-center px-1" : ""}`}
                  title={collapsed ? ws.name : ""}
                >
                  {collapsed ? ws.name.charAt(0).toUpperCase() : ws.name}
                </Link>

                {!collapsed && (
                  <button
                    aria-label='Delete project'
                    onClick={() => setConfirmId(ws.id)}
                    className='opacity-0 group-hover:opacity-100 ml-2 p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition'
                  >
                    <FiTrash2 className='w-4 h-4' />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom buttons */}
      <div className='p-3 border-t bg-gray-100 space-y-2'>
        <button
          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg bg-[#24CFA6] text-white shadow-sm hover:shadow-md hover:bg-[#1fb994] transition ${
            collapsed ? "justify-center" : ""
          }`}
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
              setWorkspaces((prev) => [data, ...prev]);
              router.push(`/workspace/${data.id}`);
            } else {
              alert("Failed to create workspace");
            }
          }}
          title={collapsed ? "Create Project" : ""}
        >
          <FiPlus />
          {!collapsed && "Create Project"}
        </button>

        <button
          className={`w-full inline-flex items-center justify-center gap-2 py-2 text-sm rounded-lg border hover:bg-gray-100 transition ${
            collapsed ? "justify-center" : ""
          }`}
          onClick={async () => {
            const code = prompt("Enter invite code:");
            if (!code) return;
            const res = await fetch("/api/workspaces/join", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            });
            if (res.ok) {
              const updated = await fetch("/api/workspaces");
              if (updated.ok) setWorkspaces(await updated.json());
            } else {
              alert("Invalid code");
            }
          }}
          title={collapsed ? "Join Project" : ""}
        >
          <FiUsers />
          {!collapsed && "Join Project"}
        </button>
      </div>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className='bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md'
            >
              <h3 className='text-lg font-semibold mb-2'>Delete project?</h3>
              <p className='text-sm text-gray-600 mb-5'>
                This will delete the project for <b>all members</b>. Are you sure?
              </p>
              <div className='flex justify-end gap-2'>
                <button
                  className='px-4 py-2 rounded-lg border hover:bg-gray-50'
                  onClick={() => setConfirmId(null)}
                >
                  Cancel
                </button>
                <button
                  className='px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700'
                  onClick={async () => {
                    const id = confirmId;
                    setConfirmId(null);
                    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
                    const res = await fetch(`/api/workspaces/${id}`, {
                      method: "DELETE",
                    });
                    if (!res.ok) alert("Failed to delete project");
                    if (activeId === id) router.push("/workspace");
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
