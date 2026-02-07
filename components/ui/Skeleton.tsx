"use client";

import React from "react";

/* =====================================================
   Base Skeleton Component
   ===================================================== */

interface SkeletonProps {
    className?: string;
    animate?: boolean;
}

export function Skeleton({ className = "", animate = true }: SkeletonProps) {
    return (
        <div
            className={`bg-zinc-200 dark:bg-zinc-800 rounded ${
                animate ? "animate-pulse" : ""
            } ${className}`}
        />
    );
}

/* =====================================================
   Skeleton Variants
   ===================================================== */

export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
                />
            ))}
        </div>
    );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
    };
    return <Skeleton className={`${sizeClasses[size]} rounded-full`} />;
}

export function SkeletonButton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "h-8 w-20",
        md: "h-10 w-24",
        lg: "h-12 w-32",
    };
    return <Skeleton className={`${sizeClasses[size]} rounded-lg`} />;
}

/* =====================================================
   Card Skeletons
   ===================================================== */

export function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
            {/* Labels */}
            <div className="flex gap-1 mb-2">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
            </div>
            {/* Title */}
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-3" />
            {/* Meta */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
            </div>
        </div>
    );
}

export function SkeletonBoardCard() {
    return (
        <div className="relative overflow-hidden p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 min-h-30">
            <Skeleton className="absolute inset-0 rounded-xl" animate={false} />
            <div className="relative z-10 space-y-2">
                <Skeleton className="h-5 w-32 bg-zinc-300/50 dark:bg-zinc-700/50" />
                <Skeleton className="h-4 w-48 bg-zinc-300/30 dark:bg-zinc-700/30" />
            </div>
        </div>
    );
}

export function SkeletonWorkspaceCard() {
    return (
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                    <Skeleton className="h-5 w-24" />
                </div>
            </div>
            <Skeleton className="h-3 w-full mt-2" />
            <Skeleton className="h-3 w-2/3 mt-2" />
        </div>
    );
}

/* =====================================================
   List Skeletons
   ===================================================== */

export function SkeletonList() {
    return (
        <div className="shrink-0 w-72 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {/* List Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="w-4 h-4" />
            </div>
            {/* Cards */}
            <div className="p-2 space-y-2">
                {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
            {/* Add Card Button */}
            <div className="px-3 py-2">
                <Skeleton className="h-8 w-full rounded" />
            </div>
        </div>
    );
}

/* =====================================================
   Page Section Skeletons
   ===================================================== */

export function SkeletonPageHeader() {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
            <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
        </div>
    );
}

export function SkeletonStat() {
    return (
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-xl">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
        </div>
    );
}

/* =====================================================
   Activity/Notification Skeletons
   ===================================================== */

export function SkeletonActivityItem() {
    return (
        <div className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <SkeletonAvatar />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-3 w-48 mt-2" />
                <Skeleton className="h-3 w-16 mt-2" />
            </div>
        </div>
    );
}

export function SkeletonNotificationItem() {
    return (
        <div className="flex items-start gap-4 p-4">
            <Skeleton className="w-2 h-2 rounded-full mt-1.5" />
            <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-64 mb-2" />
                <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex gap-1">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
        </div>
    );
}

/* =====================================================
   Team/Member Skeletons
   ===================================================== */

export function SkeletonMemberCard() {
    return (
        <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <SkeletonAvatar size="lg" />
            <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
            </div>
        </div>
    );
}

/* =====================================================
   Calendar Skeleton
   ===================================================== */

export function SkeletonCalendarDay() {
    return (
        <div className="min-h-25 sm:min-h-30 p-2 border-b border-r border-zinc-200 dark:border-zinc-800/50">
            <Skeleton className="w-7 h-7 rounded-full mb-1" />
            <div className="space-y-1">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
            </div>
        </div>
    );
}

/* =====================================================
   Full Page Skeletons
   ===================================================== */

export function DashboardPageSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-black">
            <SkeletonPageHeader />
            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-8">
                    {/* Workspaces Grid */}
                    <section>
                        <Skeleton className="h-6 w-40 mb-4" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <SkeletonWorkspaceCard key={i} />
                            ))}
                        </div>
                    </section>
                    {/* Stats */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/50">
                        {[1, 2, 3].map((i) => (
                            <SkeletonStat key={i} />
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
}

export function BoardPageSkeleton() {
    return (
        <div className="flex flex-col h-full bg-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-lg bg-white/10" />
                    <Skeleton className="h-6 w-40 bg-white/10" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20 rounded-lg bg-white/10" />
                    <Skeleton className="w-9 h-9 rounded-lg bg-white/10" />
                </div>
            </div>
            {/* Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
                <div className="flex gap-4 h-full items-start">
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonList key={i} />
                    ))}
                    <Skeleton className="shrink-0 w-72 h-12 rounded-xl bg-white/10" />
                </div>
            </div>
        </div>
    );
}

export function WorkspacePageSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-black">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div>
                        <Skeleton className="h-6 w-40 mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                </div>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <SkeletonBoardCard key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ActivityPageSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            <SkeletonPageHeader />
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="max-w-2xl space-y-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <SkeletonActivityItem key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function NotificationsPageSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Skeleton className="h-8 w-40 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-28 rounded-lg" />
                        <Skeleton className="h-9 w-24 rounded-lg" />
                    </div>
                </div>
                {/* Filter */}
                <Skeleton className="h-10 w-40 rounded-lg mb-4" />
                {/* List */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <SkeletonNotificationItem key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function CalendarPageSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            <SkeletonPageHeader />
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="py-3 flex justify-center">
                                <Skeleton className="h-4 w-8" />
                            </div>
                        ))}
                    </div>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <SkeletonCalendarDay key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TeamPageSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            <SkeletonPageHeader />
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="space-y-8">
                    {[1, 2].map((section) => (
                        <section key={section}>
                            <div className="flex items-center gap-2 mb-4">
                                <Skeleton className="w-4 h-4" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <SkeletonMemberCard key={i} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
