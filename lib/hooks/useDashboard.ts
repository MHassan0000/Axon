"use client";

import { useQuery } from "@tanstack/react-query";
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
    });
}

/**
 * Fetch all team members across all workspaces
 * Cached for 2 minutes (members don't change often)
 */
export function useAllTeamMembersQuery() {
    return useQuery({
        queryKey: queryKeys.team.members(),
        queryFn: getAllTeamMembers,
        staleTime: 2 * 60 * 1000,
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
    });
}
