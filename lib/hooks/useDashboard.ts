"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import {
    getAllUserBoards,
    getAllTeamMembers,
    getCardsWithDueDates,
    getAnalyticsSummary,
    getDashboardStats,
    getRecentActivity,
    deleteAllActivity,
} from "@/lib/actions";

export function useAllUserBoardsQuery() {
    return useQuery({
        queryKey: queryKeys.boards.allUser(),
        queryFn: getAllUserBoards,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    });
}

export function useAllTeamMembersQuery() {
    return useQuery({
        queryKey: queryKeys.team.members(),
        queryFn: getAllTeamMembers,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: true,
    });
}

export function useCardsWithDueDatesQuery() {
    return useQuery({
        queryKey: queryKeys.cards.withDueDates(),
        queryFn: getCardsWithDueDates,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true,
    });
}

export function useAnalyticsSummaryQuery() {
    return useQuery({
        queryKey: queryKeys.dashboard.analytics(),
        queryFn: getAnalyticsSummary,
        staleTime: 5 * 60 * 1000,
    });
}

export function useDashboardStatsQuery() {
    return useQuery({
        queryKey: queryKeys.dashboard.stats(),
        queryFn: getDashboardStats,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    });
}

export function useRecentActivityQuery(limit: number = 50) {
    return useQuery({
        queryKey: [...queryKeys.activity.recent(), limit],
        queryFn: () => getRecentActivity(limit),
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    });
}

export function useInvalidateTeamMembers() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.team.members() });
    };
}

export function useInvalidateWorkspaceMembers() {
    const queryClient = useQueryClient();
    
    return (workspaceId: string) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId) });
    };
}

export function useInvalidateWorkspaces() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.team.members() });
    };
}

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

export function useRefetchDashboardData() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.refetchQueries({ queryKey: queryKeys.workspaces.all });
        queryClient.refetchQueries({ queryKey: queryKeys.team.members() });
        queryClient.refetchQueries({ queryKey: queryKeys.boards.all });
        queryClient.refetchQueries({ queryKey: queryKeys.dashboard.stats() });
    };
}

export function useInvalidateCalendar() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cards.withDueDates() });
    };
}

export function useInvalidateActivity() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all });
    };
}

export function useInvalidateAnalytics() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.analytics() });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    };
}

export function useInvalidateBoards() {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
    };
}

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

export function useDeleteAllActivityMutation() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteAllActivity,
        onSuccess: () => {
            // Invalidate activity cache to refresh the UI
            queryClient.invalidateQueries({ queryKey: queryKeys.activity.all });
        },
    });
}
