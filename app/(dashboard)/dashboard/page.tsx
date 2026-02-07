"use client";

import React, { useEffect, useState, Suspense, useCallback, useMemo, useTransition, useRef } from "react";
import {
    FolderKanban,
    Plus,
    Sparkles,
    LayoutGrid,
    Loader2,
    X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { syncCurrentUser, createWorkspace, createBoard, uploadBoardBackground } from "@/lib/actions";
import { useWorkspaces } from "@/lib/context/WorkspaceContext";
import { useBoardsQuery, useDashboardStatsQuery } from "@/lib/hooks";
import { workspaceNameSchema, boardNameSchema, boardColorSchema } from "@/lib/validations";
import { DashboardPageSkeleton } from "@/components/ui/Skeleton";
import type { Board, Workspace } from "@/lib/types/database";

// Component to handle search params
function SearchParamsHandler({
    workspaces,
    onCreateWorkspace,
    onCreateBoard,
}: {
    workspaces: Workspace[];
    onCreateWorkspace: () => void;
    onCreateBoard: (workspaceId: string) => void;
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Use first workspace ID as a stable primitive dependency
    const firstWorkspaceId = workspaces[0]?.id;
    const hasWorkspaces = workspaces.length > 0;

    useEffect(() => {
        const createType = searchParams.get("create");
        if (createType === "workspace") {
            onCreateWorkspace();
            router.replace("/dashboard", { scroll: false });
        } else if (createType === "board") {
            if (hasWorkspaces && firstWorkspaceId) {
                onCreateBoard(firstWorkspaceId);
            } else {
                toast.error("Create a workspace first before adding a board");
                onCreateWorkspace();
            }
            router.replace("/dashboard", { scroll: false });
        }
    }, [searchParams, router, hasWorkspaces, firstWorkspaceId, onCreateWorkspace, onCreateBoard]);

    return null;
}

export default function DashboardPage() {
    const { workspaces, loading: loadingWorkspaces, addWorkspace } = useWorkspaces();
    const firstWorkspaceId = workspaces[0]?.id;
    
    // Use React Query for boards - cached and optimized
    const { data: boards = [], isLoading: loadingBoards } = useBoardsQuery(firstWorkspaceId || "");
    
    // Use React Query for stats - cached for 30s
    const { data: stats } = useDashboardStatsQuery();
    
    const [creating, setCreating] = useState(false);
    const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
    const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [newBoardName, setNewBoardName] = useState("");
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
    const [newBoardColor, setNewBoardColor] = useState("#3b82f6");
    const [newBoardImage, setNewBoardImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Sync user on mount (fire and forget)
    const hasSyncedRef = useRef(false);
    useEffect(() => {
        if (!hasSyncedRef.current) {
            hasSyncedRef.current = true;
            syncCurrentUser().catch(console.error);
        }
    }, []);

    const router = useRouter();

    const handleOpenCreateWorkspace = useCallback(() => {
        setShowCreateWorkspaceModal(true);
    }, []);

    const handleOpenCreateBoard = useCallback((workspaceId: string) => {
        setSelectedWorkspaceId(workspaceId);
        setShowCreateBoardModal(true);
    }, []);

    const handleCreateWorkspace = async () => {
        // Validate input
        const validation = workspaceNameSchema.safeParse(newWorkspaceName);
        if (!validation.success) {
            toast.error(validation.error.issues[0]?.message || "Invalid workspace name");
            return;
        }

        setCreating(true);
        
        // Optimistic update - create temp workspace immediately
        const tempId = `temp-${Date.now()}`;
        const tempWorkspace: Workspace = {
            id: tempId,
            name: validation.data,
            description: null,
            owner_id: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        
        // Immediately add to UI
        addWorkspace(tempWorkspace);
        setNewWorkspaceName("");
        setShowCreateWorkspaceModal(false);

        try {
            const result = await createWorkspace({ name: validation.data });
            if (result.workspace) {
                // Replace temp with real workspace using transition for smooth update
                startTransition(() => {
                    // Context will be updated by the action
                });
                toast.success("Workspace created successfully");
            } else {
                toast.error(result.error || "Failed to create workspace");
            }
        } catch {
            toast.error("Failed to create workspace. Please try again.");
        } finally {
            setCreating(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!selectedWorkspaceId) {
            toast.error("Please select a workspace first");
            return;
        }

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

            const result = await uploadBoardBackground(selectedWorkspaceId, formData);
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
    };

    const handleCreateBoard = async () => {
        // Validate inputs
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

        if (!selectedWorkspaceId) {
            toast.error("Please select a workspace");
            return;
        }

        setCreating(true);
        
        // Close modal immediately for faster feel
        setShowCreateBoardModal(false);
        const boardName = nameValidation.data;
        setNewBoardName("");
        setNewBoardColor("#3b82f6");
        setNewBoardImage(null);

        try {
            const result = await createBoard({
                workspace_id: selectedWorkspaceId,
                name: boardName,
                background_color: newBoardColor,
                background_image: newBoardImage || undefined,
            });
            if (result.board) {
                toast.success("Board created successfully");
                router.push(`/dashboard/board/${result.board.id}`);
            } else {
                toast.error(result.error || "Failed to create board");
            }
        } catch {
            toast.error("Failed to create board. Please try again.");
        } finally {
            setCreating(false);
        }
    };

    // Memoize derived values
    const hasContent = useMemo(() => workspaces.length > 0 || boards.length > 0, [workspaces.length, boards.length]);
    
    const boardColors = useMemo(() => [
        "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
        "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
    ], []);

    // Show skeleton while loading
    const isLoading = loadingWorkspaces || (firstWorkspaceId && loadingBoards);
    if (isLoading) {
        return <DashboardPageSkeleton />;
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-200">
            {/* Handle search params in Suspense boundary */}
            <Suspense fallback={null}>
                <SearchParamsHandler
                    workspaces={workspaces}
                    onCreateWorkspace={handleOpenCreateWorkspace}
                    onCreateBoard={handleOpenCreateBoard}
                />
            </Suspense>

            {/* Page Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
                    <p className="text-sm text-zinc-700 dark:text-zinc-400 mt-0.5">Welcome back to your workspace</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto p-6">
                {!hasContent ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full min-h-100">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                                <FolderKanban className="w-10 h-10 text-zinc-600 dark:text-zinc-600" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-zinc-700 dark:text-zinc-400" />
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                            No workspaces yet
                        </h2>
                        <p className="text-sm text-zinc-700 dark:text-zinc-400 text-center max-w-sm mb-8">
                            Create your first workspace to get started. Organize your boards,
                            collaborate with your team, and track progress.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <button
                                onClick={() => setShowCreateWorkspaceModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all hover:scale-[1.02]"
                            >
                                <Plus className="w-4 h-4" />
                                Create Workspace
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Content with Workspaces/Boards */
                    <div className="space-y-8">
                        {/* Workspaces Grid */}
                        <section>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                                Your Workspaces
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {workspaces.map((workspace) => (
                                    <WorkspaceCard key={workspace.id} workspace={workspace} />
                                ))}

                                {/* Add Workspace Card */}
                                <button
                                    onClick={() => setShowCreateWorkspaceModal(true)}
                                    className="group flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all min-h-35"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Plus className="w-5 h-5 text-zinc-700 dark:text-zinc-400" />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-400">
                                        New Workspace
                                    </span>
                                </button>
                            </div>
                        </section>

                        {/* Recent Boards */}
                        {boards.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                                    Recent Boards
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {boards.map((board) => (
                                        <BoardCard key={board.id} board={board} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Quick Stats */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/50">
                            <StatCard title="Workspaces" value={(stats?.totalWorkspaces ?? workspaces.length).toString()} />
                            <StatCard title="Boards" value={(stats?.totalBoards ?? boards.length).toString()} />
                            <StatCard title="Team Members" value={(stats?.teamMembersCount ?? 0).toString()} />
                        </section>
                    </div>
                )}
            </div>

            {/* Create Workspace Modal */}
            {showCreateWorkspaceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowCreateWorkspaceModal(false)}
                    />
                    <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                            Create Workspace
                        </h3>
                        <input
                            type="text"
                            placeholder="Workspace name..."
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 mb-4"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateWorkspaceModal(false)}
                                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateWorkspace}
                                disabled={!newWorkspaceName.trim() || creating}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Board Modal */}
            {showCreateBoardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => {
                            setShowCreateBoardModal(false);
                            setNewBoardName("");
                            setNewBoardColor("#3b82f6");
                            setNewBoardImage(null);
                        }}
                    />
                    <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                            Create Board
                        </h3>

                        {/* Board Name */}
                        <input
                            type="text"
                            placeholder="Board name..."
                            value={newBoardName}
                            onChange={(e) => setNewBoardName(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 mb-4"
                            autoFocus
                        />

                        {/* Workspace Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Workspace
                            </label>
                            <select
                                value={selectedWorkspaceId}
                                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                            >
                                {workspaces.map((ws) => (
                                    <option key={ws.id} value={ws.id}>
                                        {ws.name}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                    disabled={uploadingImage || !selectedWorkspaceId}
                                    className={`w-8 h-8 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center transition-all hover:border-zinc-400 dark:hover:border-zinc-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                                    setShowCreateBoardModal(false);
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
                                disabled={!newBoardName.trim() || !selectedWorkspaceId || creating}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                                Create Board
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* Workspace Card Component - Memoized */
const WorkspaceCard = React.memo(function WorkspaceCard({ workspace }: { workspace: Workspace }) {
    return (
        <Link
            href={`/dashboard/workspace/${workspace.id}`}
            className="group flex flex-col p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-zinc-900/50 transition-all"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-zinc-700 to-zinc-900 dark:from-zinc-600 dark:to-zinc-800 flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                        {workspace.name}
                    </h3>
                </div>
            </div>
            {workspace.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {workspace.description}
                </p>
            )}
            <div className="mt-auto pt-3 flex items-center text-xs text-zinc-400 dark:text-zinc-500">
                <span>Created {new Date(workspace.created_at).toLocaleDateString()}</span>
            </div>
        </Link>
    );
});

/* Board Card Component - Memoized */
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
            className="group relative overflow-hidden p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all"
            style={backgroundStyle}
        >
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="relative z-10">
                <h3 className="font-semibold text-white mb-1 group-hover:scale-[1.02] transition-transform origin-left">
                    {board.name}
                </h3>
                {board.description && (
                    <p className="text-sm text-white/70 line-clamp-2">
                        {board.description}
                    </p>
                )}
            </div>
        </Link>
    );
});

/* Stat Card Component - Memoized */
const StatCard = React.memo(function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-xl">
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-1">{title}</p>
            <p className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200">{value}</p>
        </div>
    );
});
