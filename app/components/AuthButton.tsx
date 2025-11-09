"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <div className='text-sm text-gray-500 animate-pulse'>...</div>;

  if (!session) {
    return (
      <button
        onClick={() => signIn(undefined, { callbackUrl: "/workspace" })}
        className='px-5 py-2.5 rounded-full bg-gray-300 text-gray-500 text-[1.5vh] tracking-wider font-medium shadow-md hover:shadow-md hover:bg-gray-400 hover:text-white transition-all duration-200'
      >
        SIGN IN
      </button>
    );
  }

  return (
    <div className='flex items-center gap-4'>
      <Link
        href='/profile'
        className='mr-4 text-[1.5vh] font-medium text-[#24CFA6] hover:text-gray-400 transition'
      >
        Profile
      </Link>
      <button
        onClick={async () => {
          await signOut({ redirect: false });
          router.push("/");
        }}
        className='px-5 py-2.5 rounded-full bg-[#24CFA6] text-white text-[1.5vh] tracking-wider font-medium shadow-md hover:shadow-md hover:bg-gray-400 hover:text-white transition-all duration-200'
      >
        SIGN OUT
      </button>
    </div>
  );
}
