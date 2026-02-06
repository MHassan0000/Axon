"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { globalSearch, quickSearch, searchInBoard, searchInWorkspace } from "@/lib/actions/search";
import type { SearchResult, SearchResultType } from "@/lib/actions/search";

// =====================================================
// useDebounce Hook
// =====================================================

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

// =====================================================
// Query Keys
// =====================================================

export const searchQueryKeys = {
    all: ["search"] as const,
    global: (query: string) => [...searchQueryKeys.all, "global", query] as const,
    quick: (query: string) => [...searchQueryKeys.all, "quick", query] as const,
    board: (boardId: string, query: string) => [...searchQueryKeys.all, "board", boardId, query] as const,
    workspace: (workspaceId: string, query: string) => [...searchQueryKeys.all, "workspace", workspaceId, query] as const,
};

// =====================================================
// useGlobalSearch Hook
// =====================================================

interface UseGlobalSearchOptions {
    debounceMs?: number;
    limit?: number;
    types?: SearchResultType[];
    enabled?: boolean;
}

export function useGlobalSearch(
    query: string,
    options: UseGlobalSearchOptions = {}
) {
    const {
        debounceMs = 300,
        limit = 20,
        types,
        enabled = true,
    } = options;

    const debouncedQuery = useDebounce(query, debounceMs);
    const shouldSearch = enabled && debouncedQuery.trim().length >= 2;

    return useQuery({
        queryKey: searchQueryKeys.global(debouncedQuery),
        queryFn: () => globalSearch(debouncedQuery, { limit, types }),
        enabled: shouldSearch,
        staleTime: 30 * 1000, // Cache for 30 seconds
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
        placeholderData: (previousData) => previousData, // Keep showing previous results while loading
    });
}

// =====================================================
// useQuickSearch Hook (for autocomplete)
// =====================================================

export function useQuickSearch(query: string, enabled = true) {
    const debouncedQuery = useDebounce(query, 200); // Faster debounce for autocomplete
    const shouldSearch = enabled && debouncedQuery.trim().length >= 2;

    return useQuery({
        queryKey: searchQueryKeys.quick(debouncedQuery),
        queryFn: () => quickSearch(debouncedQuery),
        enabled: shouldSearch,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData,
    });
}

// =====================================================
// useBoardSearch Hook
// =====================================================

export function useBoardSearch(boardId: string, query: string, enabled = true) {
    const debouncedQuery = useDebounce(query, 300);
    const shouldSearch = enabled && !!boardId && debouncedQuery.trim().length >= 2;

    return useQuery({
        queryKey: searchQueryKeys.board(boardId, debouncedQuery),
        queryFn: () => searchInBoard(boardId, debouncedQuery),
        enabled: shouldSearch,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
    });
}

// =====================================================
// useWorkspaceSearch Hook
// =====================================================

export function useWorkspaceSearch(workspaceId: string, query: string, enabled = true) {
    const debouncedQuery = useDebounce(query, 300);
    const shouldSearch = enabled && !!workspaceId && debouncedQuery.trim().length >= 2;

    return useQuery({
        queryKey: searchQueryKeys.workspace(workspaceId, debouncedQuery),
        queryFn: () => searchInWorkspace(workspaceId, debouncedQuery),
        enabled: shouldSearch,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
    });
}

// =====================================================
// Recent Searches Hook (localStorage based)
// =====================================================

const RECENT_SEARCHES_KEY = "axon_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export interface RecentSearch {
    query: string;
    timestamp: number;
    result?: SearchResult;
}

export function useRecentSearches() {
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as RecentSearch[];
                // Filter out old searches (older than 7 days)
                const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                const recent = parsed.filter((s) => s.timestamp > sevenDaysAgo);
                setRecentSearches(recent);
            }
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    // Add a new search
    const addRecentSearch = useCallback((query: string, result?: SearchResult) => {
        setRecentSearches((prev) => {
            // Remove existing entry with same query
            const filtered = prev.filter((s) => s.query.toLowerCase() !== query.toLowerCase());
            
            // Add new search at the beginning
            const updated = [
                { query, timestamp: Date.now(), result },
                ...filtered,
            ].slice(0, MAX_RECENT_SEARCHES);

            // Save to localStorage
            try {
                localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            } catch {
                // Ignore localStorage errors
            }

            return updated;
        });
    }, []);

    // Clear all recent searches
    const clearRecentSearches = useCallback(() => {
        setRecentSearches([]);
        try {
            localStorage.removeItem(RECENT_SEARCHES_KEY);
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    // Remove a specific search
    const removeRecentSearch = useCallback((query: string) => {
        setRecentSearches((prev) => {
            const updated = prev.filter((s) => s.query.toLowerCase() !== query.toLowerCase());
            try {
                localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            } catch {
                // Ignore localStorage errors
            }
            return updated;
        });
    }, []);

    return {
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        removeRecentSearch,
    };
}
