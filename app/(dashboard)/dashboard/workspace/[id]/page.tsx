"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    MoreHorizontal,
    Loader2,
    LayoutGrid,
    Users,
    Settings,
    Image as ImageIcon,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { getWorkspaceWithBoards, createBoard, uploadBoardBackground } from "@/lib/actions";
import { boardNameSchema, boardColorSchema } from "@/lib/validations";
import { WorkspaceSettingsModal } from "@/components/dashboard-components/WorkspaceSettingsModal";
import { WorkspacePageSkeleton } from "@/components/ui/Skeleton";
import type { WorkspaceWithBoards, Board } from "@/lib/types/database";

export default function WorkspacePage() {
    const params = useParams();
    const workspaceId = params.id as string;

    const [workspace, setWorkspace] = useState<WorkspaceWithBoards | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");
    const [newBoardColor, setNewBoardColor] = useState("#3b82f6");
    const [newBoardImage, setNewBoardImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [creating, setCreating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const boardColors = useMemo(() => [
        "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
        "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
    ], []);

    useEffect(() => {
        async function fetchWorkspace() {
            try {
                const ws = await getWorkspaceWithBoards(workspaceId);
                setWorkspace(ws);
            } catch {
                toast.error("Failed to load workspace");
            } finally {
                setLoading(false);
            }
        }

        fetchWorkspace();
    }, [workspaceId]);

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPEG, PNG, WebP and GIF images are allowed");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5MB");
            return;
        }

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadBoardBackground(workspaceId, formData);
            if (result.url) {
                setNewBoardImage(result.url);
                toast.success("Image uploaded");
            } else {
                toast.error(result.error || "Failed to upload image");
            }
        } catch {
            toast.error("Failed to upload image");
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, [workspaceId]);

    const handleCreateBoard = useCallback(async () => {
        const nameValidation = boardNameSchema.safeParse(newBoardName);
        if (!nameValidation.success) {
            toast.error(nameValidation.error.issues[0]?.message || "Invalid board name");
            return;
        }

        const colorValidation = boardColorSchema.safeParse(newBoardColor);
        if (!colorValidation.success) {
            toast.error("Invalid board color");
            return;
        }

        if (!workspace) return;

        setCreating(true);

        // Optimistic update: Create temp board and close modal immediately
        const tempId = `temp-${Date.now()}`;
        const tempBoard: Board = {
            id: tempId,
            workspace_id: workspaceId,
            name: nameValidation.data,
            description: null,
            background_color: newBoardColor,
            background_image: newBoardImage,
            is_private: false,
            position: workspace.boards.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Update UI immediately
        setWorkspace({
            ...workspace,
            boards: [...workspace.boards, tempBoard]
        });
        setNewBoardName("");
        setNewBoardColor("#3b82f6");
        setNewBoardImage(null);
        setShowCreateModal(false);

        // Then sync with server
        try {
            const result = await createBoard({
                workspace_id: workspaceId,
                name: nameValidation.data,
                background_color: newBoardColor,
                background_image: newBoardImage || undefined,
            });
            if (result.board) {
                // Replace temp board with real one
                setWorkspace((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        boards: prev.boards.map((b) => 
                            b.id === tempId ? result.board! : b
                        )
                    };
                });
                toast.success("Board created");
            } else {
                // Rollback on error
                setWorkspace((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        boards: prev.boards.filter((b) => b.id !== tempId)
                    };
                });
                toast.error(result.error || "Failed to create board");
            }
        } catch {
            // Rollback on error
            setWorkspace((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    boards: prev.boards.filter((b) => b.id !== tempId)
                };
            });
            toast.error("Failed to create board");
        } finally {
            setCreating(false);
        }
    }, [newBoardName, newBoardColor, newBoardImage, workspace, workspaceId]);

    if (loading) {
        return <WorkspacePageSkeleton />;
    }

    if (!workspace) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-200">
                <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                        Workspace not found
                    </h2>
                    <Link
                        href="/dashboard"
                        className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-200">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <Link
                        href="/dashboard"
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
                    </Link>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-linear-to-br from-zinc-700 to-zinc-900 dark:from-zinc-600 dark:to-zinc-800 flex items-center justify-center shrink-0">
                            <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {workspace.name}
                            </h1>
                            <p className="text-xs sm:text-sm text-zinc-500">
                                {workspace.boards.length} board{workspace.boards.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    <button className="p-1.5 sm:p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
                    </button>
                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Workspace Settings"
                    >
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden xs:inline">New Board</span>
                        <span className="xs:hidden">New</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                {workspace.boards.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full min-h-100">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4">
                            <LayoutGrid className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                            No boards yet
                        </h2>
                        <p className="text-sm text-zinc-500 text-center max-w-sm mb-6">
                            Create your first board to start organizing your tasks and projects.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Create Board
                        </button>
                    </div>
                ) : (
                    /* Boards Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {workspace.boards.map((board) => (
                            <BoardCard key={board.id} board={board} />
                        ))}

                        {/* Add Board Card */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="group flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all min-h-30"
                        >
                            <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Plus className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                            </div>
                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                New Board
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Create Board Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => {
                            setShowCreateModal(false);
                            setNewBoardName("");
                            setNewBoardColor("#3b82f6");
                            setNewBoardImage(null);
                        }}
                    />
                    <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                            Create Board
                        </h3>

                        {/* Board Name */}
                        <input
                            type="text"
                            placeholder="Board name..."
                            value={newBoardName}
                            onChange={(e) => setNewBoardName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !creating && handleCreateBoard()}
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 mb-4"
                            autoFocus
                        />

                        {/* Background Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Background
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {/* Color Options */}
                                {boardColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            setNewBoardColor(color);
                                            setNewBoardImage(null);
                                        }}
                                        className={`w-8 h-8 rounded-lg transition-all ${
                                            !newBoardImage && newBoardColor === color
                                                ? "ring-2 ring-offset-2 ring-zinc-500 dark:ring-offset-zinc-900 scale-110"
                                                : "hover:scale-105"
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}

                                {/* Image Upload Button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className={`w-8 h-8 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center transition-all hover:border-zinc-400 dark:hover:border-zinc-500 hover:scale-105 ${
                                        newBoardImage ? "ring-2 ring-offset-2 ring-zinc-500 dark:ring-offset-zinc-900 scale-110" : ""
                                    }`}
                                    title="Upload custom image"
                                >
                                    {uploadingImage ? (
                                        <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4 text-zinc-400" />
                                    )}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>

                            {/* Image Preview */}
                            {newBoardImage && (
                                <div className="mt-3 relative">
                                    <div 
                                        className="w-full h-24 rounded-lg bg-cover bg-center border border-zinc-200 dark:border-zinc-700"
                                        style={{ backgroundImage: `url(${newBoardImage})` }}
                                    />
                                    <button
                                        onClick={() => setNewBoardImage(null)}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewBoardName("");
                                    setNewBoardColor("#3b82f6");
                                    setNewBoardImage(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateBoard}
                                disabled={!newBoardName.trim() || creating}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Workspace Settings Modal */}
            {showSettingsModal && (
                <WorkspaceSettingsModal
                    workspace={workspace}
                    onClose={() => setShowSettingsModal(false)}
                    onUpdate={(updates) => {
                        setWorkspace({ ...workspace, ...updates });
                        setShowSettingsModal(false);
                    }}
                />
            )}
        </div>
    );
}

/* Board Card Component - Memoized for performance */
const BoardCard = React.memo(function BoardCard({ board }: { board: Board }) {
    const backgroundStyle = board.background_image
        ? {
            backgroundImage: `url(${board.background_image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { backgroundColor: board.background_color || "#1f1f23" };

    return (
        <Link
            href={`/dashboard/board/${board.id}`}
            className="group relative overflow-hidden p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all min-h-30"
            style={backgroundStyle}
        >
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-white group-hover:scale-[1.02] transition-transform origin-left">
                        {board.name}
                    </h3>
                    <button
                        onClick={(e) => { e.preventDefault(); }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all"
                    >
                        <MoreHorizontal className="w-4 h-4 text-white" />
                    </button>
                </div>
                {board.description && (
                    <p className="text-sm text-white/70 mt-1 line-clamp-2">
                        {board.description}
                    </p>
                )}
            </div>
        </Link>
    );
});
