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
      className={`relative border-r border-gray-200 dark:border-[#2a2f3a] flex flex-col
      bg-white dark:bg-[#12161e] text-gray-800 dark:text-gray-100
      transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-72"}`}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className='absolute -right-3 top-4 z-20 bg-white dark:bg-[#1c1f27] border border-gray-200 dark:border-[#2a2f3a]
                   rounded-full p-1.5 shadow-sm hover:bg-gray-50 dark:hover:bg-[#2a2f3a] transition'
      >
        {collapsed ? (
          <FiChevronRight className='text-gray-600 dark:text-gray-300' />
        ) : (
          <FiChevronLeft className='text-gray-600 dark:text-gray-300' />
        )}
      </button>

      {/* Header */}
      <div
        className={`px-4 py-3 border-b border-gray-200 dark:border-[#2a2f3a]
        bg-gradient-to-r from-[#24CFA6]/10 to-blue-100/40
        dark:from-[#1a1f2a] dark:to-[#1c1f27]
        flex items-center gap-2`}
      >
        <h2
          className={`text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide transition-opacity duration-300 ${
            collapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
        >
          Projects
        </h2>
      </div>

      {/* Workspace list */}
      <div
        className='p-3 flex-1 overflow-y-auto scrollbar-hide
        bg-gradient-to-b from-[#24CFA6]/10 to-blue-100/20
        dark:from-[#10141c] dark:to-[#1b1f27]'
      >
        {loading && (
          <div className='space-y-2'>
            <div className='h-8 bg-gray-100 dark:bg-[#2a2f3a] rounded animate-pulse' />
            <div className='h-8 bg-gray-100 dark:bg-[#2a2f3a] rounded animate-pulse' />
            <div className='h-8 bg-gray-100 dark:bg-[#2a2f3a] rounded animate-pulse' />
          </div>
        )}

        {!loading && workspaces.length === 0 && (
          <div className={`text-sm text-gray-500 dark:text-gray-400 ${collapsed ? "text-center" : ""}`}>
            No projects
          </div>
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
                      ? "bg-[#24CFA6]/10 text-[#106e5d] ring-1 ring-[#24CFA6]/40 dark:bg-[#1c2b2b] dark:text-[#24CFA6]"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1c2230]"
                  } ${collapsed ? "text-center px-1" : ""}`}
                  title={collapsed ? ws.name : ""}
                >
                  {collapsed ? ws.name.charAt(0).toUpperCase() : ws.name}
                </Link>

                {!collapsed && (
                  <button
                    aria-label='Delete project'
                    onClick={() => setConfirmId(ws.id)}
                    className='opacity-0 group-hover:opacity-100 ml-2 p-2 rounded-lg text-gray-500 dark:text-gray-400
                               hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-[#3a1f1f]/40 transition'
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
      <div className='p-3 border-t border-gray-200 dark:border-[#2a2f3a] bg-gray-100 dark:bg-[#141821] space-y-2'>
        <button
          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg
                      bg-[#24CFA6] text-white shadow-sm hover:shadow-md hover:bg-[#1fb994] transition
                      ${collapsed ? "justify-center" : ""}`}
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
          className={`w-full inline-flex items-center justify-center gap-2 py-2 text-sm rounded-lg border
                      border-gray-300 dark:border-[#2a2f3a] text-gray-700 dark:text-gray-200
                      hover:bg-gray-100 dark:hover:bg-[#1c2230] transition
                      ${collapsed ? "justify-center" : ""}`}
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
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className='bg-white dark:bg-[#1c1f27] rounded-2xl shadow-xl p-6 w-[90%] max-w-md border border-gray-200 dark:border-[#2a2f3a]'
            >
              <h3 className='text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100'>Delete project?</h3>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-5'>
                This will delete the project for <b>all members</b>. Are you sure?
              </p>
              <div className='flex justify-end gap-2'>
                <button
                  className='px-4 py-2 rounded-lg border border-gray-300 dark:border-[#2a2f3a]
                             hover:bg-gray-50 dark:hover:bg-[#2a2f3a] text-gray-700 dark:text-gray-200'
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
