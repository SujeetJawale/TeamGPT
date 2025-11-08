"use client";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main className='p-6 text-gray-500'>Checking session...</main>;
  }

  if (status === "authenticated") {
    return (
      <main className='p-6 flex flex-col items-start gap-4'>
        <h1 className='text-2xl font-semibold'>Welcome back, {session.user?.name?.split(" ")[0]} 👋</h1>
        <p className='text-gray-600'>
          You’re signed in to <span className='font-semibold'>TeamGPT</span>.
        </p>
        <Link href='/workspace' className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          Go to workspace
        </Link>
      </main>
    );
  }

  // not signed in
  return (
    <main className='p-6 flex flex-col items-start gap-4'>
      <h1 className='text-2xl font-semibold'>TeamGPT</h1>
      <p className='text-gray-600'>Collaborative AI chat for teams.</p>
      <button onClick={() => signIn("google")} className='px-4 py-2 bg-blue-600 text-white rounded'>
        Sign in with Google
      </button>
      <button
        onClick={() => signIn("github")}
        className='px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900'
      >
        Sign in with GitHub
      </button>
    </main>
  );
}
