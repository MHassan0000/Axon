"use client";

import React, { useState, useEffect } from "react";
import {
    MessageSquare,
    Loader2,
    Activity,
    Clock,
    MoveRight,
    CheckCircle,
    MessageCircle,
    Users,
    Layers,
} from "lucide-react";
import { getRecentActivity } from "@/lib/actions";
import type { ActivityLog } from "@/lib/types/database";

interface ActivityWithUser extends ActivityLog {
    user: { name: string; avatar_url: string };
}

const getActionIcon = (action: string) => {
    switch (action) {
        case "created":
            return <Layers className="w-4 h-4 text-emerald-500" />;
        case "moved":
            return <MoveRight className="w-4 h-4 text-blue-500" />;
        case "completed":
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        case "commented":
            return <MessageCircle className="w-4 h-4 text-purple-500" />;
        case "assigned":
            return <Users className="w-4 h-4 text-orange-500" />;
        default:
            return <Activity className="w-4 h-4 text-zinc-400" />;
    }
};

const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

export default function MessagesPage() {
    const [activities, setActivities] = useState<ActivityWithUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivity() {
            try {
                const data = await getRecentActivity(50);
                setActivities(data as ActivityWithUser[]);
            } catch (error) {
                console.error("Error fetching activity:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchActivity();
    }, []);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            {/* Page Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            Messages
                        </h1>
                        <p className="text-sm text-zinc-500">
                            {activities.length > 0
                                ? `${activities.length} recent activities`
                                : "Activity and notifications"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                            <Activity className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                            No activity yet
                        </h2>
                        <p className="text-sm text-zinc-500 text-center max-w-sm">
                            When you and your team make changes, they'll appear here
                        </p>
                    </div>
                ) : (
                    <div className="max-w-2xl space-y-2">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                {/* User Avatar */}
                                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                                    {activity.user?.avatar_url ? (
                                        <img
                                            src={activity.user.avatar_url}
                                            alt={activity.user.name || ""}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                                            {activity.user?.name?.[0]?.toUpperCase() || "?"}
                                        </span>
                                    )}
                                </div>

                                {/* Activity Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getActionIcon(activity.action)}
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                            {activity.user?.name || "Unknown"}
                                        </span>
                                        <span className="text-zinc-500">
                                            {activity.action}
                                        </span>
                                    </div>
                                    {activity.details && (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                                            {typeof activity.details === "object"
                                                ? JSON.stringify(activity.details).slice(0, 100)
                                                : String(activity.details)}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1 mt-2 text-xs text-zinc-400">
                                        <Clock className="w-3 h-3" />
                                        {formatTimeAgo(activity.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
