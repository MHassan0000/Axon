"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, X, Clock, User, MessageSquare, AlertCircle, Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    acceptWorkspaceInvite,
    declineWorkspaceInvite,
} from "@/lib/actions";
import { queryKeys } from "@/lib/hooks/queryKeys";
import { useWorkspaces } from "@/lib/context/WorkspaceContext";
import type { Notification } from "@/lib/types/database";

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [processingInvite, setProcessingInvite] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const { refreshWorkspaces } = useWorkspaces();

    // Fetch notifications on mount
    useEffect(() => {
        fetchUnreadCount();
    }, []);

    // Fetch full notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        const count = await getUnreadCount();
        setUnreadCount(count);
    };

    const fetchNotifications = async () => {
        setLoading(true);
        const data = await getNotifications(10);
        setNotifications(data);
        setLoading(false);
    };

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const handleDelete = async (id: string) => {
        const notification = notifications.find((n) => n.id === id);
        await deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notification && !notification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    const handleAcceptInvite = async (notification: Notification) => {
        const inviteId = notification.metadata?.invite_id;
        if (!inviteId) {
            toast.error("Invalid invitation");
            return;
        }

        setProcessingInvite(notification.id);
        try {
            const result = await acceptWorkspaceInvite(inviteId);
            if (result.success) {
                toast.success("You have joined the workspace!");
                // Remove the notification
                await deleteNotification(notification.id);
                setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                if (!notification.is_read) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
                // Refresh WorkspaceContext (for sidebar to show new workspace)
                await refreshWorkspaces();
                // Invalidate React Query caches
                queryClient.invalidateQueries({ queryKey: queryKeys.team.members() });
                queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
                queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
                // Navigate to the workspace
                if (result.workspaceId) {
                    window.location.href = `/dashboard/workspace/${result.workspaceId}`;
                }
            } else {
                toast.error(result.error || "Failed to accept invitation");
            }
        } catch {
            toast.error("Failed to accept invitation");
        } finally {
            setProcessingInvite(null);
        }
    };

    const handleDeclineInvite = async (notification: Notification) => {
        const inviteId = notification.metadata?.invite_id;
        if (!inviteId) {
            toast.error("Invalid invitation");
            return;
        }

        setProcessingInvite(notification.id);
        try {
            const result = await declineWorkspaceInvite(inviteId);
            if (result.success) {
                toast.success("Invitation declined");
                // Remove the notification
                await deleteNotification(notification.id);
                setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                if (!notification.is_read) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
            } else {
                toast.error(result.error || "Failed to decline invitation");
            }
        } catch {
            toast.error("Failed to decline invitation");
        } finally {
            setProcessingInvite(null);
        }
    };

    const getNotificationIcon = (type: Notification["type"]) => {
        switch (type) {
            case "card_assigned":
                return <User className="w-4 h-4 text-blue-500" />;
            case "comment_added":
            case "mentioned":
                return <MessageSquare className="w-4 h-4 text-green-500" />;
            case "due_soon":
                return <Clock className="w-4 h-4 text-amber-500" />;
            case "due_overdue":
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case "workspace_invite":
                return <Users className="w-4 h-4 text-indigo-500" />;
            default:
                return <Bell className="w-4 h-4 text-zinc-500" />;
        }
    };

    // Check if a notification is an actionable invite (has metadata with invite_id)
    const isActionableInvite = (notification: Notification): boolean => {
        return (
            notification.type === "workspace_invite" &&
            !!notification.metadata?.invite_id
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                            Notifications
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <X className="w-4 h-4 text-zinc-500" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-zinc-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                                <p className="text-sm text-zinc-500">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`relative group px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${!notification.is_read ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {notification.link && !isActionableInvite(notification) ? (
                                                <Link
                                                    href={notification.link}
                                                    onClick={() => {
                                                        if (!notification.is_read) {
                                                            handleMarkAsRead(notification.id);
                                                        }
                                                        setIsOpen(false);
                                                    }}
                                                    className="block"
                                                >
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                        {notification.title}
                                                    </p>
                                                    {notification.message && (
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                                            {notification.message}
                                                        </p>
                                                    )}
                                                </Link>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                        {notification.title}
                                                    </p>
                                                    {notification.message && (
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                                            {notification.message}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                                {formatDistanceToNow(new Date(notification.created_at), {
                                                    addSuffix: true,
                                                })}
                                            </p>

                                            {/* Accept/Decline buttons for workspace invites */}
                                            {isActionableInvite(notification) && (
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleAcceptInvite(notification)}
                                                        disabled={processingInvite === notification.id}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50"
                                                    >
                                                        {processingInvite === notification.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-3 h-3" />
                                                        )}
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeclineInvite(notification)}
                                                        disabled={processingInvite === notification.id}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-md transition-colors disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-3 h-3" />
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions (only show for non-invite notifications or read invites) */}
                                        {!isActionableInvite(notification) && (
                                            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-3.5 h-3.5 text-zinc-500" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Unread indicator */}
                                    {!notification.is_read && (
                                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800">
                            <Link
                                href="/dashboard/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                            >
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
