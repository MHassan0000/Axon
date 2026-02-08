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
    Paperclip,
    Download,
    ExternalLink,
    File,
    Image as ImageIcon,
    Upload,
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
    getAttachments,
    uploadAttachment,
    deleteAttachment,
} from "@/lib/actions";
import { useInvalidateCalendar } from "@/lib/hooks/useDashboard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type {
    CardWithRelations,
    Label,
    User,
    Comment,
    Attachment,
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

    // Attachments state
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loadingAttachments, setLoadingAttachments] = useState(true);
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Loading states for actions (for visual feedback)
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Delete confirmation state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Calendar cache invalidation
    const invalidateCalendar = useInvalidateCalendar();

    // Refs for click outside
    const labelPickerRef = useRef<HTMLDivElement>(null);
    const assigneePickerRef = useRef<HTMLDivElement>(null);

    // Fetch comments and attachments in parallel
    useEffect(() => {
        async function fetchData() {
            try {
                const [commentsResult, attachmentsResult] = await Promise.all([
                    getComments(card.id),
                    getAttachments(card.id),
                ]);
                setComments(commentsResult as CommentWithUser[]);
                setAttachments(attachmentsResult);
            } catch (error) {
                console.error("Error fetching card data:", error);
            } finally {
                setLoadingComments(false);
                setLoadingAttachments(false);
            }
        }
        fetchData();
    }, [card.id]);

    // Handle save
    const handleSave = async () => {
        setSaving(true);
        // Optimistic update
        const prevCard = { ...card };
        onUpdate({ ...card, title, description });

        try {
            await updateCard(card.id, { title, description });
            setEditing(false);
        } catch (error) {
            console.error("Error updating card:", error);
            onUpdate(prevCard); // Rollback
            toast.error("Failed to update card");
        } finally {
            setSaving(false);
        }
    };

    // Due date - with optimistic update
    const handleSaveDueDate = async () => {
        setActionLoading("dueDate");
        const prevDueDate = card.due_date;
        const newDueDate = dueDate || null;

        // Optimistic update
        onUpdate({ ...card, due_date: newDueDate });
        setShowDueDatePicker(false);

        try {
            const result = await updateCard(card.id, { due_date: newDueDate });
            if (result) {
                // Invalidate calendar cache so it updates in real-time
                invalidateCalendar();
            } else {
                // Rollback on failure
                onUpdate({ ...card, due_date: prevDueDate });
                toast.error("Failed to update due date");
            }
        } catch (error) {
            console.error("Error updating due date:", error);
            onUpdate({ ...card, due_date: prevDueDate }); // Rollback
            toast.error("Failed to update due date");
        } finally {
            setActionLoading(null);
        }
    };

    // Add comment - with optimistic update
    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        const tempComment: CommentWithUser = {
            id: `temp-${Date.now()}`,
            card_id: card.id,
            user_id: "temp",
            content: newComment,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: { name: "You", avatar_url: "" },
        };

        // Optimistic update
        setComments([...comments, tempComment]);
        const commentContent = newComment;
        setNewComment("");
        setSubmittingComment(true);

        try {
            const comment = await addComment({ card_id: card.id, content: commentContent });
            if (comment) {
                // Refresh comments to get full user data
                const c = await getComments(card.id);
                setComments(c as CommentWithUser[]);
            }
        } catch (error) {
            console.error("Error adding comment:", error);
            // Remove temp comment
            setComments(comments.filter(c => c.id !== tempComment.id));
            setNewComment(commentContent);
            toast.error("Failed to add comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Delete comment - with optimistic update
    const handleDeleteComment = async (commentId: string) => {
        const prevComments = [...comments];
        // Optimistic update
        setComments(comments.filter(c => c.id !== commentId));

        try {
            await deleteComment(commentId);
        } catch (error) {
            console.error("Error deleting comment:", error);
            setComments(prevComments); // Rollback
            toast.error("Failed to delete comment");
        }
    };

    // Toggle label - with optimistic update
    const handleToggleLabel = async (label: Label) => {
        const hasLabel = card.labels?.some(l => l.id === label.id);
        setActionLoading(`label-${label.id}`);

        // Optimistic update
        const newLabels = hasLabel
            ? card.labels?.filter(l => l.id !== label.id) || []
            : [...(card.labels || []), label];
        onUpdate({ ...card, labels: newLabels });

        try {
            if (hasLabel) {
                await removeLabelFromCard(card.id, label.id);
            } else {
                await addLabelToCard(card.id, label.id);
            }
        } catch (error) {
            console.error("Error toggling label:", error);
            // Rollback
            onUpdate({ ...card, labels: hasLabel ? [...(card.labels || []), label] : card.labels?.filter(l => l.id !== label.id) || [] });
            toast.error("Failed to update label");
        } finally {
            setActionLoading(null);
        }
    };

    // Toggle assignee - with optimistic update
    const handleToggleAssignee = async (user: WorkspaceMember) => {
        const isAssigned = card.assignees?.some(a => a.id === user.id);
        setActionLoading(`assignee-${user.id}`);

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

        // Optimistic update
        const newAssignees = isAssigned
            ? card.assignees?.filter(a => a.id !== user.id) || []
            : [...(card.assignees || []), userAsAssignee];
        onUpdate({ ...card, assignees: newAssignees });

        try {
            if (isAssigned) {
                await unassignUserFromCard(card.id, user.id);
            } else {
                await assignUserToCard(card.id, user.id);
            }
        } catch (error) {
            console.error("Error toggling assignee:", error);
            // Rollback
            onUpdate({
                ...card,
                assignees: isAssigned
                    ? [...(card.assignees || []), userAsAssignee]
                    : card.assignees?.filter(a => a.id !== user.id) || []
            });
            toast.error("Failed to update assignee");
        } finally {
            setActionLoading(null);
        }
    };

    // File upload
    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploadingFile(true);

        for (const file of Array.from(files)) {
            // Validate file size (1MB limit for server actions)
            if (file.size > 1 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 1MB limit. Please use a smaller file.`);
                continue;
            }

            const formData = new FormData();
            formData.append("file", file);

            try {
                const attachment = await uploadAttachment(card.id, formData);
                if (attachment) {
                    setAttachments(prev => [attachment, ...prev]);
                    onUpdate({ ...card, attachments_count: (card.attachments_count || 0) + 1 });
                }
            } catch (error) {
                console.error("Error uploading file:", error);
                toast.error(`Failed to upload ${file.name}`);
            }
        }

        setUploadingFile(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Delete attachment
    const handleDeleteAttachment = async (attachmentId: string) => {
        const prevAttachments = [...attachments];
        // Optimistic update
        setAttachments(attachments.filter(a => a.id !== attachmentId));
        onUpdate({ ...card, attachments_count: Math.max(0, (card.attachments_count || 0) - 1) });

        try {
            await deleteAttachment(attachmentId);
        } catch (error) {
            console.error("Error deleting attachment:", error);
            setAttachments(prevAttachments); // Rollback
            onUpdate({ ...card, attachments_count: (card.attachments_count || 0) });
            toast.error("Failed to delete attachment");
        }
    };

    // Handle delete with confirmation
    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    // Confirmed delete card
    const confirmDeleteCard = () => {
        setShowDeleteConfirm(false);
        onDelete();
    };

    // Check if file is an image
    const isImage = (type: string | null) => type?.startsWith("image/");

    // Format file size
    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-8 md:pt-16 px-3 sm:px-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-3xl shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-start justify-between p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-5 sm:space-y-6 order-2 md:order-1">
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
                                                    const isLoading = actionLoading === `label-${label.id}`;
                                                    return (
                                                        <button
                                                            key={label.id}
                                                            onClick={() => handleToggleLabel(label)}
                                                            disabled={isLoading}
                                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                                                        >
                                                            <span
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: label.color }}
                                                            />
                                                            <span className="flex-1 text-left text-sm text-zinc-700 dark:text-zinc-300">
                                                                {label.name}
                                                            </span>
                                                            {isLoading ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                                                            ) : hasLabel ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            ) : null}
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
                                        disabled={actionLoading === "dueDate"}
                                        className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === "dueDate" ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Save"
                                        )}
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
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${card.is_complete
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                        : new Date(card.due_date) < new Date()
                                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                        }`}
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
                                                        const isLoading = actionLoading === `assignee-${user.id}`;
                                                        return (
                                                            <button
                                                                key={user.id}
                                                                onClick={() => handleToggleAssignee(user)}
                                                                disabled={isLoading}
                                                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
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
                                                                {isLoading ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                                                                ) : isAssigned ? (
                                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                ) : null}
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

                        {/* Attachments Section */}
                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                    <Paperclip className="w-4 h-4" />
                                    Attachments
                                    {attachments.length > 0 && (
                                        <span className="text-xs bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
                                            {attachments.length}
                                        </span>
                                    )}
                                </h4>
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e.target.files)}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingFile}
                                        className="flex items-center gap-1.5 px-2 py-1 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
                                    >
                                        {uploadingFile ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Upload className="w-4 h-4" />
                                        )}
                                        Add
                                    </button>
                                </div>
                            </div>

                            {loadingAttachments ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                                </div>
                            ) : attachments.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {attachments.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="group relative bg-zinc-50 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700"
                                        >
                                            {isImage(attachment.type) ? (
                                                <a
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block"
                                                >
                                                    <img
                                                        src={attachment.url}
                                                        alt={attachment.name}
                                                        className="w-full h-32 object-cover"
                                                    />
                                                </a>
                                            ) : (
                                                <a
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center h-32 bg-zinc-100 dark:bg-zinc-700"
                                                >
                                                    <File className="w-10 h-10 text-zinc-400" />
                                                </a>
                                            )}
                                            <div className="p-2">
                                                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                                                    {attachment.name}
                                                </p>
                                                <p className="text-xs text-zinc-400">
                                                    {formatFileSize(attachment.size_bytes)}
                                                </p>
                                            </div>
                                            {/* Hover Actions */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <a
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 bg-white dark:bg-zinc-800 rounded shadow hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteAttachment(attachment.id)}
                                                    className="p-1.5 bg-white dark:bg-zinc-800 rounded shadow hover:bg-red-100 dark:hover:bg-red-900/30"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-400 dark:text-zinc-500 text-sm italic text-center py-4">
                                    No attachments yet
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

                    {/* Sidebar Actions - appears first on mobile, last on desktop */}
                    <div className="space-y-2 order-1 md:order-2">
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
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingFile}
                                    className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-50"
                                >
                                    {uploadingFile ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Paperclip className="w-4 h-4" />
                                    )}
                                    Add Attachment
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

            {/* Delete Card Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDeleteCard}
                title="Delete Card"
                message="Are you sure you want to delete this card? This action cannot be undone."
                confirmText="Delete Card"
                cancelText="Cancel"
                variant="danger"
                icon="trash"
            />
        </div>
    );
}
