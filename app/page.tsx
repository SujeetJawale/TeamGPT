"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  const { data: session, status } = useSession();

  const router = useRouter();

  if (status === "loading") {
    return (
      <main className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f1117] transition-colors'>
        <p className='text-gray-500 animate-pulse'>Checking session...</p>
      </main>
    );
  }

  // ✅ Authenticated view
  if (status === "authenticated") {
    return (
      <main className='min-h-[92.8vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#0f1117] dark:to-[#1a1d24] text-center p-6 transition-colors'>
        <h1 className='text-3xl font-semibold mb-2 text-gray-800 dark:text-gray-100'>
          Welcome back, {session.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mb-6'>
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

  // ✅ Unauthenticated Landing Page
  return (
    <main className='relative text-center text-gray-900 dark:text-gray-100 transition-colors overflow-x-hidden'>
      {/* Fixed Navbar */}
      <nav className='fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#2a2f3a] transition-colors'>
        <div className='max-w-6xl mx-auto flex justify-between items-center p-4'>
          <h1 className='text-2xl font-bold bg-gradient-to-r from-[#24CFA6] to-blue-600 text-transparent bg-clip-text'>
            TeamGPT
          </h1>
          <div className='flex items-center gap-4'>
            <ThemeToggle /> {/* ✅ Theme toggle added here */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              onClick={() => router.push("/auth/signin")} // ✅ redirect instead of signIn("github")
              className='flex items-center justify-center gap-2 px-4 py-3 bg-[#24CFA6] text-white text-base font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-[#1fb994] transition z-10'
            >
              Launch App <FiArrowRight />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className='relative flex flex-col items-center justify-center h-[50vh] overflow-hidden px-6'>
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className='absolute top-0 left-0 w-full h-[50vh] object-cover opacity-10 dark:opacity-20'
        >
          <source src='/teamgpt-bg.mp4' type='video/mp4' />
        </video>

        {/* Hero Content */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#24CFA6] to-blue-600 bg-clip-text text-transparent'
        >
          TeamGPT
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='text-xl max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mb-10'
        >
          Collaborate, chat, and innovate with AI – empower your team to build smarter, together.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          onClick={() => signIn("github")}
          className='flex items-center justify-center gap-2 px-6 py-3 bg-[#24CFA6] text-white text-lg font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-[#1fb994] transition z-10'
        >
          Try TeamGPT Now <FiArrowRight />
        </motion.button>
      </section>

      {/* WHY SECTION */}
      <section className='flex flex-col justify-center items-center h-[50vh] bg-gray-50 dark:bg-[#12161e] transition px-6'>
        <h2 className='text-4xl font-bold mb-10 bg-gradient-to-r from-[#24CFA6] to-blue-600 text-transparent bg-clip-text'>
          Why Choose TeamGPT?
        </h2>
        <div className='grid md:grid-cols-3 gap-8 max-w-6xl'>
          {[
            {
              title: "AI Collaboration",
              desc: "Bring your team and AI together — brainstorm, plan, and build faster with shared context.",
            },
            {
              title: "Real-Time Updates",
              desc: "Stay in sync with instant updates and push notifications using Pusher integration.",
            },
            {
              title: "Secure Workspaces",
              desc: "Manage access and security with role-based permissions and NextAuth authentication.",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className='p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-[#2a2f3a] bg-white dark:bg-[#1c1f27] hover:shadow-xl transition'
            >
              <h3 className='text-xl font-semibold mb-3 text-[#24CFA6]'>{card.title}</h3>
              <p className='text-gray-600 dark:text-gray-300'>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className='flex flex-col justify-center items-center h-[50vh] bg-gray-200 dark:bg-[#0f1117] border-t border-gray-200 dark:border-[#2a2f3a] transition px-6'>
        <h2 className='text-4xl font-bold mb-10 bg-gradient-to-r from-[#24CFA6] to-blue-600 text-transparent bg-clip-text'>
          How It Works
        </h2>
        <div className='max-w-5xl grid md:grid-cols-3 gap-10'>
          {[
            {
              step: "1",
              title: "Create Workspace",
              desc: "Set up a workspace for your team. Invite collaborators instantly.",
            },
            {
              step: "2",
              title: "Collaborate with AI",
              desc: "Chat, brainstorm, and document — all inside shared AI-powered threads.",
            },
            {
              step: "3",
              title: "Stay Synced",
              desc: "Everyone stays aligned with real-time updates across every project.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className='p-6 rounded-xl border border-gray-200 dark:border-[#2a2f3a] bg-gray-50 dark:bg-[#12161e] shadow-sm hover:shadow-lg transition'
            >
              <div className='text-4xl font-bold text-[#24CFA6] mb-3'>{step.step}</div>
              <h4 className='text-lg font-semibold mb-2 text-[#24CFA6]'>{step.title}</h4>
              <p className='text-gray-600 dark:text-gray-400'>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className='flex flex-col justify-center items-center h-[50vh] bg-gray-50 dark:bg-[#12161e] border-t border-gray-200 dark:border-[#2a2f3a] transition px-6'>
        <h2 className='text-4xl font-bold mb-10 bg-gradient-to-r from-[#24CFA6] to-blue-600 text-transparent bg-clip-text'>
          Loved by Teams Everywhere
        </h2>
        <div className='max-w-6xl grid md:grid-cols-3 gap-8'>
          {[1, 2, 3].map((_, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className='p-6 bg-white dark:bg-[#1c1f27] rounded-xl shadow-md border border-gray-200 dark:border-[#2a2f3a] transition'
            >
              <p className='text-gray-600 dark:text-gray-300 italic mb-3'>
                “TeamGPT transformed how our team collaborates. It feels like having an AI teammate.”
              </p>
              <div className='flex items-center gap-2'>
                <div className='text-[#24CFA6] flex'>
                  {[...Array(5)].map((_, idx) => (
                    <FaStar key={idx} />
                  ))}
                </div>
                <span className='text-sm text-gray-500 dark:text-gray-400'>– Product Team</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className='flex flex-col justify-center items-center h-[20vh] bg-gray-300 dark:bg-[#0f1117] border-t border-gray-200 dark:border-[#2a2f3a] text-gray-600 dark:text-gray-400 transition'>
        <h3 className='text-2xl font-bold mb-3 bg-gradient-to-r from-[#24CFA6] to-blue-600 text-transparent bg-clip-text'>
          TeamGPT
        </h3>
        <p className='text-sm mb-5'>The future of collaborative AI workspaces — build smarter together.</p>
        <div className='flex gap-6 text-sm mb-3'>
          <Link href='/features' className='hover:text-[#24CFA6] transition'>
            Features
          </Link>
          <Link href='/contact' className='hover:text-[#24CFA6] transition'>
            Contact
          </Link>
          <a
            href='https://github.com/SujeetJawale/TeamGPT'
            target='_blank'
            className='hover:text-[#24CFA6] transition'
          >
            GitHub
          </a>
        </div>
        <p className='text-xs'>
          © {new Date().getFullYear()} TeamGPT — Built by{" "}
          <span className='text-[#24CFA6] font-medium'>Sujeet Jawale</span>
        </p>
      </footer>
    </main>
  );
}
