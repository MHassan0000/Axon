"use client";

import React, { useState } from "react";
import {
    Search,
    Bell,
    Plus,
    Command,

} from "lucide-react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardNav() {
    const [searchValue, setSearchValue] = useState("");

    return (
        <header className="sticky top-0 z-50 h-14 bg-zinc-950 border-b border-zinc-800/80 px-4">
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
                                className="object-contain"
                            />
                            <span className="text-lg font-semibold text-zinc-100 tracking-tight">
                                Axon
                            </span>
                        </div>
                    </Link>

                    {/* Divider */}
                    <div className="h-5 w-px bg-zinc-800 hidden md:block" />

                    {/* Create Button */}
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-lg transition-colors font-medium">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm hidden sm:block">Create</span>
                    </button>
                </div>

                {/* Center Section - Search */}
                <div className="flex-1 max-w-md mx-4 hidden sm:block">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-12 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 transition-all"
                        />
                        {/* Keyboard shortcut hint */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-zinc-600">
                            <Command className="w-3 h-3" />
                            <span className="text-xs">K</span>
                        </div>
                    </div>
                </div>

                {/* Right Section - Actions & User */}
                <div className="flex items-center gap-2">
                    {/* Mobile Search */}
                    <button className="sm:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                        <Search className="w-5 h-5 text-zinc-400" />
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors group">
                        <Bell className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
                        {/* Notification dot */}
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full" />
                    </button>

                    {/* Divider */}
                    <div className="h-6 w-px bg-zinc-800 mx-1" />

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
