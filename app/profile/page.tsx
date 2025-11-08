"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name ?? "");

  const save = async () => {
    await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    router.push("/workspace");
  };

  return (
    <main className='p-6 max-w-md mx-auto'>
      <h2 className='text-xl font-semibold mb-4'>Profile</h2>
      <label className='block text-sm mb-1'>Email</label>
      <input
        disabled
        value={session?.user?.email ?? ""}
        className='w-full border p-2 rounded mb-3 bg-gray-100'
      />
      <label className='block text-sm mb-1'>Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className='w-full border p-2 rounded mb-4'
      />
      <div className='flex gap-2'>
        <button onClick={save} className='px-3 py-1 bg-blue-600 text-white rounded'>
          Save
        </button>
        <button onClick={() => router.push("/workspace")} className='px-3 py-1 border rounded'>
          Back
        </button>
      </div>
    </main>
  );
}
