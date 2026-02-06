"use client";

import React, { useEffect, useState } from "react";
import {
    FolderKanban,
    Plus,
    Sparkles,
    Loader2,
    LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { syncCurrentUser, createWorkspace, createBoard, getBoards } from "@/lib/actions";
import { useWorkspaces } from "@/lib/context/WorkspaceContext";
import { workspaceNameSchema, boardNameSchema, boardColorSchema } from "@/lib/validations";
import type { Board, Workspace } from "@/lib/types/database";

export default function DashboardPage() {
    const { workspaces, loading: loadingWorkspaces, addWorkspace } = useWorkspaces();
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
    const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [newBoardName, setNewBoardName] = useState("");
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
    const [newBoardColor, setNewBoardColor] = useState("#3b82f6");

    const searchParams = useSearchParams();
    const router = useRouter();

    // Handle URL query params for create actions
    useEffect(() => {
        const createType = searchParams.get("create");
        if (createType === "workspace") {
            setShowCreateWorkspaceModal(true);
            // Clear the query param
            router.replace("/dashboard", { scroll: false });
        } else if (createType === "board") {
            if (workspaces.length > 0) {
                setSelectedWorkspaceId(workspaces[0].id);
                setShowCreateBoardModal(true);
            } else {
                toast.error("Create a workspace first before adding a board");
                setShowCreateWorkspaceModal(true);
            }
            router.replace("/dashboard", { scroll: false });
        }
    }, [searchParams, router, workspaces]);

    // Sync user and fetch boards on mount
    useEffect(() => {
        async function initDashboard() {
            try {
                // Sync user to Supabase
                await syncCurrentUser();

                // Fetch boards for first workspace if exists
                if (workspaces.length > 0) {
                    const b = await getBoards(workspaces[0].id);
                    setBoards(b);
                }
            } catch (error) {
                console.error("Error initializing dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        if (!loadingWorkspaces) {
            initDashboard();
        }
    }, [workspaces, loadingWorkspaces]);

    const handleCreateWorkspace = async () => {
        // Validate input
        const validation = workspaceNameSchema.safeParse(newWorkspaceName);
        if (!validation.success) {
            toast.error(validation.error.issues[0]?.message || "Invalid workspace name");
            return;
        }

        setCreating(true);
        try {
            const result = await createWorkspace({ name: validation.data });
            if (result.workspace) {
                addWorkspace(result.workspace);
                setNewWorkspaceName("");
                setShowCreateWorkspaceModal(false);
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
        try {
            const result = await createBoard({
                workspace_id: selectedWorkspaceId,
                name: nameValidation.data,
                background_color: newBoardColor,
            });
            if (result.board) {
                setNewBoardName("");
                setShowCreateBoardModal(false);
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

    if (loading || loadingWorkspaces) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-200">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                </div>
            </div>
        );
    }

    const hasContent = workspaces.length > 0 || boards.length > 0;

    const boardColors = [
        "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
        "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-200">
            {/* Page Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">Welcome back to your workspace</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto p-6">
                {!hasContent ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full min-h-100">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                                <FolderKanban className="w-10 h-10 text-zinc-400 dark:text-zinc-600" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                            No workspaces yet
                        </h2>
                        <p className="text-sm text-zinc-500 text-center max-w-sm mb-8">
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
                                        <Plus className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
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
                            <StatCard title="Workspaces" value={workspaces.length.toString()} />
                            <StatCard title="Boards" value={boards.length.toString()} />
                            <StatCard title="Team Members" value="—" />
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
                                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
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
                        onClick={() => setShowCreateBoardModal(false)}
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

                        {/* Color Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Background Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {boardColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewBoardColor(color)}
                                        className={`w-8 h-8 rounded-lg transition-all ${newBoardColor === color
                                            ? "ring-2 ring-offset-2 ring-zinc-500 dark:ring-offset-zinc-900 scale-110"
                                            : "hover:scale-105"
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateBoardModal(false)}
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

/* Workspace Card Component */
function WorkspaceCard({ workspace }: { workspace: Workspace }) {
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
}

/* Board Card Component */
function BoardCard({ board }: { board: Board }) {
    return (
        <Link
            href={`/dashboard/board/${board.id}`}
            className="group relative overflow-hidden p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all"
            style={{ backgroundColor: board.background_color || "#1f1f23" }}
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
}

/* Stat Card Component */
function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-xl">
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-1">{title}</p>
            <p className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200">{value}</p>
        </div>
    );
}
