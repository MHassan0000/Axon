"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Filter, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
} from "@/lib/actions/notifications";
import type { Notification } from "@/lib/types/database";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        const data = await getNotifications(50);
        setNotifications(data);
        setLoading(false);
    };

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    };

    const handleDelete = async (id: string) => {
        await deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const handleClearAll = async () => {
        await clearAllNotifications();
        setNotifications([]);
    };

    const filteredNotifications =
        filter === "all"
            ? notifications
            : notifications.filter((n) => !n.is_read);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                            Notifications
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            {unreadCount > 0
                                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                                : "You're all caught up!"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 mb-4 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-fit">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === "all"
                                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("unread")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${filter === "unread"
                                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            }`}
                    >
                        <Filter className="w-3 h-3" />
                        Unread
                        {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 text-xs bg-indigo-500 text-white rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Notification List */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-zinc-500">Loading...</div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <Bell className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500 dark:text-zinc-400">
                                {filter === "unread"
                                    ? "No unread notifications"
                                    : "No notifications yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`relative p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${!notification.is_read
                                            ? "bg-indigo-50/50 dark:bg-indigo-900/10"
                                            : ""
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Unread indicator */}
                                        <div className="pt-1.5">
                                            {!notification.is_read ? (
                                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                            ) : (
                                                <div className="w-2 h-2" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {notification.link ? (
                                                <Link
                                                    href={notification.link}
                                                    onClick={() => {
                                                        if (!notification.is_read) {
                                                            handleMarkAsRead(notification.id);
                                                        }
                                                    }}
                                                    className="block"
                                                >
                                                    <p className="font-medium text-zinc-900 dark:text-white">
                                                        {notification.title}
                                                    </p>
                                                    {notification.message && (
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                                            {notification.message}
                                                        </p>
                                                    )}
                                                </Link>
                                            ) : (
                                                <>
                                                    <p className="font-medium text-zinc-900 dark:text-white">
                                                        {notification.title}
                                                    </p>
                                                    {notification.message && (
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                                            {notification.message}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                                                {formatDistanceToNow(new Date(notification.created_at), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="p-2 rounded-lg text-zinc-400 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification.id)}
                                                className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
