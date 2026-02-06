"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    X,
    Trash2,
    Edit3,
    Calendar,
    MessageSquare,
    CheckCircle2,
    Users,
    Tag,
    Loader2,
    Plus,
    Send,
    Clock,
    ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import {
    updateCard,
    addComment,
    getComments,
    deleteComment,
    addLabelToCard,
    removeLabelFromCard,
    assignUserToCard,
    unassignUserFromCard,
} from "@/lib/actions";
import type {
    CardWithRelations,
    Label,
    User,
    Comment,
} from "@/lib/types/database";
import { ChecklistSection } from "./ChecklistSection";

/* =====================================================
   Types
   ===================================================== */

// Flexible type for workspace members (API returns subset of User fields)
type WorkspaceMember = { id: string; name: string | null; email: string; avatar_url: string | null };

interface CardModalProps {
    card: CardWithRelations;
    labels: Label[];
    workspaceMembers?: WorkspaceMember[];
    onClose: () => void;
    onDelete: () => void;
    onUpdate: (card: CardWithRelations) => void;
}

interface CommentWithUser extends Comment {
    user: { name: string; avatar_url: string };
}

/* =====================================================
   Card Modal Component
   ===================================================== */

export function CardModal({
    card,
    labels,
    workspaceMembers = [],
    onClose,
    onDelete,
    onUpdate,
}: CardModalProps) {
    // State
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || "");
    const [saving, setSaving] = useState(false);
    const [showLabelPicker, setShowLabelPicker] = useState(false);
    const [showAssigneePicker, setShowAssigneePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [dueDate, setDueDate] = useState(card.due_date || "");

    // Comments state
    const [comments, setComments] = useState<CommentWithUser[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    // Refs for click outside
    const labelPickerRef = useRef<HTMLDivElement>(null);
    const assigneePickerRef = useRef<HTMLDivElement>(null);

    // Fetch comments
    useEffect(() => {
        async function fetchComments() {
            try {
                const c = await getComments(card.id);
                setComments(c as CommentWithUser[]);
            } catch (error) {
                console.error("Error fetching comments:", error);
            } finally {
                setLoadingComments(false);
            }
        }
        fetchComments();
    }, [card.id]);

    // Handle save
    const handleSave = async () => {
        setSaving(true);
        try {
            await updateCard(card.id, { title, description });
            onUpdate({ ...card, title, description });
            setEditing(false);
            toast.success("Card updated");
        } catch (error) {
            console.error("Error updating card:", error);
            toast.error("Failed to update card");
        } finally {
            setSaving(false);
        }
    };

    // Toggle complete
    const handleToggleComplete = async () => {
        try {
            await updateCard(card.id, { is_complete: !card.is_complete });
            onUpdate({ ...card, is_complete: !card.is_complete });
            toast.success(card.is_complete ? "Marked incomplete" : "Marked complete");
        } catch (error) {
            console.error("Error updating card:", error);
            toast.error("Failed to update card");
        }
    };

    // Due date
    const handleSaveDueDate = async () => {
        try {
            const newDueDate = dueDate || null;
            await updateCard(card.id, { due_date: newDueDate });
            onUpdate({ ...card, due_date: newDueDate });
            setShowDueDatePicker(false);
            toast.success(newDueDate ? "Due date set" : "Due date removed");
        } catch (error) {
            console.error("Error updating due date:", error);
            toast.error("Failed to update due date");
        }
    };

    // Add comment
    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const comment = await addComment({ card_id: card.id, content: newComment });
            if (comment) {
                // Refresh comments
                const c = await getComments(card.id);
                setComments(c as CommentWithUser[]);
                setNewComment("");
                toast.success("Comment added");
            }
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Delete comment
    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
            toast.success("Comment deleted");
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete comment");
        }
    };

    // Toggle label
    const handleToggleLabel = async (label: Label) => {
        const hasLabel = card.labels?.some(l => l.id === label.id);

        try {
            if (hasLabel) {
                await removeLabelFromCard(card.id, label.id);
                onUpdate({
                    ...card,
                    labels: card.labels?.filter(l => l.id !== label.id) || [],
                });
                toast.success(`Removed "${label.name}" label`);
            } else {
                await addLabelToCard(card.id, label.id);
                onUpdate({
                    ...card,
                    labels: [...(card.labels || []), label],
                });
                toast.success(`Added "${label.name}" label`);
            }
        } catch (error) {
            console.error("Error toggling label:", error);
            toast.error("Failed to update label");
        }
    };

    // Toggle assignee
    const handleToggleAssignee = async (user: WorkspaceMember) => {
        const isAssigned = card.assignees?.some(a => a.id === user.id);

        try {
            if (isAssigned) {
                await unassignUserFromCard(card.id, user.id);
                onUpdate({
                    ...card,
                    assignees: card.assignees?.filter(a => a.id !== user.id) || [],
                });
                toast.success(`Unassigned ${user.name || user.email}`);
            } else {
                await assignUserToCard(card.id, user.id);
                // Create a User-compatible object from WorkspaceMember
                const userAsAssignee = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar_url: user.avatar_url,
                    clerk_id: "",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                } as User;
                onUpdate({
                    ...card,
                    assignees: [...(card.assignees || []), userAsAssignee],
                });
                toast.success(`Assigned ${user.name || user.email}`);
            }
        } catch (error) {
            console.error("Error toggling assignee:", error);
            toast.error("Failed to update assignee");
        }
    };

    // Handle delete with confirmation
    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this card? This action cannot be undone.")) {
            onDelete();
            toast.success("Card deleted");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-start justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="flex-1 pr-4">
                        {editing ? (
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-xl font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent border-b-2 border-zinc-300 dark:border-zinc-700 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none pb-1"
                                autoFocus
                            />
                        ) : (
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                {card.title}
                            </h2>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Labels Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Labels
                                </h4>
                                <div className="relative" ref={labelPickerRef}>
                                    <button
                                        onClick={() => setShowLabelPicker(!showLabelPicker)}
                                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                    >
                                        <Plus className="w-4 h-4 text-zinc-500" />
                                    </button>
                                    {showLabelPicker && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowLabelPicker(false)}
                                            />
                                            <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg p-2 min-w-48">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2 py-1 mb-1">
                                                    Available Labels
                                                </p>
                                                {labels.map((label) => {
                                                    const hasLabel = card.labels?.some(l => l.id === label.id);
                                                    return (
                                                        <button
                                                            key={label.id}
                                                            onClick={() => handleToggleLabel(label)}
                                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                        >
                                                            <span
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: label.color }}
                                                            />
                                                            <span className="flex-1 text-left text-sm text-zinc-700 dark:text-zinc-300">
                                                                {label.name}
                                                            </span>
                                                            {hasLabel && (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            {card.labels && card.labels.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {card.labels.map((label) => (
                                        <span
                                            key={label.id}
                                            className="px-3 py-1 rounded-full text-sm font-medium text-white cursor-pointer hover:opacity-80 transition-opacity"
                                            style={{ backgroundColor: label.color }}
                                            onClick={() => handleToggleLabel(label)}
                                        >
                                            {label.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-400 dark:text-zinc-500 text-sm italic">
                                    No labels yet
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                                Description
                            </h4>
                            {editing ? (
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a more detailed description..."
                                    className="w-full min-h-30 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                                />
                            ) : card.description ? (
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                                    {card.description}
                                </p>
                            ) : (
                                <p className="text-zinc-400 dark:text-zinc-500 text-sm italic">
                                    No description yet...
                                </p>
                            )}
                        </div>

                        {/* Due Date */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Due Date
                                </h4>
                                <button
                                    onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                >
                                    <Edit3 className="w-4 h-4 text-zinc-500" />
                                </button>
                            </div>
                            {showDueDatePicker ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={dueDate ? dueDate.split('T')[0] : ''}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                                    />
                                    <button
                                        onClick={handleSaveDueDate}
                                        className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDueDate("");
                                            handleSaveDueDate();
                                        }}
                                        className="px-3 py-2 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                            ) : card.due_date ? (
                                <div
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer ${card.is_complete
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                        : new Date(card.due_date) < new Date()
                                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                        }`}
                                    onClick={handleToggleComplete}
                                >
                                    {card.is_complete ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <Clock className="w-4 h-4" />
                                    )}
                                    {new Date(card.due_date).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                    {card.is_complete && (
                                        <span className="text-xs">(Complete)</span>
                                    )}
                                </div>
                            ) : (
                                <p className="text-zinc-400 dark:text-zinc-500 text-sm italic">
                                    No due date set
                                </p>
                            )}
                        </div>

                        {/* Assignees */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Assignees
                                </h4>
                                <div className="relative" ref={assigneePickerRef}>
                                    <button
                                        onClick={() => setShowAssigneePicker(!showAssigneePicker)}
                                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                    >
                                        <Plus className="w-4 h-4 text-zinc-500" />
                                    </button>
                                    {showAssigneePicker && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowAssigneePicker(false)}
                                            />
                                            <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg p-2 min-w-56 max-h-64 overflow-y-auto">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2 py-1 mb-1">
                                                    Workspace Members
                                                </p>
                                                {workspaceMembers.length > 0 ? (
                                                    workspaceMembers.map((user) => {
                                                        const isAssigned = card.assignees?.some(a => a.id === user.id);
                                                        return (
                                                            <button
                                                                key={user.id}
                                                                onClick={() => handleToggleAssignee(user)}
                                                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                            >
                                                                <div className="w-6 h-6 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                                                    {user.avatar_url ? (
                                                                        <img
                                                                            src={user.avatar_url}
                                                                            alt={user.name || ""}
                                                                            className="w-full h-full rounded-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        user.name?.[0]?.toUpperCase() || "?"
                                                                    )}
                                                                </div>
                                                                <span className="flex-1 text-left text-sm text-zinc-700 dark:text-zinc-300">
                                                                    {user.name || user.email}
                                                                </span>
                                                                {isAssigned && (
                                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                )}
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-zinc-400 dark:text-zinc-500 text-sm px-2 py-2">
                                                        No members available
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            {card.assignees && card.assignees.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {card.assignees.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-2 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                            onClick={() => handleToggleAssignee({ id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url })}
                                        >
                                            <div className="w-6 h-6 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                                {user.avatar_url ? (
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.name || ""}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    user.name?.[0]?.toUpperCase() || "?"
                                                )}
                                            </div>
                                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                                {user.name || user.email}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-400 dark:text-zinc-500 text-sm italic">
                                    No assignees
                                </p>
                            )}
                        </div>

                        {/* Checklists Section */}
                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                            <ChecklistSection cardId={card.id} />
                        </div>

                        {/* Comments Section */}
                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                            <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Comments
                            </h4>

                            {/* New Comment Input */}
                            <div className="flex gap-2 mb-4">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 min-h-20"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddComment();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={submittingComment || !newComment.trim()}
                                    className="self-end p-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                >
                                    {submittingComment ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Comments List */}
                            {loadingComments ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                                </div>
                            ) : comments.length > 0 ? (
                                <div className="space-y-3">
                                    {comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="group bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                                        {comment.user?.avatar_url ? (
                                                            <img
                                                                src={comment.user.avatar_url}
                                                                alt={comment.user.name || ""}
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            comment.user?.name?.[0]?.toUpperCase() || "?"
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                        {comment.user?.name || "Unknown"}
                                                    </span>
                                                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                                        {new Date(comment.created_at).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 dark:text-red-400 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                                {comment.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-400 dark:text-zinc-500 text-sm italic text-center py-4">
                                    No comments yet. Be the first to comment!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                            Actions
                        </h4>
                        {editing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setTitle(card.title);
                                        setDescription(card.description || "");
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={handleToggleComplete}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${card.is_complete
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                                        : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                                        }`}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {card.is_complete ? "Mark Incomplete" : "Mark Complete"}
                                </button>
                                <button
                                    onClick={() => setShowDueDatePicker(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 transition-colors"
                                >
                                    <Calendar className="w-4 h-4" />
                                    {card.due_date ? "Change Due Date" : "Set Due Date"}
                                </button>
                                <button
                                    onClick={() => setShowLabelPicker(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 transition-colors"
                                >
                                    <Tag className="w-4 h-4" />
                                    Add Label
                                </button>
                                <button
                                    onClick={() => setShowAssigneePicker(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 transition-colors"
                                >
                                    <Users className="w-4 h-4" />
                                    Assign Members
                                </button>
                                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 mt-2">
                                    <button
                                        onClick={handleDelete}
                                        className="w-full flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg text-sm text-red-700 dark:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Card
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
