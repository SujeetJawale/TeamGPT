"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiCopy, FiCheck, FiUserMinus, FiLogOut } from "react-icons/fi";

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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

  // fetch members only when details open (and not already loaded)
  useEffect(() => {
    const load = async () => {
      if (!showDetails || members) return;
      setLoadingMembers(true);
      const res = await fetch(`/api/workspaces/${id}/members`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          members: Member[];
          me: { userId: string; role: string };
        };
        setMembers(data.members);
        setCurrentUserId(data.me.userId);
        setCurrentUserRole(data.me.role);
      }
      setLoadingMembers(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDetails]);

  const isAdmin = currentUserRole === "owner" || currentUserRole === "admin";

  const removeMember = async (targetUserId: string) => {
    // optimistic update
    setMembers((prev) => (prev ? prev.filter((m) => m.userId !== targetUserId) : prev));
    const res = await fetch(`/api/workspaces/${id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: targetUserId }),
    });
    if (!res.ok) {
      // revert on failure
      const refetch = await fetch(`/api/workspaces/${id}/members`, { cache: "no-store" });
      if (refetch.ok) {
        const data = await refetch.json();
        setMembers(data.members);
      }
      alert("Failed to remove member");
    }
  };

  const leaveGroup = async () => {
    const ok = confirm("Leave this workspace?");
    if (!ok) return;
    const res = await fetch(`/api/workspaces/${id}/leave`, { method: "POST" });
    if (res.ok) {
      // redirect out (you can also use next/navigation)
      window.location.href = "/workspace";
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j?.error ?? "Failed to leave workspace");
    }
  };

  return (
    <header className='sticky bg-gradient-to-r from-[#24CFA6]/10 to-blue-100/40 top-0'>
      <div className='mx-10  px-4 sm:px-6'>
        <div className='h-16 flex items-center justify-between'>
          <div className='min-w-0'>
            <div className='flex items-center  gap-3'>
              <h2 className='truncate text-xl sm:text-2xl font-semibold bg-gray-600 bg-clip-text text-transparent'>
                {name ?? "Workspace"}
              </h2>
              {inviteCode && (
                <span className='hidden sm:inline-block text-xs px-2.5 py-1 rounded-full ring-1 ring-[#24CFA6]/30 text-[#106e5d] bg-[#24CFA6]/10'>
                  Invite enabled
                </span>
              )}
            </div>
            <p className='mt-0.5 text-xs text-gray-500 truncate'>ID: {id}</p>
          </div>

          <div className='flex items-center gap-2 sm:gap-3'>
            {/* Toggle details */}
            <button
              onClick={() => setShowDetails((v) => !v)}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 transition'
            >
              <span className='hidden sm:inline'>{showDetails ? "Hide details" : "Show details"}</span>
              <FiChevronDown className={`transition-transform ${showDetails ? "rotate-180" : ""}`} />
            </button>

            {/* Avatar */}
            <div
              className='h-9 w-9 rounded-full grid place-items-center select-none bg-gradient-to-br from-[#24CFA6] to-blue-500 text-white text-sm font-semibold shadow-sm'
              title={userName ?? "User"}
            >
              {initials}
            </div>
          </div>
        </div>
      </div>

      {/* Details panel */}
      {/* Details panel */}
      <AnimatePresence initial={false}>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className='overflow-hidden border-t bg-gradient-to-b from-white/80 to-gray-50/70 backdrop-blur'
          >
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className='mx-auto max-w-5xl px-6 py-6'
            >
              {/* Info rows */}
              <div className='mt-6 grid sm:grid-cols-2 gap-4'>
                {inviteCode && (
                  <InfoRow
                    label='Invite Code'
                    value={inviteCode}
                    copied={copiedKey === "invite"}
                    onCopy={() => copy(inviteCode, "invite")}
                  />
                )}
              </div>

              {/* Divider */}
              <div className='my-6 h-px bg-gray-200/70' />

              {/* Members Section */}
              <div>
                <h4 className='text-md font-semibold text-gray-800 mb-2'>Members & Access</h4>

                <div className='rounded-xl border bg-white/70 shadow-sm divide-y'>
                  {members?.length ? (
                    members.map((m) => (
                      <div
                        key={m.userId}
                        className='flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition'
                      >
                        <div>
                          <p className='text-sm font-medium text-gray-800'>
                            {m.name ?? m.email ?? "Unnamed User"}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              m.role === "owner"
                                ? "bg-purple-100 text-purple-700"
                                : m.role === "admin"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {m.role}
                          </span>
                        </div>
                        <div>
                          {isAdmin && m.role !== "owner" && (
                            <button
                              onClick={() => removeMember(m.userId)}
                              className='text-sm px-3 py-1.5 rounded-lg border hover:bg-red-50 hover:text-red-600 transition'
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-sm text-gray-500 px-4 py-4 text-center'>No members found.</div>
                  )}
                </div>

                <p className='text-xs text-gray-500 mt-3'>
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
    <div className='flex items-center justify-between gap-3 rounded-lg border px-3 py-2 bg-white'>
      <div className='min-w-0'>
        <p className='text-xs text-gray-500'>{label}</p>
        <p className='text-sm font-medium text-gray-800 truncate'>{value}</p>
      </div>
      <button
        onClick={onCopy}
        className='shrink-0 inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50 transition'
      >
        {copied ? (
          <>
            <FiCheck className='text-emerald-600' /> Copied
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

function RoleBadge({ role }: { role: string }) {
  const r = role?.toLowerCase?.() ?? "member";
  const styles: Record<string, string> = {
    owner: "bg-purple-100 text-purple-700 ring-purple-200",
    admin: "bg-blue-100 text-blue-700 ring-blue-200",
    member: "bg-gray-100 text-gray-700 ring-gray-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] ring-1 ${styles[r] ?? styles.member}`}>{r}</span>
  );
}
