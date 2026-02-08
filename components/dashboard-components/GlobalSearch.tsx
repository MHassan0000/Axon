"use client";

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    X,
    Loader2,
    LayoutGrid,
    Folder,
    FileText,
    List,
    Clock,
    CheckCircle2,
    Trash2,
    ArrowRight,
} from "lucide-react";
import { useGlobalSearch, useRecentSearches } from "@/lib/hooks/useSearch";
import type { SearchResult } from "@/lib/actions/search";

// =====================================================
// Types
// =====================================================

interface GlobalSearchProps {
    placeholder?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

// =====================================================
// Result Item Component (Memoized)
// =====================================================

const SearchResultItem = memo(function SearchResultItem({
    result,
    isSelected,
    onClick,
}: {
    result: SearchResult;
    isSelected: boolean;
    onClick: () => void;
}) {
    const getIcon = () => {
        switch (result.type) {
            case "workspace":
                return <Folder className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />;
            case "board":
                return <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
            case "list":
                return <List className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
            case "card":
                return result.isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                    <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                );
            default:
                return <FileText className="w-4 h-4 text-zinc-500" />;
        }
    };

    const getIconBgColor = () => {
        switch (result.type) {
            case "workspace":
                return "bg-zinc-200 dark:bg-zinc-700";
            case "board":
                return result.color
                    ? ""
                    : "bg-indigo-100 dark:bg-indigo-900/30";
            case "list":
                return "bg-emerald-100 dark:bg-emerald-900/30";
            case "card":
                return result.isComplete
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-orange-100 dark:bg-orange-900/30";
            default:
                return "bg-zinc-200 dark:bg-zinc-700";
        }
    };

    const getBreadcrumb = () => {
        const parts: string[] = [];
        if (result.workspaceName && result.type !== "workspace") {
            parts.push(result.workspaceName);
        }
        if (result.boardName && result.type !== "board" && result.type !== "workspace") {
            parts.push(result.boardName);
        }
        if (result.listName && result.type === "card") {
            parts.push(result.listName);
        }
        return parts.join(" / ");
    };

    const breadcrumb = getBreadcrumb();

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isSelected
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            }`}
        >
            <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getIconBgColor()}`}
                style={
                    result.type === "board" && result.color
                        ? { backgroundColor: result.color }
                        : undefined
                }
            >
                {result.type === "board" && result.color ? (
                    <LayoutGrid className="w-4 h-4 text-white" />
                ) : (
                    getIcon()
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {result.name}
                </p>
                {breadcrumb && (
                    <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                        {breadcrumb}
                    </p>
                )}
                {!breadcrumb && result.description && (
                    <p className="text-xs text-zinc-500 truncate">
                        {result.description}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {result.dueDate && (
                    <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                            result.isComplete
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : new Date(result.dueDate) < new Date()
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                    >
                        {new Date(result.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                )}
                <span className="text-xs text-zinc-400 capitalize bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {result.type}
                </span>
            </div>
        </button>
    );
});

// =====================================================
// Recent Search Item Component
// =====================================================

const RecentSearchItem = memo(function RecentSearchItem({
    query,
    onSelect,
    onRemove,
    isSelected,
}: {
    query: string;
    onSelect: () => void;
    onRemove: () => void;
    isSelected: boolean;
}) {
    return (
        <div
            className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                isSelected
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            }`}
        >
            <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
            <button
                onClick={onSelect}
                className="flex-1 text-left text-sm text-zinc-700 dark:text-zinc-300 truncate"
            >
                {query}
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100"
            >
                <X className="w-3 h-3 text-zinc-400" />
            </button>
        </div>
    );
});

// =====================================================
// Main Component
// =====================================================

export function GlobalSearch({ placeholder = "Search...", isOpen: externalIsOpen, onClose: externalOnClose }: GlobalSearchProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Use external control if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = (value: boolean) => {
        if (externalOnClose && !value) {
            externalOnClose();
        }
        setInternalIsOpen(value);
    };

    // Use React Query for search
    const {
        data: searchResponse,
        isLoading,
        isFetching,
    } = useGlobalSearch(query, {
        debounceMs: 300,
        enabled: isOpen,
    });

    const results = searchResponse?.results || [];

    // Recent searches
    const {
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
    } = useRecentSearches();

    // Show recent searches when query is empty
    const showRecentSearches = !query.trim() && recentSearches.length > 0;

    // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape" && isOpen) {
                e.preventDefault();
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [results.length, showRecentSearches]);

    // Handle result selection
    const handleSelect = useCallback(
        (result: SearchResult) => {
            setIsOpen(false);
            setQuery("");

            // Save to recent searches
            addRecentSearch(result.name, result);

            // Navigate based on type
            switch (result.type) {
                case "workspace":
                    router.push(`/dashboard/workspace/${result.id}`);
                    break;
                case "board":
                    router.push(`/dashboard/board/${result.id}`);
                    break;
                case "list":
                    if (result.boardId) {
                        router.push(`/dashboard/board/${result.boardId}`);
                    }
                    break;
                case "card":
                    if (result.boardId) {
                        // Navigate to board - card will open via URL params in future
                        router.push(`/dashboard/board/${result.boardId}`);
                    }
                    break;
            }
        },
        [router, addRecentSearch, setIsOpen]
    );

    // Handle recent search selection
    const handleRecentSearchSelect = useCallback((searchQuery: string) => {
        setQuery(searchQuery);
    }, []);

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const totalItems = showRecentSearches ? recentSearches.length : results.length;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((i) => Math.min(i + 1, totalItems - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (showRecentSearches && recentSearches[selectedIndex]) {
                    handleRecentSearchSelect(recentSearches[selectedIndex].query);
                } else if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
            }
        },
        [results, selectedIndex, handleSelect, showRecentSearches, recentSearches, handleRecentSearchSelect]
    );

    // Close modal
    const handleClose = useCallback(() => {
        setIsOpen(false);
        setQuery("");
        setSelectedIndex(0);
    }, [setIsOpen]);

    // Search button (collapsed state) - only show if not externally controlled
    if (!isOpen && externalIsOpen === undefined) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 w-full max-w-md px-3 py-2 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
            >
                <Search className="w-4 h-4" />
                <span className="flex-1 text-left">{placeholder}</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-medium">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
        );
    }

    // Don't render modal if not open
    if (!isOpen) {
        return null;
    }

    // Full search modal (works for both desktop and mobile)
    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search workspaces, boards, lists, and cards..."
                        className="flex-1 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none text-base"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                    />
                    {(isLoading || isFetching) && query.trim().length >= 2 && (
                        <Loader2 className="w-5 h-5 text-zinc-400 animate-spin shrink-0" />
                    )}
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {/* Recent Searches */}
                    {showRecentSearches && (
                        <div className="py-2">
                            <div className="flex items-center justify-between px-4 py-2">
                                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Recent Searches
                                </span>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                >
                                    Clear all
                                </button>
                            </div>
                            <div className="group">
                                {recentSearches.map((recent, index) => (
                                    <RecentSearchItem
                                        key={recent.timestamp}
                                        query={recent.query}
                                        onSelect={() => handleRecentSearchSelect(recent.query)}
                                        onRemove={() => removeRecentSearch(recent.query)}
                                        isSelected={index === selectedIndex}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {query.trim().length >= 2 && results.length === 0 && !isLoading && !isFetching && (
                        <div className="px-4 py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                <Search className="w-6 h-6 text-zinc-400" />
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                                No results found
                            </p>
                            <p className="text-sm text-zinc-500">
                                No matches for "{query}". Try a different search term.
                            </p>
                        </div>
                    )}

                    {/* Search Results */}
                    {results.length > 0 && (
                        <div className="py-2">
                            <div className="px-4 py-2">
                                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Results ({searchResponse?.totalCount || 0})
                                </span>
                            </div>
                            {results.map((result, index) => (
                                <SearchResultItem
                                    key={`${result.type}-${result.id}`}
                                    result={result}
                                    isSelected={index === selectedIndex}
                                    onClick={() => handleSelect(result)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty State (no query) */}
                    {!query.trim() && !showRecentSearches && (
                        <div className="px-4 py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                <Search className="w-6 h-6 text-zinc-400" />
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                                Search your workspace
                            </p>
                            <p className="text-sm text-zinc-500">
                                Find workspaces, boards, lists, and cards
                            </p>
                        </div>
                    )}

                    {/* Searching State */}
                    {query.trim().length >= 2 && isLoading && results.length === 0 && (
                        <div className="px-4 py-12 text-center">
                            <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-4" />
                            <p className="text-zinc-500 text-sm">Searching...</p>
                        </div>
                    )}

                    {/* Minimum characters hint */}
                    {query.trim().length > 0 && query.trim().length < 2 && (
                        <div className="px-4 py-8 text-center">
                            <p className="text-sm text-zinc-500">
                                Type at least 2 characters to search
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-6 px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-medium">
                            ↑↓
                        </kbd>
                        <span>navigate</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-medium">
                            ↵
                        </kbd>
                        <span>select</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-medium">
                            esc
                        </kbd>
                        <span>close</span>
                    </span>
                    <span className="flex-1" />
                    <span className="text-xs text-zinc-400">
                        Powered by Axon Search
                    </span>
                </div>
            </div>
        </div>
    );
}

export default GlobalSearch;
