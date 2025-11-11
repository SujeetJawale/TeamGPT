"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0f1117] text-center text-gray-900 dark:text-gray-100 px-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='max-w-md w-full p-8 rounded-2xl border border-gray-200 dark:border-[#2a2f3a] bg-white dark:bg-[#1c1f27] shadow-lg'
      >
        <h1 className='text-4xl font-bold mb-2 bg-gradient-to-r from-[#24CFA6] to-blue-600 bg-clip-text text-transparent'>
          Welcome to TeamGPT
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mb-8 text-sm'>
          Sign in to continue collaborating with your team.
        </p>

        {/* Sign-in options */}
        <div className='flex flex-col gap-4'>
          <button
            onClick={() => signIn("google", { callbackUrl: "/workspace" })}
            className='flex items-center justify-center gap-3 py-3 w-full border border-gray-300 dark:border-[#2a2f3a] rounded-lg bg-white dark:bg-[#12161e] hover:bg-gray-100 dark:hover:bg-[#2a2f3a] transition'
          >
            <FcGoogle size={22} /> Sign in with Google
          </button>

          <button
            onClick={() => signIn("github", { callbackUrl: "/workspace" })}
            className='flex items-center justify-center gap-3 py-3 w-full rounded-lg bg-gray-800 hover:bg-gray-900 text-white transition'
          >
            <FaGithub size={20} /> Sign in with GitHub
          </button>
        </div>

        <p className='text-xs text-gray-500 dark:text-gray-400 mt-8'>
          By signing in, you agree to our{" "}
          <Link href='/terms' className='text-[#24CFA6] hover:underline'>
            Terms
          </Link>{" "}
          and{" "}
          <Link href='/privacy' className='text-[#24CFA6] hover:underline'>
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>

      <p className='text-xs text-gray-500 dark:text-gray-400 mt-8'>
        © {new Date().getFullYear()} TeamGPT. Built by <span className='text-[#24CFA6]'>Sujeet Jawale</span>.
      </p>
    </main>
  );
}
