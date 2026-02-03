"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    console.log("Saved theme from localStorage:", savedTheme);
    
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
      console.log("Removed dark class, classList:", document.documentElement.classList);
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      console.log("Added dark class, classList:", document.documentElement.classList);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      console.log("Switched to DARK mode");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      console.log("Switched to LIGHT mode");
    }
    
    console.log("HTML classList after toggle:", document.documentElement.classList);
  };

  if (!mounted) {
    return (
      <button
        className="fixed top-6 right-6 z-50 p-3 rounded-lg bg-zinc-800 border border-zinc-700 opacity-0"
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
      {/* Debug indicator */}
      <span className="text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
        {isDark ? "Dark" : "Light"}
      </span>
      
      <button
        onClick={toggleTheme}
        className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={isDark}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
        ) : (
          <Moon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
        )}
      </button>
    </div>
  );
}
