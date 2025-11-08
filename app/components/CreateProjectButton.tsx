"use client";
import { useRouter } from "next/navigation";

export default function CreateProjectButton() {
  const router = useRouter();

  const handleCreate = async () => {
    const name = prompt("Enter new project name:");
    if (!name) return;
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/workspace/${data.id}`);
    }
  };

  return (
    <button onClick={handleCreate} className='mt-4 px-4 py-2 bg-blue-600 text-white rounded'>
      + Create Project
    </button>
  );
}
