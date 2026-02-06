"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "../actions/users";

// =====================================================
// Cached Data Fetching Functions
// These use Next.js unstable_cache for server-side caching
// =====================================================

/**
 * Get cached board data with lists
 * Cache is invalidated based on boardId and has a 30s TTL
 */
export const getCachedBoardWithLists = unstable_cache(
    async (boardId: string, userId: string) => {
        const supabase = await createClient();

        // Get board
        const { data: board, error: boardError } = await supabase
            .from("boards")
            .select("*")
            .eq("id", boardId)
            .single();

        if (boardError || !board) {
            return null;
        }

        // Check membership
        const { data: membership } = await supabase
            .from("workspace_members")
            .select("*")
            .eq("workspace_id", board.workspace_id)
            .eq("user_id", userId)
            .single();

        if (!membership) {
            return null;
        }

        // Get lists with cards - use Promise.all for parallel fetching
        const [listsResult, labelsResult] = await Promise.all([
            supabase
                .from("lists")
                .select("*")
                .eq("board_id", boardId)
                .order("position", { ascending: true }),
            supabase
                .from("labels")
                .select("*")
                .eq("board_id", boardId),
        ]);

        const lists = listsResult.data || [];
        const labels = labelsResult.data || [];

        // Get all cards for these lists
        const listIds = lists.map((l) => l.id);
        
        if (listIds.length === 0) {
            return {
                ...board,
                lists: [],
                labels,
            };
        }

        const { data: cards } = await supabase
            .from("cards")
            .select("*")
            .in("list_id", listIds)
            .order("position", { ascending: true });

        // Get card relations in parallel
        const cardIds = cards?.map((c) => c.id) || [];
        
        if (cardIds.length === 0) {
            return {
                ...board,
                lists: lists.map((list) => ({ ...list, cards: [] })),
                labels,
            };
        }

        const [cardLabelsResult, cardAssigneesResult] = await Promise.all([
            supabase
                .from("card_labels")
                .select("*")
                .in("card_id", cardIds),
            supabase
                .from("card_assignees")
                .select("*, users(*)")
                .in("card_id", cardIds),
        ]);

        const cardLabels = cardLabelsResult.data || [];
        const cardAssignees = cardAssigneesResult.data || [];

        // Organize cards by list with their relations
        const listsWithCards = lists.map((list) => ({
            ...list,
            cards: (cards || [])
                .filter((card) => card.list_id === list.id)
                .map((card) => ({
                    ...card,
                    labels: cardLabels
                        .filter((cl) => cl.card_id === card.id)
                        .map((cl) => labels.find((l) => l.id === cl.label_id))
                        .filter(Boolean),
                    assignees: cardAssignees
                        .filter((ca) => ca.card_id === card.id)
                        .map((ca) => ca.users)
                        .filter(Boolean),
                })),
        }));

        return {
            ...board,
            lists: listsWithCards,
            labels,
        };
    },
    ["board-with-lists"],
    {
        revalidate: 30, // Cache for 30 seconds
        tags: ["board"],
    }
);

/**
 * Get cached workspaces for user
 */
export const getCachedWorkspaces = unstable_cache(
    async (userId: string) => {
        const supabase = await createClient();

        // Get workspaces where user is a member
        const { data: memberships } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", userId);

        if (!memberships?.length) {
            return [];
        }

        const workspaceIds = memberships.map((m) => m.workspace_id);

        const { data: workspaces } = await supabase
            .from("workspaces")
            .select("*")
            .in("id", workspaceIds)
            .order("created_at", { ascending: false });

        return workspaces || [];
    },
    ["user-workspaces"],
    {
        revalidate: 60, // Cache for 1 minute
        tags: ["workspaces"],
    }
);

/**
 * Get cached boards for workspace
 */
export const getCachedBoards = unstable_cache(
    async (workspaceId: string, userId: string) => {
        const supabase = await createClient();

        // Check membership
        const { data: membership } = await supabase
            .from("workspace_members")
            .select("*")
            .eq("workspace_id", workspaceId)
            .eq("user_id", userId)
            .single();

        if (!membership) {
            return [];
        }

        const { data: boards } = await supabase
            .from("boards")
            .select("*")
            .eq("workspace_id", workspaceId)
            .order("position", { ascending: true });

        return boards || [];
    },
    ["workspace-boards"],
    {
        revalidate: 30,
        tags: ["boards"],
    }
);

/**
 * Get cached workspace members
 */
export const getCachedWorkspaceMembers = unstable_cache(
    async (workspaceId: string, userId: string) => {
        const supabase = await createClient();

        // Verify user is a member
        const { data: membership } = await supabase
            .from("workspace_members")
            .select("role")
            .eq("workspace_id", workspaceId)
            .eq("user_id", userId)
            .single();

        if (!membership) {
            return [];
        }

        const { data: members } = await supabase
            .from("workspace_members")
            .select("role, users(*)")
            .eq("workspace_id", workspaceId);

        return (members || []).map((m: any) => ({
            id: m.users.id,
            name: m.users.name,
            email: m.users.email,
            avatar_url: m.users.avatar_url,
            role: m.role,
        }));
    },
    ["workspace-members"],
    {
        revalidate: 120, // Cache for 2 minutes - members don't change often
        tags: ["members"],
    }
);
