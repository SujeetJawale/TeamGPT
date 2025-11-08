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
          <header className='border-b p-4 flex justify-between'>
            <div className='font-semibold'>TeamGPT</div>

            <AuthButton />
          </header>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
