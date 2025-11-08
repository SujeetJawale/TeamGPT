"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div className='text-sm text-gray-500'>...</div>;

  if (!session) {
    return (
      <button
        className='px-3 py-1 rounded bg-blue-600 text-white'
        onClick={() => signIn(undefined, { callbackUrl: "/workspace" })}
      >
        Sign in
      </button>
    );
  }

  return (
    <div className='flex items-center gap-3'>
      <Link href='/profile' className='text-sm underline '>
        Profile
      </Link>
      <button className='px-3 py-1 rounded border' onClick={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </button>
    </div>
  );
}
