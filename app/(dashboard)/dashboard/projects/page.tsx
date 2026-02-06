"use client";

import React, { useEffect, useState } from "react";
import {
    LayoutGrid,
    Plus,
    Search,
    Filter,
    Grid3X3,
    List,
    Loader2,
    FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useWorkspaces } from "@/lib/context/WorkspaceContext";
import { getBoards, createBoard } from "@/lib/actions";
import type { Board } from "@/lib/types/database";

interface BoardsByWorkspace {
    workspaceId: string;
    workspaceName: string;
    boards: Board[];
}

export default function ProjectsPage() {
    const { workspaces, loading: loadingWorkspaces } = useWorkspaces();
    const [boardsByWorkspace, setBoardsByWorkspace] = useState<BoardsByWorkspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Fetch all boards across all workspaces
    useEffect(() => {
        async function fetchAllBoards() {
            if (loadingWorkspaces) return;

            try {
                const allBoards: BoardsByWorkspace[] = await Promise.all(
                    workspaces.map(async (ws) => {
                        const boards = await getBoards(ws.id);
                        return {
                            workspaceId: ws.id,
                            workspaceName: ws.name,
                            boards,
                        };
                    })
                );
                setBoardsByWorkspace(allBoards);
            } catch (error) {
                console.error("Error fetching boards:", error);
                toast.error("Failed to load boards");
            } finally {
                setLoading(false);
            }
        }

        fetchAllBoards();
    }, [workspaces, loadingWorkspaces]);

    // Filter boards based on search
    const filteredBoards = searchQuery
        ? boardsByWorkspace
            .map((ws) => ({
                ...ws,
                boards: ws.boards.filter((b) =>
                    b.name.toLowerCase().includes(searchQuery.toLowerCase())
                ),
            }))
            .filter((ws) => ws.boards.length > 0)
        : boardsByWorkspace;

    const totalBoards = boardsByWorkspace.reduce((acc, ws) => acc + ws.boards.length, 0);

    if (loading || loadingWorkspaces) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-black">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                        Projects
                    </h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        {totalBoards} board{totalBoards !== 1 ? "s" : ""} across {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search boards..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white dark:bg-zinc-800 shadow-sm" : ""}`}
                        >
                            <Grid3X3 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded ${viewMode === "list" ? "bg-white dark:bg-zinc-800 shadow-sm" : ""}`}
                        >
                            <List className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                {filteredBoards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-75">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                            <FolderKanban className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                            {searchQuery ? "No boards found" : "No boards yet"}
                        </h2>
                        <p className="text-sm text-zinc-500 text-center max-w-sm">
                            {searchQuery
                                ? "Try a different search term"
                                : "Create a board in any workspace to get started"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {filteredBoards.map((ws) => (
                            <section key={ws.workspaceId}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded bg-linear-to-br from-zinc-600 to-zinc-800 flex items-center justify-center">
                                        <LayoutGrid className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        {ws.workspaceName}
                                    </h2>
                                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                        ({ws.boards.length})
                                    </span>
                                </div>

                                <div
                                    className={
                                        viewMode === "grid"
                                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                                            : "space-y-2"
                                    }
                                >
                                    {ws.boards.map((board) => (
                                        <BoardCard
                                            key={board.id}
                                            board={board}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* Board Card Component */
function BoardCard({ board, viewMode }: { board: Board; viewMode: "grid" | "list" }) {
    if (viewMode === "list") {
        return (
            <Link
                href={`/dashboard/board/${board.id}`}
                className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
                <div
                    className="w-10 h-10 rounded-lg shrink-0"
                    style={{ backgroundColor: board.background_color || "#6366f1" }}
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {board.name}
                    </h3>
                    {board.description && (
                        <p className="text-sm text-zinc-500 truncate">{board.description}</p>
                    )}
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/dashboard/board/${board.id}`}
            className="group relative overflow-hidden p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all min-h-30"
            style={{ backgroundColor: board.background_color || "#6366f1" }}
        >
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="relative z-10">
                <h3 className="font-semibold text-white mb-1 group-hover:scale-[1.02] transition-transform origin-left">
                    {board.name}
                </h3>
                {board.description && (
                    <p className="text-sm text-white/70 line-clamp-2">{board.description}</p>
                )}
            </div>
        </Link>
    );
}
