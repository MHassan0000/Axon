"use client";

import React from "react";
import {
    MessageSquare,
    Bell,
    CheckCircle,
    Clock,
    Users,
    ArrowRight,
} from "lucide-react";

export default function MessagesPage() {
    // Placeholder activity data
    const activities = [
        {
            id: 1,
            type: "comment",
            message: "Activity feed will show comments and updates",
            time: "Coming soon",
        },
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            {/* Page Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            Messages
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Activity and notifications
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                {/* Coming Soon State */}
                <div className="flex flex-col items-center justify-center h-full min-h-100">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                            <Bell className="w-10 h-10 text-zinc-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">0</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                        No messages yet
                    </h2>
                    <p className="text-sm text-zinc-500 text-center max-w-sm mb-8">
                        Your activity feed will show card comments, mentions, and updates from your team.
                    </p>

                    {/* Feature Preview */}
                    <div className="w-full max-w-md space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    Card Comments
                                </p>
                                <p className="text-xs text-zinc-500">
                                    Get notified when someone comments
                                </p>
                            </div>
                            <Clock className="w-4 h-4 text-zinc-400" />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    Task Updates
                                </p>
                                <p className="text-xs text-zinc-500">
                                    See when cards are moved or completed
                                </p>
                            </div>
                            <Clock className="w-4 h-4 text-zinc-400" />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    Mentions
                                </p>
                                <p className="text-xs text-zinc-500">
                                    Get notified when you're mentioned
                                </p>
                            </div>
                            <Clock className="w-4 h-4 text-zinc-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
