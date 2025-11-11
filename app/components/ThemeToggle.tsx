"use client";

import { useTheme } from "./ThemeProvider";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className='p-2 rounded-full border hover:bg-gray-100 dark:hover:bg-[#2a2f3a] transition'
      title='Toggle theme'
    >
      {theme === "light" ? (
        <FiMoon className='w-5 h-5 text-gray-700' />
      ) : (
        <FiSun className='w-5 h-5 text-yellow-400' />
      )}
    </button>
  );
}
