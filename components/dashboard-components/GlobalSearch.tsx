"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, LayoutGrid, Folder, FileText, Users } from "lucide-react";
import { getWorkspaces } from "@/lib/actions";
import type { Workspace, Board } from "@/lib/types/database";

/* =====================================================
   Types
   ===================================================== */

type SearchResult = {
    type: "workspace" | "board";
    id: string;
    name: string;
    description?: string | null;
    parentName?: string;
    parentId?: string;
};

/* =====================================================
   Main Component
   ===================================================== */

export function GlobalSearch() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Search logic
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const workspaces = await getWorkspaces();
            const searchResults: SearchResult[] = [];
            const lowerQuery = searchQuery.toLowerCase();

            // Search through workspaces and boards
            for (const ws of workspaces) {
                // Check workspace name
                if (ws.name.toLowerCase().includes(lowerQuery)) {
                    searchResults.push({
                        type: "workspace",
                        id: ws.id,
                        name: ws.name,
                        description: ws.description,
                    });
                }

                // Check boards in workspace
                if ((ws as any).boards) {
                    for (const board of (ws as any).boards) {
                        if (board.name.toLowerCase().includes(lowerQuery)) {
                            searchResults.push({
                                type: "board",
                                id: board.id,
                                name: board.name,
                                description: board.description,
                                parentName: ws.name,
                                parentId: ws.id,
                            });
                        }
                    }
                }
            }

            setResults(searchResults.slice(0, 10)); // Limit to 10 results
            setSelectedIndex(0);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            performSearch(query);
        }, 200);

        return () => clearTimeout(timeout);
    }, [query, performSearch]);

    // Handle result selection
    const handleSelect = (result: SearchResult) => {
        setIsOpen(false);
        setQuery("");
        if (result.type === "workspace") {
            router.push(`/dashboard/workspace/${result.id}`);
        } else {
            router.push(`/dashboard/board/${result.id}`);
        }
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-medium">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-100 flex items-start justify-center pt-[20vh]">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                    <Search className="w-5 h-5 text-zinc-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search workspaces and boards..."
                        className="flex-1 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                    />
                    {loading && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-4 h-4 text-zinc-500" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                    {query && results.length === 0 && !loading && (
                        <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                            No results found for "{query}"
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="py-2">
                            {results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleSelect(result)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${index === selectedIndex
                                        ? "bg-zinc-100 dark:bg-zinc-800"
                                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${result.type === "workspace"
                                        ? "bg-zinc-200 dark:bg-zinc-700"
                                        : "bg-indigo-100 dark:bg-indigo-900/30"
                                        }`}>
                                        {result.type === "workspace" ? (
                                            <Folder className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                        ) : (
                                            <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                            {result.name}
                                        </p>
                                        {result.parentName && (
                                            <p className="text-xs text-zinc-500 truncate">
                                                in {result.parentName}
                                            </p>
                                        )}
                                        {!result.parentName && result.description && (
                                            <p className="text-xs text-zinc-500 truncate">
                                                {result.description}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs text-zinc-400 capitalize">
                                        {result.type}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {!query && (
                        <div className="px-4 py-6 text-center text-zinc-500 text-sm">
                            Start typing to search workspaces and boards
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">↑↓</kbd>
                        navigate
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">↵</kbd>
                        select
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">esc</kbd>
                        close
                    </span>
                </div>
            </div>
        </div>
    );
}
