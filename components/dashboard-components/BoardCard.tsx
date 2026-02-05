"use client";

import React from "react";
import { Clock, MessageSquare, Paperclip, GripVertical } from "lucide-react";

/*
  Task Card
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

export default function BoardCard({ card }: BoardCardProps) {
    const {
        title,
        labels = [],
        dueDate,
        assignees = [],
        commentCount = 0,
        attachmentCount = 0,
    } = card;

    // Check if due date is overdue
    const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;

    return (
        <div className="group relative bg-zinc-800 rounded-lg p-3 hover:ring-1 hover:ring-zinc-600 cursor-pointer transition-all">
            {/* Drag Handle - show on hover */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-zinc-500" />
            </div>

            {/* Labels */}
            {labels.length > 0 && (
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
            )}

            {/* Title */}
            <h4 className="text-sm text-zinc-200 leading-snug mb-2">{title}</h4>

            {/* Meta Row */}
            <div className="flex items-center justify-between">
                {/* Left - Due date & badges */}
                <div className="flex items-center gap-2">
                    {/* Due Date */}
                    {dueDate && (
                        <div
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${isOverdue
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-zinc-700 text-zinc-400"
                                }`}
                        >
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(dueDate)}</span>
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
                {assignees.length > 0 && (
                    <div className="flex -space-x-1.5">
                        {assignees.slice(0, 3).map((assignee, i) => (
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
                        {assignees.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-zinc-700 border border-zinc-800 flex items-center justify-center">
                                <span className="text-xs text-zinc-400">
                                    +{assignees.length - 3}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper function to format date
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
