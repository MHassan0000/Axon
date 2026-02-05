"use client";

import React from "react";
import { FolderKanban, Plus } from "lucide-react";

/*
  Empty State Component
  - Minimal icon
  - Helpful text
  - Clean design
  - No emojis
*/

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    variant?: "board" | "column" | "search";
}

export default function EmptyState({
    title = "No items yet",
    description = "Get started by creating your first item.",
    actionLabel = "Create new",
    onAction,
    variant = "board",
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
                <FolderKanban className="w-8 h-8 text-zinc-500" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-medium text-zinc-200 mb-2">{title}</h3>

            {/* Description */}
            <p className="text-sm text-zinc-500 max-w-xs mb-6">{description}</p>

            {/* Action Button */}
            {onAction && (
                <button
                    onClick={onAction}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium text-white transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

/* Loading State */
export function LoadingState() {
    return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                {/* Spinner */}
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-sm text-zinc-500">Loading...</span>
            </div>
        </div>
    );
}

/* Column Skeleton */
export function ColumnSkeleton() {
    return (
        <div className="flex flex-col w-72 min-w-72 bg-zinc-900 rounded-lg animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                    <div className="h-4 w-24 bg-zinc-700 rounded" />
                </div>
                <div className="w-6 h-6 bg-zinc-700 rounded" />
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-zinc-800 rounded-lg p-3 space-y-2">
                        <div className="flex gap-1">
                            <div className="h-2 w-8 bg-zinc-700 rounded-full" />
                            <div className="h-2 w-6 bg-zinc-700 rounded-full" />
                        </div>
                        <div className="h-4 w-full bg-zinc-700 rounded" />
                        <div className="h-4 w-2/3 bg-zinc-700 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
