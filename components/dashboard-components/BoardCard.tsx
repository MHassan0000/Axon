"use client";

import React, { memo, useMemo } from "react";
import { Clock, MessageSquare, Paperclip, GripVertical } from "lucide-react";

/*
  Task Card - Optimized with React.memo
  - Title
  - Optional labels (color coded)
  - Optional due date
  - Optional assignees
  - Drag handle visual
*/

export interface CardLabel {
    id: string;
    color: string;
    text?: string;
}

export interface CardData {
    id: string;
    title: string;
    labels?: CardLabel[];
    dueDate?: string;
    assignees?: { id: string; name: string }[];
    commentCount?: number;
    attachmentCount?: number;
    description?: string;
}

interface BoardCardProps {
    card: CardData;
}

// Helper function to format date - memoizable
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(
        (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

// Memoized Labels Component
const CardLabels = memo(function CardLabels({ labels }: { labels: CardLabel[] }) {
    return (
        <div className="flex flex-wrap gap-1 mb-2">
            {labels.map((label) => (
                <div
                    key={label.id}
                    className="h-2 w-10 rounded-full"
                    style={{ backgroundColor: label.color }}
                    title={label.text}
                />
            ))}
        </div>
    );
});

// Memoized Assignees Component
const CardAssignees = memo(function CardAssignees({
    assignees,
}: {
    assignees: { id: string; name: string }[];
}) {
    const displayedAssignees = useMemo(() => assignees.slice(0, 3), [assignees]);
    const remainingCount = assignees.length - 3;

    return (
        <div className="flex -space-x-1.5">
            {displayedAssignees.map((assignee) => (
                <div
                    key={assignee.id}
                    className="w-6 h-6 rounded-full bg-zinc-600 border border-zinc-800 flex items-center justify-center"
                    title={assignee.name}
                >
                    <span className="text-xs text-zinc-300">
                        {assignee.name.charAt(0)}
                    </span>
                </div>
            ))}
            {remainingCount > 0 && (
                <div className="w-6 h-6 rounded-full bg-zinc-700 border border-zinc-800 flex items-center justify-center">
                    <span className="text-xs text-zinc-400">+{remainingCount}</span>
                </div>
            )}
        </div>
    );
});

// Memoized BoardCard Component
const BoardCard = memo(function BoardCard({ card }: BoardCardProps) {
    const {
        title,
        labels = [],
        dueDate,
        assignees = [],
        commentCount = 0,
        attachmentCount = 0,
    } = card;

    // Memoize date calculations
    const { formattedDate, isOverdue } = useMemo(() => {
        if (!dueDate) return { formattedDate: null, isOverdue: false };
        return {
            formattedDate: formatDate(dueDate),
            isOverdue: new Date(dueDate) < new Date(),
        };
    }, [dueDate]);

    return (
        <div className="group relative bg-zinc-800 rounded-lg p-3 hover:ring-1 hover:ring-zinc-600 cursor-pointer transition-all">
            {/* Drag Handle - show on hover */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-zinc-500" />
            </div>

            {/* Labels */}
            {labels.length > 0 && <CardLabels labels={labels} />}

            {/* Title */}
            <h4 className="text-sm text-zinc-200 leading-snug mb-2">{title}</h4>

            {/* Meta Row */}
            <div className="flex items-center justify-between">
                {/* Left - Due date & badges */}
                <div className="flex items-center gap-2">
                    {/* Due Date */}
                    {formattedDate && (
                        <div
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${
                                isOverdue
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-zinc-700 text-zinc-400"
                            }`}
                        >
                            <Clock className="w-3 h-3" />
                            <span>{formattedDate}</span>
                        </div>
                    )}

                    {/* Comment count */}
                    {commentCount > 0 && (
                        <div className="flex items-center gap-1 text-zinc-500">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="text-xs">{commentCount}</span>
                        </div>
                    )}

                    {/* Attachment count */}
                    {attachmentCount > 0 && (
                        <div className="flex items-center gap-1 text-zinc-500">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span className="text-xs">{attachmentCount}</span>
                        </div>
                    )}
                </div>

                {/* Right - Assignees */}
                {assignees.length > 0 && <CardAssignees assignees={assignees} />}
            </div>
        </div>
    );
});

export default BoardCard;
