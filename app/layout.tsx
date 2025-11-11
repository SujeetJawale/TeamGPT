import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import SessionWrapper from "./components/SessionWrapper";
import ThemeProvider from "./components/ThemeProvider";
import Header from "./components/Header"; // ✅ import here

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
  icons: {
    icon: "/favicon.ico", // 👈 path relative to /public
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className='transition-colors duration-300 bg-white dark:bg-[#0f1117] text-gray-900 dark:text-gray-100'>
        <ThemeProvider>
          <SessionWrapper>
            <Header /> {/* ✅ now safely a client component */}
            {children}
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
