"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";
import type { Board, Workspace, CardWithRelations, ActivityLog } from "@/lib/types/database";

export interface DashboardStats {
    totalWorkspaces: number;
    totalBoards: number;
    totalCards: number;
    completedCards: number;
    overdueCards: number;
    teamMembersCount: number;
}

export interface BoardWithWorkspace extends Board {
    workspace_name: string;
}

export interface TeamMember {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    workspace_id: string;
    workspace_name: string;
    role: string;
    joined_at: string;
}

export interface CalendarCard {
    id: string;
    title: string;
    due_date: string;
    is_complete: boolean;
    board_id: string;
    board_name: string;
    board_color: string | null;
    list_name: string;
}

export interface AnalyticsSummary {
    stats: DashboardStats;
    boardsCreatedByMonth: { month: string; count: number }[];
    activityByDay: { date: string; count: number }[];
    cardStatusDistribution: { name: string; value: number; color: string }[];
    recentBoards: Board[];
}

export async function getAllUserBoards(): Promise<BoardWithWorkspace[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createClient();

    // Single query with JOIN to get all boards the user has access to
    const { data, error } = await supabase
        .from("workspace_members")
        .select(`
            workspace_id,
            workspaces!inner (
                id,
                name,
                boards (
                    id,
                    name,
                    description,
                    background_color,
                    background_image,
                    workspace_id,
                    created_at,
                    updated_at
                )
            )
        `)
        .eq("user_id", user.id);

    if (error || !data) {
        console.error("Error fetching user boards:", error);
        return [];
    }

    // Flatten the nested structure
    const boards: BoardWithWorkspace[] = [];
    for (const membership of data) {
        const workspace = membership.workspaces as unknown as { id: string; name: string; boards: Board[] };
        if (workspace?.boards) {
            for (const board of workspace.boards) {
                boards.push({
                    ...board,
                    workspace_name: workspace.name,
                });
            }
        }
    }

    return boards;
}

export async function getAllTeamMembers(): Promise<TeamMember[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createClient();

    // First get all workspace IDs the user belongs to
    const { data: memberships, error: membershipError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id);

    if (membershipError || !memberships?.length) {
        return [];
    }

    const workspaceIds = memberships.map((m) => m.workspace_id);

    const { data, error } = await supabase
        .from("workspace_members")
        .select(`
            workspace_id,
            role,
            joined_at,
            users!inner (
                id,
                email,
                name,
                avatar_url
            ),
            workspaces!inner (
                name
            )
        `)
        .in("workspace_id", workspaceIds);

    if (error || !data) {
        console.error("Error fetching team members:", error);
        return [];
    }

    // Flatten and dedupe by user ID (user may be in multiple workspaces)
    const members: TeamMember[] = data.map((m) => {
        const userData = m.users as unknown as { id: string; email: string; name: string | null; avatar_url: string | null };
        const workspaceData = m.workspaces as unknown as { name: string };
        return {
            id: userData.id,
            email: userData.email,
            full_name: userData.name, // Map 'name' column to 'full_name' property
            avatar_url: userData.avatar_url,
            workspace_id: m.workspace_id,
            workspace_name: workspaceData.name,
            role: m.role,
            joined_at: m.joined_at,
        };
    });

    return members;
}

