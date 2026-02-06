"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import {
    getWorkspaces,
    getWorkspaceWithBoards,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    getWorkspaceMembers,
} from "@/lib/actions";
import type { Workspace, UpdateWorkspaceInput } from "@/lib/types/database";

// =====================================================
// Workspaces Hooks
// =====================================================

export function useWorkspacesQuery() {
    return useQuery({
        queryKey: queryKeys.workspaces.list(),
        queryFn: () => getWorkspaces(),
        staleTime: 60 * 1000, // Consider fresh for 1 minute
    });
}

export function useWorkspaceDetailQuery(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.workspaces.detail(workspaceId),
        queryFn: () => getWorkspaceWithBoards(workspaceId),
        enabled: !!workspaceId,
        staleTime: 30 * 1000,
    });
}

export function useWorkspaceMembersQuery(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.workspaces.members(workspaceId),
        queryFn: () => getWorkspaceMembers(workspaceId),
        enabled: !!workspaceId,
        staleTime: 2 * 60 * 1000, // Members don't change often
    });
}

export function useCreateWorkspaceMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string; description?: string }) => createWorkspace(data),
        onSuccess: (result) => {
            if (result.workspace) {
                // Optimistically update the cache
                queryClient.setQueryData<Workspace[]>(
                    queryKeys.workspaces.list(),
                    (old) => (old ? [result.workspace!, ...old] : [result.workspace!])
                );
            }
        },
        onSettled: () => {
            // Refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
        },
    });
}

export function useUpdateWorkspaceMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, data }: { workspaceId: string; data: UpdateWorkspaceInput }) =>
            updateWorkspace(workspaceId, data),
        onMutate: async ({ workspaceId, data }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.workspaces.list() });

            // Snapshot previous value
            const previousWorkspaces = queryClient.getQueryData<Workspace[]>(queryKeys.workspaces.list());

            // Optimistically update
            queryClient.setQueryData<Workspace[]>(
                queryKeys.workspaces.list(),
                (old) => old?.map((w) => (w.id === workspaceId ? { ...w, ...data } : w)) || []
            );

            return { previousWorkspaces };
        },
        onError: (_err, _vars, context) => {
            // Rollback on error
            if (context?.previousWorkspaces) {
                queryClient.setQueryData(queryKeys.workspaces.list(), context.previousWorkspaces);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
        },
    });
}

export function useDeleteWorkspaceMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (workspaceId: string) => deleteWorkspace(workspaceId),
        onMutate: async (workspaceId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.workspaces.list() });

            const previousWorkspaces = queryClient.getQueryData<Workspace[]>(queryKeys.workspaces.list());

            queryClient.setQueryData<Workspace[]>(
                queryKeys.workspaces.list(),
                (old) => old?.filter((w) => w.id !== workspaceId) || []
            );

            return { previousWorkspaces };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousWorkspaces) {
                queryClient.setQueryData(queryKeys.workspaces.list(), context.previousWorkspaces);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
        },
    });
}
