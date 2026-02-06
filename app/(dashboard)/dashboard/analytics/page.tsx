"use client";

import React, { useEffect, useState } from "react";
import {
    BarChart3,
    TrendingUp,
    CheckCircle2,
    Clock,
    Users,
    FolderKanban,
    LayoutGrid,
    Loader2,
    Calendar,
    Activity,
} from "lucide-react";
import { useWorkspaces } from "@/lib/context/WorkspaceContext";
import { getBoards } from "@/lib/actions";
import type { Board } from "@/lib/types/database";

interface AnalyticsData {
    totalWorkspaces: number;
    totalBoards: number;
    recentActivity: { date: string; count: number }[];
}

export default function AnalyticsPage() {
    const { workspaces, loading: loadingWorkspaces } = useWorkspaces();
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBoards() {
            if (loadingWorkspaces) return;

            try {
                const allBoards = await Promise.all(
                    workspaces.map((ws) => getBoards(ws.id))
                );
                setBoards(allBoards.flat());
            } catch (error) {
                console.error("Error fetching boards:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchBoards();
    }, [workspaces, loadingWorkspaces]);

    if (loading || loadingWorkspaces) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-black">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: "Total Workspaces",
            value: workspaces.length,
            icon: LayoutGrid,
            color: "from-blue-500 to-blue-600",
        },
        {
            label: "Total Boards",
            value: boards.length,
            icon: FolderKanban,
            color: "from-purple-500 to-purple-600",
        },
        {
            label: "Active Projects",
            value: boards.filter((b) => !b.is_private).length,
            icon: TrendingUp,
            color: "from-emerald-500 to-emerald-600",
        },
        {
            label: "Team Members",
            value: "—",
            icon: Users,
            color: "from-orange-500 to-orange-600",
        },
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            {/* Page Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            Analytics
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Overview of your workspace activity
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="relative overflow-hidden p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                                        {stat.label}
                                    </p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                        {stat.value}
                                    </p>
                                </div>
                                <div
                                    className={`w-10 h-10 rounded-lg bg-linear-to-br ${stat.color} flex items-center justify-center`}
                                >
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Workspaces */}
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4" />
                            Recent Workspaces
                        </h3>
                        {workspaces.length > 0 ? (
                            <div className="space-y-3">
                                {workspaces.slice(0, 5).map((ws) => (
                                    <div
                                        key={ws.id}
                                        className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/50 rounded-lg"
                                    >
                                        <div className="w-8 h-8 rounded bg-linear-to-br from-zinc-600 to-zinc-800 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">
                                                {ws.name[0]?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                {ws.name}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                Created {new Date(ws.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500 text-center py-8">
                                No workspaces yet
                            </p>
                        )}
                    </div>

                    {/* Recent Boards */}
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <FolderKanban className="w-4 h-4" />
                            Recent Boards
                        </h3>
                        {boards.length > 0 ? (
                            <div className="space-y-3">
                                {boards.slice(0, 5).map((board) => (
                                    <div
                                        key={board.id}
                                        className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/50 rounded-lg"
                                    >
                                        <div
                                            className="w-8 h-8 rounded shrink-0"
                                            style={{
                                                backgroundColor: board.background_color || "#6366f1",
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                {board.name}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                Created {new Date(board.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500 text-center py-8">
                                No boards yet
                            </p>
                        )}
                    </div>
                </div>

                {/* Placeholder for future charts */}
                <div className="mt-6 p-8 bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-center">
                    <Activity className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Activity Charts Coming Soon
                    </h3>
                    <p className="text-sm text-zinc-500">
                        Detailed analytics with charts will be available in a future update
                    </p>
                </div>
            </div>
        </div>
    );
}
