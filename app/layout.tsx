import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css"; // ✅ correct
import SessionWrapper from "./components/SessionWrapper";
import AuthButton from "./components/AuthButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeamGPT",
  description: "Collaborative AI chat for teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <SessionWrapper>
          <header className='border-b p-5 flex justify-between items-center shadow-sm sticky h-[70px]'>
            <div className='font-bold text-2xl pl-16 bg-gradient-to-r from-[#24CFA6] to-blue-600 text-transparent bg-clip-text'>
              TeamGPT
            </div>
            <div className='pr-12'>
              <AuthButton />
            </div>
          </header>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
