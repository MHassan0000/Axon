"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";

// =====================================================
// Search Types
// =====================================================

export type SearchResultType = "workspace" | "board" | "card" | "list";

export interface SearchResult {
    type: SearchResultType;
    id: string;
    name: string;
    description?: string | null;
    // Parent info for context
    workspaceId?: string;
    workspaceName?: string;
    boardId?: string;
    boardName?: string;
    listId?: string;
    listName?: string;
    // Additional metadata
    color?: string;
    dueDate?: string | null;
    isComplete?: boolean;
    updatedAt?: string;
}

export interface SearchResponse {
    results: SearchResult[];
    query: string;
    totalCount: number;
}

// =====================================================
// Global Search Function
// =====================================================

/**
 * Performs a comprehensive search across workspaces, boards, lists, and cards
 * Only returns items the user has access to
 */
export async function globalSearch(
    query: string,
    options?: {
        limit?: number;
        types?: SearchResultType[];
    }
): Promise<SearchResponse> {
    const user = await getCurrentUser();

    if (!user) {
        return { results: [], query, totalCount: 0 };
    }

    const searchQuery = query.trim().toLowerCase();

    if (!searchQuery || searchQuery.length < 2) {
        return { results: [], query, totalCount: 0 };
    }

    const supabase = await createClient();
    const limit = options?.limit || 20;
    const types = options?.types || ["workspace", "board", "card", "list"];

    // Get all workspace IDs the user has access to
    const { data: memberships } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id);

    if (!memberships?.length) {
        return { results: [], query, totalCount: 0 };
    }

    const workspaceIds = memberships.map((m) => m.workspace_id);
    const results: SearchResult[] = [];

    // Search in parallel for better performance
    const searchPromises: Promise<void>[] = [];

    // 1. Search Workspaces
    if (types.includes("workspace")) {
        searchPromises.push(
            (async () => {
                const { data: workspaces } = await supabase
                    .from("workspaces")
                    .select("id, name, description, updated_at")
                    .in("id", workspaceIds)
                    .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
                    .order("updated_at", { ascending: false })
                    .limit(limit);

                if (workspaces) {
                    for (const ws of workspaces) {
                        results.push({
                            type: "workspace",
                            id: ws.id,
                            name: ws.name,
                            description: ws.description,
                            updatedAt: ws.updated_at,
                        });
                    }
                }
            })()
        );
    }

    // 2. Search Boards
    if (types.includes("board")) {
        searchPromises.push(
            (async () => {
                const { data: boards } = await supabase
                    .from("boards")
                    .select("id, name, description, workspace_id, background_color, updated_at, workspaces(name)")
                    .in("workspace_id", workspaceIds)
                    .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
                    .order("updated_at", { ascending: false })
                    .limit(limit);

                if (boards) {
                    for (const board of boards) {
                        results.push({
                            type: "board",
                            id: board.id,
                            name: board.name,
                            description: board.description,
                            workspaceId: board.workspace_id,
                            workspaceName: (board.workspaces as any)?.name,
                            color: board.background_color,
                            updatedAt: board.updated_at,
                        });
                    }
                }
            })()
        );
    }

    // 3. Search Lists
    if (types.includes("list")) {
        searchPromises.push(
            (async () => {
                // First get board IDs in accessible workspaces
                const { data: accessibleBoards } = await supabase
                    .from("boards")
                    .select("id, name, workspace_id, workspaces(name)")
                    .in("workspace_id", workspaceIds);

                if (accessibleBoards?.length) {
                    const boardIds = accessibleBoards.map((b) => b.id);
                    const boardMap = new Map(accessibleBoards.map((b) => [b.id, b]));

                    const { data: lists } = await supabase
                        .from("lists")
                        .select("id, name, board_id, updated_at")
                        .in("board_id", boardIds)
                        .ilike("name", `%${searchQuery}%`)
                        .order("updated_at", { ascending: false })
                        .limit(limit);

                    if (lists) {
                        for (const list of lists) {
                            const board = boardMap.get(list.board_id);
                            results.push({
                                type: "list",
                                id: list.id,
                                name: list.name,
                                boardId: list.board_id,
                                boardName: board?.name,
                                workspaceId: board?.workspace_id,
                                workspaceName: (board?.workspaces as any)?.name,
                                updatedAt: list.updated_at,
                            });
                        }
                    }
                }
            })()
        );
    }

    // 4. Search Cards (most important for task management)
    if (types.includes("card")) {
        searchPromises.push(
            (async () => {
                // Get accessible boards with their workspace info
                const { data: accessibleBoards } = await supabase
                    .from("boards")
                    .select("id, name, workspace_id, workspaces(name)")
                    .in("workspace_id", workspaceIds);

                if (accessibleBoards?.length) {
                    const boardIds = accessibleBoards.map((b) => b.id);
                    const boardMap = new Map(accessibleBoards.map((b) => [b.id, b]));

                    // Get lists for these boards
                    const { data: lists } = await supabase
                        .from("lists")
                        .select("id, name, board_id")
                        .in("board_id", boardIds);

                    if (lists?.length) {
                        const listIds = lists.map((l) => l.id);
                        const listMap = new Map(lists.map((l) => [l.id, l]));

                        const { data: cards } = await supabase
                            .from("cards")
                            .select("id, title, description, list_id, due_date, is_complete, updated_at")
                            .in("list_id", listIds)
                            .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
                            .order("updated_at", { ascending: false })
                            .limit(limit);

                        if (cards) {
                            for (const card of cards) {
                                const list = listMap.get(card.list_id);
                                const board = list ? boardMap.get(list.board_id) : null;

                                results.push({
                                    type: "card",
                                    id: card.id,
                                    name: card.title,
                                    description: card.description,
                                    listId: card.list_id,
                                    listName: list?.name,
                                    boardId: list?.board_id,
                                    boardName: board?.name,
                                    workspaceId: board?.workspace_id,
                                    workspaceName: (board?.workspaces as any)?.name,
                                    dueDate: card.due_date,
                                    isComplete: card.is_complete,
                                    updatedAt: card.updated_at,
                                });
                            }
                        }
                    }
                }
            })()
        );
    }

    // Execute all searches in parallel
    await Promise.all(searchPromises);

    // Sort results by relevance (exact matches first, then by updated date)
    results.sort((a, b) => {
        const aExact = a.name.toLowerCase() === searchQuery;
        const bExact = b.name.toLowerCase() === searchQuery;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStarts = a.name.toLowerCase().startsWith(searchQuery);
        const bStarts = b.name.toLowerCase().startsWith(searchQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Prioritize by type: cards > boards > lists > workspaces
        const typeOrder = { card: 0, board: 1, list: 2, workspace: 3 };
        if (typeOrder[a.type] !== typeOrder[b.type]) {
            return typeOrder[a.type] - typeOrder[b.type];
        }

        // Sort by updated date
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });

    return {
        results: results.slice(0, limit),
        query,
        totalCount: results.length,
    };
}

