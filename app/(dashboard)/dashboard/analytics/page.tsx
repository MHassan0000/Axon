"use client";

import React, { useMemo } from "react";
import {
    BarChart3,
    TrendingUp,
    CheckCircle2,
    Clock,
    FolderKanban,
    LayoutGrid,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
    Legend,
} from "recharts";
import { useWorkspaces } from "@/lib/context/WorkspaceContext";
import { useAnalyticsSummaryQuery } from "@/lib/hooks";
import { AnalyticsPageSkeleton } from "@/components/ui/Skeleton";

export default function AnalyticsPage() {
    const { workspaces, loading: loadingWorkspaces } = useWorkspaces();
    const { data: analytics, isLoading: loadingAnalytics } = useAnalyticsSummaryQuery();

    // Calculate completion rate
    const completionRate = useMemo(() => {
        if (!analytics?.stats.totalCards) return 0;
        return Math.round((analytics.stats.completedCards / analytics.stats.totalCards) * 100);
    }, [analytics?.stats.totalCards, analytics?.stats.completedCards]);

    if (loadingWorkspaces || loadingAnalytics) {
        return <AnalyticsPageSkeleton />;
    }

    // Default empty state if no analytics
    const stats = analytics?.stats || {
        totalWorkspaces: workspaces.length,
        totalBoards: 0,
        totalCards: 0,
        completedCards: 0,
        overdueCards: 0,
        teamMembersCount: 0,
    };

    const activityByDay = analytics?.activityByDay || [];
    const cardStatusDistribution = analytics?.cardStatusDistribution || [];
    const boardsCreatedByMonth = analytics?.boardsCreatedByMonth || [];
    const recentBoards = analytics?.recentBoards || [];

    const statCards = [
        {
            label: "Total Workspaces",
            value: stats.totalWorkspaces,
            icon: LayoutGrid,
            change: null,
        },
        {
            label: "Total Boards",
            value: stats.totalBoards,
            icon: FolderKanban,
            change: null,
        },
        {
            label: "Total Cards",
            value: stats.totalCards,
            icon: TrendingUp,
            change: null,
        },
        {
            label: "Completion Rate",
            value: `${completionRate}%`,
            icon: CheckCircle2,
            change: completionRate >= 50 ? "positive" : "negative",
        },
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            {/* Page Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            Analytics
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Overview of your workspace activity and performance
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat) => (
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
                                    {stat.change && (
                                        <div className={`flex items-center gap-1 mt-1 text-xs ${stat.change === "positive" ? "text-emerald-500" : "text-red-500"}`}>
                                            {stat.change === "positive" ? (
                                                <ArrowUpRight className="w-3 h-3" />
                                            ) : (
                                                <ArrowDownRight className="w-3 h-3" />
                                            )}
                                            <span>{stat.change === "positive" ? "Good progress" : "Needs attention"}</span>
                                        </div>
                                    )}
                                </div>
                                <stat.icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Activity Chart */}
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Activity (Last 7 Days)
                        </h3>
                        {activityByDay.some(d => d.count > 0) ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={activityByDay}>
                                        <defs>
                                            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                        <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                                        <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#18181b",
                                                border: "1px solid #27272a",
                                                borderRadius: "8px",
                                                color: "#fff"
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorActivity)"
                                            name="Activities"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-zinc-500">
                                <p>No activity data available</p>
                            </div>
                        )}
                    </div>

                    {/* Card Status Distribution */}
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Card Status Distribution
                        </h3>
                        {cardStatusDistribution.length > 0 ? (
                            <div className="h-64 flex items-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={cardStatusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {cardStatusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#18181b",
                                                border: "1px solid #27272a",
                                                borderRadius: "8px",
                                                color: "#fff"
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value) => <span className="text-zinc-400 text-sm">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-zinc-500">
                                <p>No cards to display</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Boards Created Over Time */}
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <FolderKanban className="w-4 h-4" />
                            Boards Created (Last 6 Months)
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={boardsCreatedByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                                    <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#18181b",
                                            border: "1px solid #27272a",
                                            borderRadius: "8px",
                                            color: "#fff"
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Boards" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Task Summary */}
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Task Summary
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Completed</span>
                                </div>
                                <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    {stats.completedCards}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">In Progress</span>
                                </div>
                                <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    {stats.totalCards - stats.completedCards - stats.overdueCards}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Overdue</span>
                                </div>
                                <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    {stats.overdueCards}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800/50 rounded-lg border-t border-zinc-200 dark:border-zinc-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-zinc-400" />
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total</span>
                                </div>
                                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                    {stats.totalCards}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
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
                                        <div className="w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
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
                        {recentBoards.length > 0 ? (
                            <div className="space-y-3">
                                {recentBoards.map((board) => {
                                    const thumbnailStyle = board.background_image
                                        ? {
                                            backgroundImage: `url(${board.background_image})`,
                                            backgroundSize: "cover" as const,
                                            backgroundPosition: "center" as const,
                                        }
                                        : {
                                            backgroundColor: board.background_color || "#6366f1",
                                        };
                                    return (
                                        <div
                                            key={board.id}
                                            className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/50 rounded-lg"
                                        >
                                            <div
                                                className="w-8 h-8 rounded shrink-0"
                                                style={thumbnailStyle}
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
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500 text-center py-8">
                                No boards yet
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
