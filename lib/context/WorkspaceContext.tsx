"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getWorkspaces } from "@/lib/actions";
import { queryKeys } from "@/lib/hooks/queryKeys";
import type { Workspace } from "@/lib/types/database";

interface WorkspaceContextType {
    workspaces: Workspace[];
    loading: boolean;
    error: string | null;
    refreshWorkspaces: () => Promise<void>;
    addWorkspace: (workspace: Workspace) => void;
    removeWorkspace: (workspaceId: string) => void;
    updateWorkspace: (workspace: Workspace) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Get query client for cache invalidation
    let queryClient: ReturnType<typeof useQueryClient> | null = null;
    try {
        queryClient = useQueryClient();
    } catch {
        // Query client not available (outside QueryProvider)
    }

    // Fetch workspaces from server
    const refreshWorkspaces = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const ws = await getWorkspaces();
            setWorkspaces(ws);
            
            // Also update React Query cache if available
            if (queryClient) {
                queryClient.setQueryData(queryKeys.workspaces.list(), ws);
            }
        } catch (err) {
            console.error("Error fetching workspaces:", err);
            setError("Failed to load workspaces");
        } finally {
            setLoading(false);
        }
    }, [queryClient]);

    // Initial fetch on mount
    useEffect(() => {
        refreshWorkspaces();
    }, [refreshWorkspaces]);

    // Optimistic update: add workspace locally
    const addWorkspace = useCallback((workspace: Workspace) => {
        setWorkspaces((prev) => [workspace, ...prev]);
        
        // Also update React Query cache
        if (queryClient) {
            queryClient.setQueryData<Workspace[]>(
                queryKeys.workspaces.list(),
                (old) => (old ? [workspace, ...old] : [workspace])
            );
        }
    }, [queryClient]);

    // Remove workspace locally
    const removeWorkspace = useCallback((workspaceId: string) => {
        setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
        
        // Also update React Query cache
        if (queryClient) {
            queryClient.setQueryData<Workspace[]>(
                queryKeys.workspaces.list(),
                (old) => old?.filter((w) => w.id !== workspaceId) || []
            );
        }
    }, [queryClient]);

    // Update workspace locally
    const updateWorkspace = useCallback((workspace: Workspace) => {
        setWorkspaces((prev) =>
            prev.map((w) => (w.id === workspace.id ? workspace : w))
        );
        
        // Also update React Query cache
        if (queryClient) {
            queryClient.setQueryData<Workspace[]>(
                queryKeys.workspaces.list(),
                (old) => old?.map((w) => (w.id === workspace.id ? workspace : w)) || []
            );
        }
    }, [queryClient]);

    return (
        <WorkspaceContext.Provider
            value={{
                workspaces,
                loading,
                error,
                refreshWorkspaces,
                addWorkspace,
                removeWorkspace,
                updateWorkspace,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspaces() {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error("useWorkspaces must be used within a WorkspaceProvider");
    }
    return context;
}
