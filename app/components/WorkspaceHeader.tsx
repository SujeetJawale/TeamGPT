"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiCopy, FiCheck } from "react-icons/fi";

type Member = {
  membershipId: string;
  userId: string;
  name: string | null;
  email: string | null;
  role: "owner" | "admin" | "member" | string;
};

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
  const [copiedKey, setCopiedKey] = useState<null | "id" | "invite">(null);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const initials = useMemo(() => {
    const n = (userName ?? "User").trim();
    const parts = n.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [userName]);

  const copy = async (text: string, key: "id" | "invite") => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1200);
  };

  // ✅ Fetch current user’s role immediately (not just on showDetails)
  useEffect(() => {
    const loadRole = async () => {
      const res = await fetch(`/api/workspaces/${id}/members`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          members: Member[];
          me: { userId: string; role: string };
        };
        setCurrentUserRole(data.me.role);
      }
    };
    loadRole();
  }, [id]);

  // ✅ Load members only when showing details
  useEffect(() => {
    const loadMembers = async () => {
      if (!showDetails || members) return;
      setLoadingMembers(true);
      const res = await fetch(`/api/workspaces/${id}/members`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          members: Member[];
        };
        setMembers(data.members);
      }
      setLoadingMembers(false);
    };
    loadMembers();
  }, [showDetails, id, members]);

  const isAdmin = currentUserRole === "owner" || currentUserRole === "admin";
  const isOwner = currentUserRole === "owner";

  const removeMember = async (targetUserId: string) => {
    setMembers((prev) => (prev ? prev.filter((m) => m.userId !== targetUserId) : prev));
    const res = await fetch(`/api/workspaces/${id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: targetUserId }),
    });
    if (!res.ok) alert("Failed to remove member");
  };

  return (
    <header
      className='sticky top-0 border-b border-gray-200 dark:border-[#2a2f3a]
                 bg-white/90 dark:bg-[#12161e]/95 backdrop-blur transition-colors'
    >
      <div className='mx-10 px-4 sm:px-6'>
        <div className='h-16 flex items-center justify-between'>
          {/* Left section: name and invite */}
          <div className='min-w-0'>
            <div className='flex items-center gap-3'>
              <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-100 truncate sm:text-2xl'>
                {name ?? "Workspace"}
              </h2>

              {/* ✅ Always show if owner */}
              {isOwner && inviteCode && (
                <span className='hidden sm:inline-block text-xs px-2.5 py-1 rounded-full ring-1 ring-[#24CFA6]/30 text-[#106e5d] bg-[#24CFA6]/10 dark:text-[#24CFA6] dark:ring-[#24CFA6]/50 dark:bg-[#1c2b2b]'>
                  Invite enabled
                </span>
              )}
            </div>
            <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate'>ID: {id}</p>
          </div>

          {/* Right: details + avatar */}
          <div className='flex items-center gap-2 sm:gap-3'>
            <button
              onClick={() => setShowDetails((v) => !v)}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg
                         border border-gray-300 dark:border-[#2a2f3a]
                         bg-white dark:bg-[#1c1f27]
                         text-gray-700 dark:text-gray-200
                         hover:bg-gray-50 dark:hover:bg-[#2a2f3a] transition'
            >
              <span className='hidden sm:inline'>{showDetails ? "Hide details" : "Show details"}</span>
              <FiChevronDown className={`transition-transform ${showDetails ? "rotate-180" : ""}`} />
            </button>

            <div
              className='h-9 w-9 rounded-full grid place-items-center select-none
                         bg-gradient-to-br from-[#24CFA6] to-blue-500 text-white
                         text-sm font-semibold shadow-sm'
              title={userName ?? "User"}
            >
              {initials}
            </div>
          </div>
        </div>
      </div>

      {/* Details panel */}
      <AnimatePresence initial={false}>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className='overflow-hidden border-t border-gray-200 dark:border-[#2a2f3a]
                       bg-white/90 dark:bg-[#12161e]/95 backdrop-blur transition-colors'
          >
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className='mx-auto max-w-5xl px-6 py-6'
            >
              {/* Info rows */}
              <div className='grid sm:grid-cols-2 gap-4'>
                {isOwner && inviteCode && (
                  <InfoRow
                    label='Invite Code'
                    value={inviteCode}
                    copied={copiedKey === "invite"}
                    onCopy={() => copy(inviteCode, "invite")}
                  />
                )}
              </div>

              {/* Divider */}
              <div className='my-6 h-px bg-gray-200 dark:bg-[#2a2f3a]' />

              {/* Members Section */}
              <div>
                <h4 className='text-md font-semibold text-gray-800 dark:text-gray-100 mb-2'>
                  Members & Access
                </h4>

                <div
                  className='rounded-xl border border-gray-200 dark:border-[#2a2f3a]
                             bg-white dark:bg-[#1c1f27] shadow-sm divide-y
                             divide-gray-200 dark:divide-[#2a2f3a]'
                >
                  {loadingMembers && (
                    <div className='px-4 py-4 text-sm text-gray-500 dark:text-gray-400'>Loading members…</div>
                  )}

                  {!loadingMembers && members?.length
                    ? members.map((m) => (
                        <div
                          key={m.userId}
                          className='flex items-center justify-between px-4 py-3
                                   hover:bg-gray-50 dark:hover:bg-[#232837] transition'
                        >
                          <div>
                            <p className='text-sm font-medium text-gray-800 dark:text-gray-100'>
                              {m.name ?? m.email ?? "Unnamed User"}
                            </p>
                            <span
                              className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                                m.role === "owner"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                  : m.role === "admin"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-200"
                              }`}
                            >
                              {m.role}
                            </span>
                          </div>

                          {isAdmin && m.role !== "owner" && (
                            <button
                              onClick={() => removeMember(m.userId)}
                              className='text-sm px-3 py-1.5 rounded-lg border
                                       border-gray-300 dark:border-[#2a2f3a]
                                       text-gray-700 dark:text-gray-200
                                       hover:bg-red-50 hover:text-red-600
                                       dark:hover:bg-[#3a1f1f]/40 dark:hover:text-red-300
                                       transition'
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))
                    : !loadingMembers && (
                        <div className='text-sm text-gray-500 dark:text-gray-400 px-4 py-4 text-center'>
                          No members found.
                        </div>
                      )}
                </div>

                <p className='text-xs text-gray-500 dark:text-gray-400 mt-3'>
                  Owners can manage all settings. Admins can invite or remove members.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function InfoRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div
      className='flex items-center justify-between gap-3 rounded-lg
                 border border-gray-200 dark:border-[#2a2f3a]
                 px-3 py-2 bg-white dark:bg-[#1c1f27] transition-colors'
    >
      <div className='min-w-0'>
        <p className='text-xs text-gray-500 dark:text-gray-400'>{label}</p>
        <p className='text-sm font-medium text-gray-800 dark:text-gray-100 truncate'>{value}</p>
      </div>
      <button
        onClick={onCopy}
        className='shrink-0 inline-flex items-center gap-2 rounded-md
                   border border-gray-300 dark:border-[#2a2f3a]
                   px-2.5 py-1.5 text-sm
                   bg-white dark:bg-[#232733]
                   text-gray-700 dark:text-gray-200
                   hover:bg-gray-50 dark:hover:bg-[#2a2f3a] transition'
      >
        {copied ? (
          <>
            <FiCheck className='text-emerald-600 dark:text-emerald-300' /> Copied
          </>
        ) : (
          <>
            <FiCopy /> Copy
          </>
        )}
      </button>
    </div>
  );
}
