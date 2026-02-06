"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import {
    Search,
    Plus,
    Sun,
    Moon,
    LayoutGrid,
    FolderKanban,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LazyGlobalSearch } from "./LazyComponents";
import NotificationBell from "@/components/notifications/NotificationBell";

// Placeholder for lazy-loaded search
function SearchPlaceholder() {
    return (
        <div className="flex items-center gap-2 w-full max-w-md px-3 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <Search className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">Search...</span>
        </div>
    );
}

export default function DashboardNav() {
    const [isDark, setIsDark] = useState(true);
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const createMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Initialize theme from localStorage
    useEffect(() => {
        const theme = localStorage.getItem("theme") || "dark";
        setIsDark(theme === "dark");
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
                setShowCreateMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = isDark ? "light" : "dark";
        setIsDark(!isDark);
        localStorage.setItem("theme", newTheme);
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <header className="sticky top-0 z-50 h-14 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/80 px-4 pl-14 lg:pl-4 transition-colors duration-200">
            <div className="flex items-center justify-between h-full gap-4">
                {/* Left Section - Logo */}
                <div className="flex items-center gap-3">
                    {/* Logo */}
                    <Link href="/">
                        <div className="flex items-center gap-2.5">
                            <Image
                                src="/images/Axonlogo.png"
                                alt="Axon"
                                width={35}
                                height={35}
                                className="object-contain dark:invert-0"
                            />
                            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                Axon
                            </span>
                        </div>
                    </Link>

                    {/* Divider */}
                    <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

                    {/* Create Button with Dropdown */}
                    <div className="relative" ref={createMenuRef}>
                        <button
                            onClick={() => setShowCreateMenu(!showCreateMenu)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 rounded-lg transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm hidden sm:block">Create</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showCreateMenu && (
                            <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg py-2 z-50">
                                <button
                                    onClick={() => {
                                        router.push("/dashboard?create=workspace");
                                        setShowCreateMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <LayoutGrid className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Workspace</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Organize your projects
                                        </p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        router.push("/dashboard?create=board");
                                        setShowCreateMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <FolderKanban className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Board</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Kanban-style board
                                        </p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Section - Search */}
                <div className="flex-1 max-w-md mx-4 hidden sm:flex justify-center">
                    <Suspense fallback={<SearchPlaceholder />}>
                        <LazyGlobalSearch />
                    </Suspense>
                </div>

                {/* Right Section - Actions & User */}
                <div className="flex items-center gap-2">
                    {/* Mobile Search */}
                    <button className="sm:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <Search className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {isDark ? (
                            <Sun className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
                        ) : (
                            <Moon className="w-5 h-5 text-zinc-500 group-hover:text-zinc-700 transition-colors" />
                        )}
                    </button>

                    {/* Notifications */}
                    <NotificationBell />

                    {/* Divider */}
                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                    {/* User Avatar */}
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: "w-8 h-8 rounded-lg",
                            },
                        }}
                    />
                </div>
            </div>
        </header>
    );
}
