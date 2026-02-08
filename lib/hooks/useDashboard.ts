"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import {
    getAllUserBoards,
    getAllTeamMembers,
    getCardsWithDueDates,
    getAnalyticsSummary,
    getDashboardStats,
    getRecentActivity,
} from "@/lib/actions";

// =====================================================
// Dashboard Optimized Hooks
// These hooks use the optimized bulk-fetching actions
// with appropriate caching strategies
// =====================================================

/**
 * Fetch all boards across all workspaces for the current user
 * Cached for 30 seconds
 */
export function useAllUserBoardsQuery() {
    return useQuery({
        queryKey: queryKeys.boards.allUser(),
        queryFn: getAllUserBoards,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    });
}

/**
 * Fetch all team members across all workspaces
 * Cached for 2 minutes (members don't change often)
 * Refetches on window focus to pick up membership changes
 */
export function useAllTeamMembersQuery() {
    return useQuery({
        queryKey: queryKeys.team.members(),
        queryFn: getAllTeamMembers,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: true,
    });
}

/**
 * Fetch cards with due dates for calendar view
 * Cached for 1 minute
 */
export function useCardsWithDueDatesQuery() {
    return useQuery({
        queryKey: queryKeys.cards.withDueDates(),
        queryFn: getCardsWithDueDates,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true,
    });
}

/**
 * Fetch analytics summary
 * Cached for 5 minutes (analytics don't need real-time)
 */
export function useAnalyticsSummaryQuery() {
    return useQuery({
        queryKey: queryKeys.dashboard.analytics(),
        queryFn: getAnalyticsSummary,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch dashboard stats
 * Cached for 30 seconds
 */
export function useDashboardStatsQuery() {
    return useQuery({
        queryKey: queryKeys.dashboard.stats(),
        queryFn: getDashboardStats,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    });
}

/**
 * Fetch recent activity
 * Cached for 30 seconds
 */
export function useRecentActivityQuery(limit: number = 50) {
    return useQuery({
        queryKey: [...queryKeys.activity.recent(), limit],
        queryFn: () => getRecentActivity(limit),
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook to invalidate team members cache
 * Use this after member changes (add/remove/invite accept)
 */
export function useInvalidateTeamMembers() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.team.members() });
    };
}

/**
 * Hook to invalidate workspace members cache for a specific workspace
 */
export function useInvalidateWorkspaceMembers() {
    const queryClient = useQueryClient();
    
    return (workspaceId: string) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId) });
    };
}

/**
 * Hook to invalidate all workspace-related caches
 */
export function useInvalidateWorkspaces() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.team.members() });
    };
}

/**
 * Comprehensive hook to invalidate all caches when workspace membership changes
 * Use this when:
 * - User leaves a workspace
 * - User joins a workspace (accepts invite)
 * - Member is added/removed from workspace
 */
export function useInvalidateOnMembershipChange() {
    const queryClient = useQueryClient();
    
    return () => {
        // Invalidate workspace list (for sidebar)
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
        
        // Invalidate team members (for team page)
        queryClient.invalidateQueries({ queryKey: queryKeys.team.members() });
        
        // Invalidate all boards (user's boards might have changed)
        queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
        
        // Invalidate dashboard stats (counts might have changed)
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
        
        // Invalidate analytics (workspace analytics might have changed)
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.analytics() });
    };
}

/**
 * Hook to refetch all dashboard data
 * Useful when returning to dashboard after actions in other pages
 */
export function useRefetchDashboardData() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.refetchQueries({ queryKey: queryKeys.workspaces.all });
        queryClient.refetchQueries({ queryKey: queryKeys.team.members() });
        queryClient.refetchQueries({ queryKey: queryKeys.boards.all });
        queryClient.refetchQueries({ queryKey: queryKeys.dashboard.stats() });
    };
}

/**
 * Hook to invalidate calendar cache when due dates change
 * Use this after updating a card's due date
 */
export function useInvalidateCalendar() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cards.withDueDates() });
    };
}

/**
 * Hook to invalidate activity cache
 * Use this after operations that create activity logs (comments, labels, assignees, etc.)
 */
export function useInvalidateActivity() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all });
    };
}

/**
 * Hook to invalidate analytics and dashboard stats caches
 * Use this after operations that affect analytics (card create/delete/complete, board changes)
 */
export function useInvalidateAnalytics() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.analytics() });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    };
}

/**
 * Hook to invalidate all board-related caches
 * Use this after board create/update/delete operations
 */
export function useInvalidateBoards() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
    };
}

/**
 * Comprehensive hook to invalidate caches when card data changes
 * Use this after card operations (create, delete, complete, etc.)
 */
export function useInvalidateOnCardChange() {
    const queryClient = useQueryClient();
    
    return (options?: { 
        activity?: boolean; 
        analytics?: boolean; 
        calendar?: boolean;
    }) => {
        const { activity = true, analytics = true, calendar = false } = options || {};
        
        if (activity) {
            queryClient.invalidateQueries({ queryKey: queryKeys.activity.all });
        }
        if (analytics) {
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.analytics() });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
        }
        if (calendar) {
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.withDueDates() });
        }
    };
}
