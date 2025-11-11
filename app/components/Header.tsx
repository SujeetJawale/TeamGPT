"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import AuthButton from "./AuthButton";

export default function Header() {
  const { data: session } = useSession();
  const target = session ? "/" : "/";

  return (
    <header className='border-b p-5 flex justify-between items-center shadow-sm sticky h-[70px] bg-white/70 dark:bg-[#1c1f27]/90 backdrop-blur'>
      {/* ✅ Clickable TeamGPT logo */}
      <Link
        href={target}
        className='font-bold text-2xl pl-16 bg-gradient-to-r from-[#24CFA6] to-blue-600 text-transparent bg-clip-text hover:opacity-80 transition'
      >
        TeamGPT
      </Link>

      <div className='flex items-center gap-4 pr-12'>
        <ThemeToggle />
        <AuthButton />
      </div>
    </header>
  );
}
