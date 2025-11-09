"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className='min-h-screen flex items-center justify-center bg-gray-50'>
        <p className='text-gray-500 animate-pulse'>Checking session...</p>
      </main>
    );
  }

  // ✅ Authenticated view
  if (status === "authenticated") {
    return (
      <main className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-center p-6'>
        <h1 className='text-3xl font-semibold mb-2'>Welcome back, {session.user?.name?.split(" ")[0]} 👋</h1>
        <p className='text-gray-600 mb-6'>
          You’re signed in to <span className='font-semibold'>TeamGPT</span>.
        </p>
        <Link
          href='/workspace'
          className='px-6 py-3 bg-[#24CFA6] text-white rounded-lg shadow-md hover:shadow-lg hover:bg-[#1fb994] transition-all'
        >
          Go to Workspace
        </Link>
      </main>
    );
  }

  // ✅ Landing page (unauthenticated)
  return (
    <main className='h-screen flex flex-col start bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-center'>
      {/* Hero Section */}
      <section className='flex flex-col items-center justify-center h-[calc(100vh-42vh)] py-20 px-6 relative overflow-hidden'>
        {/* Subtle Animated Background */}
        <video
          autoPlay
          muted
          loop
          className='absolute top-0 left-0 w-full h-full object-cover bg-center opacity-10'
        >
          <source src='/teamgpt-bg.mp4' type='video/mp4' />
        </video>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-6xl md:text-7xl font-bold mb-3 text-gray-800 bg-gradient-to-r from-[#24CFA6] to-blue-600 text-transparent bg-clip-text'
        >
          TeamGPT
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className='text-gray-600 mb-10 text-xl max-w-2xl'
        >
          Collaborate, chat, and innovate with AI – together in one workspace.
        </motion.p>

        {/* Sign In Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 z-10'>
          <button
            onClick={() => signIn("github")}
            className='flex items-center px-5 py-3 bg-gray-700 text-[1.5vh] text-white rounded-lg shadow-sm hover:bg-gray-900 transition'
          >
            TRY NOW
          </button>
        </div>
      </section>

      {/* Product Info Section */}
      <section className='px-8 py-16 bg-white h-[30vh]'>
        <h2 className='text-4xl font-semibold mb-4 bg-gradient-to-r from-[#24CFA6] to-blue-600 bg-clip-text text-transparent'>
          Why TeamGPT?
        </h2>
        <div className='grid md:grid-cols-3 gap-8'>
          {[
            {
              title: "Collaborate Seamlessly",
              desc: "Invite your team and work together on shared AI chats and prompts.",
            },
            {
              title: "Real-time Sync",
              desc: "Built with Pusher for instant updates — no refresh needed.",
            },
            {
              title: "Smart & Secure",
              desc: "Powered by OpenAI and secured via NextAuth — your data stays safe.",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className='p-6 rounded-2xl shadow-md border bg-white hover:shadow-lg transition'
            >
              <h3 className='text-xl font-semibold mb-3 text-[#24CFA6]'>{card.title}</h3>
              <p className='text-gray-600'>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className='p-6 h-[6vh] border-t bg-gray-50 text-gray-600 flex flex-col md:flex-row items-center justify-between'>
        <p>
          © {new Date().getFullYear()} TeamGPT — Made by{" "}
          <span className='font-medium text-[#24CFA6]'>Sujeet Jawale</span>
        </p>
        <Link href='/contact' className='text-[#24CFA6] font-medium hover:underline mt-2 md:mt-0'>
          Contact Us
        </Link>
      </footer>
    </main>
  );
}
