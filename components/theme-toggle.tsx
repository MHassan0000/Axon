"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true); // Default to dark mode
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      // Default to dark mode
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Prevent flash of unstyled content during SSR
  if (!mounted) {
    return (
      <button
        className="fixed top-6 right-6 z-50 p-3 rounded-lg bg-zinc-800 border border-zinc-700 opacity-0"
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-lg bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 dark:border-zinc-600 hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-all duration-300 shadow-lg hover:shadow-xl"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-zinc-100" />
      ) : (
        <Moon className="w-5 h-5 text-zinc-900" />
      )}
    </button>
  );
}
