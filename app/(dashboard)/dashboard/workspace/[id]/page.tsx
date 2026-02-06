"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    MoreHorizontal,
    Loader2,
    LayoutGrid,
    Users,
    Settings
} from "lucide-react";
import { getWorkspaceWithBoards, createBoard, getBoards } from "@/lib/actions";
import type { WorkspaceWithBoards, Board } from "@/lib/types/database";

export default function WorkspacePage() {
    const params = useParams();
    const workspaceId = params.id as string;

    const [workspace, setWorkspace] = useState<WorkspaceWithBoards | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        async function fetchWorkspace() {
            try {
                const ws = await getWorkspaceWithBoards(workspaceId);
                setWorkspace(ws);
            } catch (error) {
                console.error("Error fetching workspace:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchWorkspace();
    }, [workspaceId]);

    const handleCreateBoard = async () => {
        if (!newBoardName.trim()) return;

        setCreating(true);
        try {
            const board = await createBoard({
                workspace_id: workspaceId,
                name: newBoardName
            });
            if (board && workspace) {
                setWorkspace({
                    ...workspace,
                    boards: [...workspace.boards, board]
                });
                setNewBoardName("");
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error("Error creating board:", error);
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-200">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                </div>
            </div>
        );
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-zinc-700 to-zinc-900 dark:from-zinc-600 dark:to-zinc-800 flex items-center justify-center">
                            <LayoutGrid className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                {workspace.name}
                            </h1>
                            <p className="text-sm text-zinc-500">
                                {workspace.boards.length} board{workspace.boards.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <Users className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <Settings className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        New Board
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowCreateModal(false)}
                    />
                    <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                            Create Board
                        </h3>
                        <input
                            type="text"
                            placeholder="Board name..."
                            value={newBoardName}
                            onChange={(e) => setNewBoardName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 mb-4"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
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
        </div>
    );
}

/* Board Card Component */
function BoardCard({ board }: { board: Board }) {
    return (
        <Link
            href={`/dashboard/board/${board.id}`}
            className="group relative overflow-hidden p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all min-h-30"
            style={{ backgroundColor: board.background_color || "#1f1f23" }}
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
}
