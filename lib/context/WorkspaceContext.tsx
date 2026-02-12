"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
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
    
    // The ref persists across renders without causing dependency changes
    const queryClientRef = useRef<ReturnType<typeof useQueryClient> | null>(null);
    try {
        queryClientRef.current = useQueryClient();
    } catch {
    }

    const refreshWorkspaces = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const ws = await getWorkspaces();
            setWorkspaces(ws);
            
            if (queryClientRef.current) {
                queryClientRef.current.setQueryData(queryKeys.workspaces.list(), ws);
            }
        } catch (err) {
            console.error("Error fetching workspaces:", err);
            setError("Failed to load workspaces");
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch on mount only
    useEffect(() => {
        refreshWorkspaces();
    }, [refreshWorkspaces]);

    const addWorkspace = useCallback((workspace: Workspace) => {
        setWorkspaces((prev) => [workspace, ...prev]);
        
        if (queryClientRef.current) {
            queryClientRef.current.setQueryData<Workspace[]>(
                queryKeys.workspaces.list(),
                (old) => (old ? [workspace, ...old] : [workspace])
            );
        }
    }, []);

    const removeWorkspace = useCallback((workspaceId: string) => {
        setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
        
        if (queryClientRef.current) {
            queryClientRef.current.setQueryData<Workspace[]>(
                queryKeys.workspaces.list(),
                (old) => old?.filter((w) => w.id !== workspaceId) || []
            );
        }
    }, []);

    const updateWorkspace = useCallback((workspace: Workspace) => {
        setWorkspaces((prev) =>
            prev.map((w) => (w.id === workspace.id ? workspace : w))
        );
        
        if (queryClientRef.current) {
            queryClientRef.current.setQueryData<Workspace[]>(
                queryKeys.workspaces.list(),
                (old) => old?.map((w) => (w.id === workspace.id ? workspace : w)) || []
            );
        }
    }, []);

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
