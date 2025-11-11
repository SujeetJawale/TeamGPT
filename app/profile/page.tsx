"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { FiUser, FiMail, FiCalendar } from "react-icons/fi";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <main className='min-h-[90vh] bg-gradient-to-b from-gray-50 to-white dark:from-[#0f1117] dark:to-[#13161c] flex justify-center items-center p-6'>
      <div className='w-full max-w-md bg-white/90 dark:bg-[#1c1f27] border border-gray-200 dark:border-[#2a2f3a] rounded-2xl shadow-sm p-8 transition-all'>
        <div className='flex flex-col items-center text-center space-y-4'>
          {/* <Image
            src={user?.image ?? "/default-avatar.png"}
            alt='User avatar'
            width={96}
            height={96}
            className='rounded-full ring-2 ring-[#24CFA6] shadow-md'
          /> */}

          <h1 className='text-2xl font-semibold bg-gradient-to-r from-[#24CFA6] to-blue-600 bg-clip-text text-transparent'>
            {user?.name ?? "Guest User"}
          </h1>
          <p className='text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2'>
            <FiMail /> {user?.email ?? "Not signed in"}
          </p>
        </div>

        <div className='mt-6 border-t dark:border-[#2a2f3a] pt-4 space-y-3'>
          <div className='flex items-center justify-between text-gray-700 dark:text-gray-300'>
            <span className='flex items-center gap-2'>
              <FiUser /> Role
            </span>
            <span className='font-medium'>Team Member</span>
          </div>
          <div className='flex items-center justify-between text-gray-700 dark:text-gray-300'>
            <span className='flex items-center gap-2'>
              <FiCalendar /> Joined
            </span>
            <span className='font-medium'>Nov 2025</span>
          </div>
        </div>
      </div>
    </main>
  );
}
