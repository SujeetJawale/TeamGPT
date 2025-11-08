"use client";

export default function JoinProjectButton() {
  const joinProject = async () => {
    const code = prompt("Enter invite code or workspace ID:");
    if (!code) return;

    const res = await fetch("/api/workspaces/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      alert("✅ Joined successfully!");
      location.reload();
    } else {
      alert("❌ Invalid code or workspace ID.");
    }
  };

  return (
    <button
      className='mt-auto py-2 text-sm border rounded hover:bg-green-600 hover:text-white transition'
      onClick={joinProject}
    >
      Join Project
    </button>
  );
}
