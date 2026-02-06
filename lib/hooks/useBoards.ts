"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import {
    getBoards,
    getBoardWithLists,
    createBoard,
    updateBoard,
    deleteBoard,
} from "@/lib/actions";
import type { Board, BoardWithLists, CreateBoardInput, UpdateBoardInput } from "@/lib/types/database";

// =====================================================
// Boards Hooks
// =====================================================

export function useBoardsQuery(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.boards.byWorkspace(workspaceId),
        queryFn: () => getBoards(workspaceId),
        enabled: !!workspaceId,
        staleTime: 30 * 1000,
    });
}

export function useBoardDetailQuery(boardId: string) {
    return useQuery({
        queryKey: queryKeys.boards.withLists(boardId),
        queryFn: () => getBoardWithLists(boardId),
        enabled: !!boardId,
        staleTime: 10 * 1000, // Board data changes more frequently
    });
}

export function useCreateBoardMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBoardInput) => createBoard(data),
        onSuccess: (result, variables) => {
            if (result.board) {
                // Optimistically update the boards list for this workspace
                queryClient.setQueryData<Board[]>(
                    queryKeys.boards.byWorkspace(variables.workspace_id),
                    (old) => (old ? [...old, result.board!] : [result.board!])
                );
            }
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.boards.byWorkspace(variables.workspace_id) 
            });
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.workspaces.detail(variables.workspace_id) 
            });
        },
    });
}

export function useUpdateBoardMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, data }: { boardId: string; data: UpdateBoardInput }) =>
            updateBoard(boardId, data),
        onMutate: async ({ boardId, data }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.boards.withLists(boardId) });

            const previousBoard = queryClient.getQueryData<BoardWithLists>(
                queryKeys.boards.withLists(boardId)
            );

            if (previousBoard) {
                queryClient.setQueryData<BoardWithLists>(
                    queryKeys.boards.withLists(boardId),
                    { ...previousBoard, ...data }
                );
            }

            return { previousBoard };
        },
        onError: (_err, { boardId }, context) => {
            if (context?.previousBoard) {
                queryClient.setQueryData(
                    queryKeys.boards.withLists(boardId),
                    context.previousBoard
                );
            }
        },
        onSettled: (_data, _error, { boardId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.boards.withLists(boardId) });
        },
    });
}

export function useDeleteBoardMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (boardId: string) => deleteBoard(boardId),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
        },
    });
}
