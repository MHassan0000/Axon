"use client";

import React from "react";
import { FolderKanban, Plus, ArrowRight, Sparkles } from "lucide-react";

/*
  Dashboard Page - Empty State
  - Professional and visually appealing
  - Clean design ready for backend integration
  - Welcoming message for new users
*/

export default function DashboardPage() {
    return (
        <div className="flex flex-col h-full bg-black">
            {/* Page Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-100">Dashboard</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">Welcome back to your workspace</p>
                </div>

            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto p-6">
                {/* Empty State */}
                <div className="flex flex-col items-center justify-center h-full min-h-100">
                    {/* Icon Container */}
                    <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <FolderKanban className="w-10 h-10 text-zinc-600" />
                        </div>
                        {/* Decorative sparkle */}
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-zinc-400" />
                        </div>
                    </div>

                    {/* Text Content */}
                    <h2 className="text-xl font-semibold text-zinc-100 mb-2">
                        No projects yet
                    </h2>
                    <p className="text-sm text-zinc-500 text-center max-w-sm mb-8">
                        Create your first project to get started. Organize your work,
                        collaborate with your team, and track progress.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-zinc-200 transition-all hover:scale-[1.02]">
                            <Plus className="w-4 h-4" />
                            Create Project
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg font-medium text-sm hover:bg-zinc-800 hover:text-zinc-100 transition-all">
                            Browse Templates
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Quick Stats Section - Empty but structured */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-zinc-800/50">
                    <StatCard title="Active Projects" value="—" />
                    <StatCard title="Tasks Completed" value="—" />
                    <StatCard title="Team Members" value="—" />
                </div>
            </div>
        </div>
    );
}

/* Stat Card Component */
function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <div className="p-5 bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
            <p className="text-sm text-zinc-500 mb-1">{title}</p>
            <p className="text-2xl font-semibold text-zinc-200">{value}</p>
        </div>
    );
}
