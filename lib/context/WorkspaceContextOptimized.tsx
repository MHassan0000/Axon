"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspacesQuery, useCreateWorkspaceMutation, useDeleteWorkspaceMutation, useUpdateWorkspaceMutation } from "@/lib/hooks/useWorkspaces";
import { queryKeys } from "@/lib/hooks/queryKeys";
import type { Workspace, UpdateWorkspaceInput } from "@/lib/types/database";

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
    const queryClient = useQueryClient();
    
    // Use React Query for data fetching with caching
    const { 
        data: workspaces = [], 
        isLoading: loading, 
        error: queryError,
        refetch 
    } = useWorkspacesQuery();

    // Mutations
    const createMutation = useCreateWorkspaceMutation();
    const deleteMutation = useDeleteWorkspaceMutation();
    const updateMutation = useUpdateWorkspaceMutation();

    // Convert query error to string
    const error = queryError ? "Failed to load workspaces" : null;

    // Refresh workspaces (invalidate cache)
    const refreshWorkspaces = useCallback(async () => {
        await refetch();
    }, [refetch]);

    // Optimistic update: add workspace locally
    const addWorkspace = useCallback((workspace: Workspace) => {
        queryClient.setQueryData<Workspace[]>(
            queryKeys.workspaces.list(),
            (old) => (old ? [workspace, ...old] : [workspace])
        );
    }, [queryClient]);

    // Remove workspace locally
    const removeWorkspace = useCallback((workspaceId: string) => {
        queryClient.setQueryData<Workspace[]>(
            queryKeys.workspaces.list(),
            (old) => old?.filter((w) => w.id !== workspaceId) || []
        );
        // Also trigger the mutation
        deleteMutation.mutate(workspaceId);
    }, [queryClient, deleteMutation]);

    // Update workspace locally
    const updateWorkspaceLocal = useCallback((workspace: Workspace) => {
        queryClient.setQueryData<Workspace[]>(
            queryKeys.workspaces.list(),
            (old) => old?.map((w) => (w.id === workspace.id ? workspace : w)) || []
        );
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
                updateWorkspace: updateWorkspaceLocal,
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
