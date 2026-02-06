"use client";

import React, { useState, useEffect } from "react";
import {
    Settings,
    User,
    Palette,
    Bell,
    Shield,
    LogOut,
    Moon,
    Sun,
    ExternalLink,
    Check,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

export default function SettingsPage() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const theme = localStorage.getItem("theme") || "dark";
        setIsDark(theme === "dark");
    }, []);

    const toggleTheme = () => {
        const newTheme = isDark ? "light" : "dark";
        setIsDark(!isDark);
        localStorage.setItem("theme", newTheme);
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        toast.success(`Switched to ${newTheme} mode`);
    };

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            {/* Page Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            Settings
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Manage your preferences
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="max-w-2xl space-y-6">
                    {/* Profile Section */}
                    <section className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Profile
                        </h2>

                        <div className="flex items-center gap-4">
                            {user?.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt={user.fullName || "User"}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-zinc-600 dark:text-zinc-300">
                                        {(user?.fullName || user?.primaryEmailAddress?.emailAddress || "U")[0]?.toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                                    {user?.fullName || "User"}
                                </p>
                                <p className="text-sm text-zinc-500">
                                    {user?.primaryEmailAddress?.emailAddress}
                                </p>
                            </div>

                        </div>
                    </section>

                    {/* Appearance Section */}
                    <section className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Appearance
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        Theme
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Choose your preferred color scheme
                                    </p>
                                </div>
                                <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 rounded-lg p-1">
                                    <button
                                        onClick={() => !isDark || toggleTheme()}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${isDark
                                            ? "text-zinc-600 dark:text-zinc-400"
                                            : "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                                            }`}
                                    >
                                        <Sun className="w-4 h-4" />
                                        Light
                                    </button>
                                    <button
                                        onClick={() => isDark || toggleTheme()}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${isDark
                                            ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                                            : "text-zinc-600 dark:text-zinc-400"
                                            }`}
                                    >
                                        <Moon className="w-4 h-4" />
                                        Dark
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notifications Section */}
                    <section className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Notifications
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        Email notifications
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Receive updates via email
                                    </p>
                                </div>
                                <div className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-xs font-medium text-zinc-500">
                                    Coming Soon
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Account Section */}
                    <section className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Account
                        </h2>

                        <div className="space-y-3">
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-3 w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