export async function getCardsWithDueDates(): Promise<CalendarCard[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createClient();

    const { data: memberships } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id);

    if (!memberships?.length) return [];

    const workspaceIds = memberships.map((m) => m.workspace_id);

    const { data, error } = await supabase
        .from("cards")
        .select(`
            id,
            title,
            due_date,
            is_complete,
            lists!inner (
                name,
                boards!inner (
                    id,
                    name,
                    background_color,
                    workspace_id
                )
            )
        `)
        .not("due_date", "is", null)
        .in("lists.boards.workspace_id", workspaceIds)
        .order("due_date", { ascending: true });

    if (error || !data) {
        console.error("Error fetching calendar cards:", error);
        return [];
    }

    return data.map((card) => {
        const list = card.lists as unknown as { name: string; boards: { id: string; name: string; background_color: string | null } };
        return {
            id: card.id,
            title: card.title,
            due_date: card.due_date!,
            is_complete: card.is_complete,
            board_id: list.boards.id,
            board_name: list.boards.name,
            board_color: list.boards.background_color,
            list_name: list.name,
        };
    });
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createClient();

    const { data: memberships } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id);

    if (!memberships?.length) {
        return {
            stats: {
                totalWorkspaces: 0,
                totalBoards: 0,
                totalCards: 0,
                completedCards: 0,
                overdueCards: 0,
                teamMembersCount: 0,
            },
            boardsCreatedByMonth: [],
            activityByDay: [],
            cardStatusDistribution: [],
            recentBoards: [],
        };
    }

    const workspaceIds = memberships.map((m) => m.workspace_id);
    const now = new Date();

    // Parallel fetch all data we need
    const [
        boardsResult,
        cardsResult,
        membersResult,
        activityResult,
    ] = await Promise.all([
        supabase
            .from("boards")
            .select("id, name, background_color, background_image, workspace_id, created_at, updated_at")
            .in("workspace_id", workspaceIds)
            .order("created_at", { ascending: false }),
        
        supabase
            .from("cards")
            .select(`
                id,
                is_complete,
                due_date,
                lists!inner (
                    boards!inner (
                        workspace_id
                    )
                )
            `)
            .in("lists.boards.workspace_id", workspaceIds),
        
        supabase
            .from("workspace_members")
            .select("user_id")
            .in("workspace_id", workspaceIds),
        
        supabase
            .from("activity_logs")
            .select("created_at")
            .in("workspace_id", workspaceIds)
            .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const boards = boardsResult.data || [];
    const cards = cardsResult.data || [];
    const members = membersResult.data || [];
    const activities = activityResult.data || [];

    // Calculate stats
    const completedCards = cards.filter((c) => c.is_complete).length;
    const overdueCards = cards.filter(
        (c) => c.due_date && new Date(c.due_date) < now && !c.is_complete
    ).length;
    const uniqueMembers = new Set(members.map((m) => m.user_id));

    // Activity by day (last 7 days)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const activityByDay: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const count = activities.filter((a) =>
            a.created_at.split("T")[0] === dateStr
        ).length;
        activityByDay.push({
            date: dayNames[date.getDay()],
            count,
        });
    }

    // Boards created by month (last 6 months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const boardsCreatedByMonth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = months[date.getMonth()];
        const count = boards.filter((b) => {
            const boardDate = new Date(b.created_at);
            return boardDate.getMonth() === date.getMonth() &&
                boardDate.getFullYear() === date.getFullYear();
        }).length;
        boardsCreatedByMonth.push({ month: monthStr, count });
    }

    // Card status distribution
    const pendingCards = cards.length - completedCards;
    const cardStatusDistribution = [
        { name: "Completed", value: completedCards, color: "#10b981" },
        { name: "In Progress", value: pendingCards - overdueCards, color: "#6366f1" },
        { name: "Overdue", value: overdueCards, color: "#ef4444" },
    ].filter((item) => item.value > 0);

    return {
        stats: {
            totalWorkspaces: workspaceIds.length,
            totalBoards: boards.length,
            totalCards: cards.length,
            completedCards,
            overdueCards,
            teamMembersCount: uniqueMembers.size,
        },
        boardsCreatedByMonth,
        activityByDay,
        cardStatusDistribution,
        recentBoards: boards.slice(0, 5) as Board[],
    };
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createClient();

    const { data: memberships } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id);

    if (!memberships?.length) {
        return {
            totalWorkspaces: 0,
            totalBoards: 0,
            totalCards: 0,
            completedCards: 0,
            overdueCards: 0,
            teamMembersCount: 0,
        };
    }

    const workspaceIds = memberships.map((m) => m.workspace_id);
    const now = new Date();

    // Parallel count queries
    const [boardsCount, cardsData, membersCount] = await Promise.all([
        supabase
            .from("boards")
            .select("id", { count: "exact", head: true })
            .in("workspace_id", workspaceIds),
        
        supabase
            .from("cards")
            .select(`
                is_complete,
                due_date,
                lists!inner (
                    boards!inner (
                        workspace_id
                    )
                )
            `)
            .in("lists.boards.workspace_id", workspaceIds),
        
        supabase
            .from("workspace_members")
            .select("user_id")
            .in("workspace_id", workspaceIds),
    ]);

    const cards = cardsData.data || [];
    const completedCards = cards.filter((c) => c.is_complete).length;
    const overdueCards = cards.filter(
        (c) => c.due_date && new Date(c.due_date) < now && !c.is_complete
    ).length;
    const uniqueMembers = new Set((membersCount.data || []).map((m) => m.user_id));

    return {
        totalWorkspaces: workspaceIds.length,
        totalBoards: boardsCount.count || 0,
        totalCards: cards.length,
        completedCards,
        overdueCards,
        teamMembersCount: uniqueMembers.size,
    };
}
