// =====================================================
// Optimized Hooks Index
// Re-export all optimized hooks for convenient imports
// =====================================================

export { queryKeys } from "./queryKeys";

export {
    useWorkspacesQuery,
    useWorkspaceDetailQuery,
    useWorkspaceMembersQuery,
    useCreateWorkspaceMutation,
    useUpdateWorkspaceMutation,
    useDeleteWorkspaceMutation,
} from "./useWorkspaces";

export {
    useBoardsQuery,
    useBoardDetailQuery,
    useCreateBoardMutation,
    useUpdateBoardMutation,
    useDeleteBoardMutation,
} from "./useBoards";
