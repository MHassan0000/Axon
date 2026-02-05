"use client";

import React from "react";
import {
    Lock,
    Globe,
    Users,
    Filter,
    LayoutGrid,
    List,
    MoreHorizontal,
    Plus,
} from "lucide-react";

/*
  Board Header
  - Board name
  - Privacy status (private/team)
  - Members list
  - Filters button
  - View toggle (board/list)
*/

interface BoardHeaderProps {
    boardName: string;
    isPrivate?: boolean;
    memberCount?: number;
}

export default function BoardHeader({
    boardName = "Product Roadmap",
    isPrivate = false,
    memberCount = 5,
}: BoardHeaderProps) {
    return (
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-zinc-800">
            {/* Left Section - Board Info */}
            <div className="flex items-center gap-3">
                {/* Board Name */}
                <h1 className="text-lg font-semibold text-zinc-100">{boardName}</h1>

                {/* Privacy Badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 rounded-md">
                    {isPrivate ? (
                        <>
                            <Lock className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-xs text-zinc-400">Private</span>
                        </>
                    ) : (
                        <>
                            <Globe className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-xs text-zinc-400">Team</span>
                        </>
                    )}
                </div>

                {/* Divider */}
                <div className="h-5 w-px bg-zinc-700" />

                {/* Members */}
                <div className="flex items-center">
                    {/* Avatar Stack */}
                    <div className="flex -space-x-2">
                        {[...Array(Math.min(memberCount, 4))].map((_, i) => (
                            <div
                                key={i}
                                className="w-7 h-7 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center"
                            >
                                <span className="text-xs text-zinc-400">
                                    {String.fromCharCode(65 + i)}
                                </span>
                            </div>
                        ))}
                        {memberCount > 4 && (
                            <div className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center">
                                <span className="text-xs text-zinc-400">+{memberCount - 4}</span>
                            </div>
                        )}
                    </div>

                    {/* Add Member */}
                    <button className="ml-2 p-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                        <Plus className="w-4 h-4 text-zinc-400" />
                    </button>
                </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
                {/* Filter Button */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                    <Filter className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-400 hidden sm:block">Filter</span>
                </button>

                {/* View Toggle */}
                <div className="flex items-center bg-zinc-800 rounded-md p-0.5">
                    <button className="p-1.5 rounded bg-zinc-700 text-zinc-100">
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded text-zinc-400 hover:text-zinc-300 transition-colors">
                        <List className="w-4 h-4" />
                    </button>
                </div>

                {/* More Options */}
                <button className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-zinc-400" />
                </button>
            </div>
        </div>
    );
}