// =====================================================
// Quick Search (for autocomplete - faster, less data)
// =====================================================

export async function quickSearch(query: string): Promise<SearchResult[]> {
    const response = await globalSearch(query, {
        limit: 8,
        types: ["board", "card"], // Most commonly searched
    });
    return response.results;
}

// =====================================================
// Search within a specific board
// =====================================================

export async function searchInBoard(
    boardId: string,
    query: string
): Promise<SearchResult[]> {
    const user = await getCurrentUser();

    if (!user || !query.trim()) {
        return [];
    }

    const supabase = await createClient();
    const searchQuery = query.trim().toLowerCase();

    // Verify user has access to this board
    const { data: board } = await supabase
        .from("boards")
        .select("id, workspace_id")
        .eq("id", boardId)
        .single();

    if (!board) return [];

    const { data: membership } = await supabase
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", board.workspace_id)
        .eq("user_id", user.id)
        .single();

    if (!membership) return [];

    // Get lists in this board
    const { data: lists } = await supabase
        .from("lists")
        .select("id, name")
        .eq("board_id", boardId);

    if (!lists?.length) return [];

    const listIds = lists.map((l) => l.id);
    const listMap = new Map(lists.map((l) => [l.id, l]));

    // Search cards in this board
    const { data: cards } = await supabase
        .from("cards")
        .select("id, title, description, list_id, due_date, is_complete")
        .in("list_id", listIds)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order("updated_at", { ascending: false })
        .limit(20);

    if (!cards) return [];

    return cards.map((card) => ({
        type: "card" as const,
        id: card.id,
        name: card.title,
        description: card.description,
        listId: card.list_id,
        listName: listMap.get(card.list_id)?.name,
        boardId,
        dueDate: card.due_date,
        isComplete: card.is_complete,
    }));
}

// =====================================================
// Search within a specific workspace
// =====================================================

export async function searchInWorkspace(
    workspaceId: string,
    query: string
): Promise<SearchResult[]> {
    const user = await getCurrentUser();

    if (!user || !query.trim()) {
        return [];
    }

    const supabase = await createClient();
    const searchQuery = query.trim().toLowerCase();

    // Verify user has access to this workspace
    const { data: membership } = await supabase
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .single();

    if (!membership) return [];

    const response = await globalSearch(query, { limit: 20 });

    // Filter to only results in this workspace
    return response.results.filter((r) => r.workspaceId === workspaceId);
}
