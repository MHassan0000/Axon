"use client";

import { useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Card, List, Board, Comment } from "@/lib/types/database";

type TableName = "cards" | "lists" | "boards" | "comments" | "card_labels" | "card_assignees";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE";

interface UseRealtimeOptions<T> {
    table: TableName;
    filter?: {
        column: string;
        value: string;
    };
    onInsert?: (payload: T) => void;
    onUpdate?: (payload: T, old: Partial<T>) => void;
    onDelete?: (old: Partial<T>) => void;
    enabled?: boolean;
}

export function useRealtime<T extends { id: string }>({
    table,
    filter,
    onInsert,
    onUpdate,
    onDelete,
    enabled = true,
}: UseRealtimeOptions<T>) {
    const channelRef = useRef<RealtimeChannel | null>(null);
    const supabase = createClient();

    const handleChange = useCallback(
        (payload: RealtimePostgresChangesPayload<T>) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;

            switch (eventType) {
                case "INSERT":
                    if (onInsert && newRecord) {
                        onInsert(newRecord as T);
                    }
                    break;
                case "UPDATE":
                    if (onUpdate && newRecord) {
                        onUpdate(newRecord as T, oldRecord as Partial<T>);
                    }
                    break;
                case "DELETE":
                    if (onDelete && oldRecord) {
                        onDelete(oldRecord as Partial<T>);
                    }
                    break;
            }
        },
        [onInsert, onUpdate, onDelete]
    );

    useEffect(() => {
        if (!enabled) return;

        const channelName = filter 
            ? `${table}:${filter.column}=eq.${filter.value}`
            : `${table}:all`;

        const filterString = filter 
            ? `${filter.column}=eq.${filter.value}`
            : undefined;

        const channel = supabase
            .channel(channelName)
            .on<T>(
                "postgres_changes" as any,
                {
                    event: "*",
                    schema: "public",
                    table,
                    filter: filterString,
                },
                handleChange
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [supabase, table, filter?.column, filter?.value, enabled, handleChange]);

    return channelRef.current;
}

export function useRealtimeCards(
    listId: string,
    callbacks: {
        onInsert?: (card: Card) => void;
        onUpdate?: (card: Card) => void;
        onDelete?: (cardId: string) => void;
    }
) {
    return useRealtime<Card>({
        table: "cards",
        filter: { column: "list_id", value: listId },
        onInsert: callbacks.onInsert,
        onUpdate: callbacks.onUpdate,
        onDelete: (old) => callbacks.onDelete?.(old.id!),
        enabled: !!listId,
    });
}

export function useRealtimeLists(
    boardId: string,
    callbacks: {
        onInsert?: (list: List) => void;
        onUpdate?: (list: List) => void;
        onDelete?: (listId: string) => void;
    }
) {
    return useRealtime<List>({
        table: "lists",
        filter: { column: "board_id", value: boardId },
        onInsert: callbacks.onInsert,
        onUpdate: callbacks.onUpdate,
        onDelete: (old) => callbacks.onDelete?.(old.id!),
        enabled: !!boardId,
    });
}

export function useRealtimeBoard(
    boardId: string,
    callbacks: {
        onUpdate?: (board: Board) => void;
        onDelete?: () => void;
    }
) {
    return useRealtime<Board>({
        table: "boards",
        filter: { column: "id", value: boardId },
        onUpdate: callbacks.onUpdate,
        onDelete: callbacks.onDelete,
        enabled: !!boardId,
    });
}

export function useRealtimeComments(
    cardId: string,
    callbacks: {
        onInsert?: (comment: Comment) => void;
        onUpdate?: (comment: Comment) => void;
        onDelete?: (commentId: string) => void;
    }
) {
    return useRealtime<Comment>({
        table: "comments",
        filter: { column: "card_id", value: cardId },
        onInsert: callbacks.onInsert,
        onUpdate: callbacks.onUpdate,
        onDelete: (old) => callbacks.onDelete?.(old.id!),
        enabled: !!cardId,
    });
}

interface UseBoardRealtimeOptions {
    boardId: string;
    onCardInsert?: (card: Card) => void;
    onCardUpdate?: (card: Card) => void;
    onCardDelete?: (cardId: string, listId: string) => void;
    onListInsert?: (list: List) => void;
    onListUpdate?: (list: List) => void;
    onListDelete?: (listId: string) => void;
}

export function useBoardRealtime({
    boardId,
    onCardInsert,
    onCardUpdate,
    onCardDelete,
    onListInsert,
    onListUpdate,
    onListDelete,
}: UseBoardRealtimeOptions) {
    const supabase = createClient();
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!boardId) return;

        const channel = supabase
            .channel(`board:${boardId}`)
            // Listen to list changes
            .on<List>(
                "postgres_changes" as any,
                {
                    event: "*",
                    schema: "public",
                    table: "lists",
                    filter: `board_id=eq.${boardId}`,
                },
                (payload) => {
                    switch (payload.eventType) {
                        case "INSERT":
                            onListInsert?.(payload.new as List);
                            break;
                        case "UPDATE":
                            onListUpdate?.(payload.new as List);
                            break;
                        case "DELETE":
                            onListDelete?.((payload.old as Partial<List>).id!);
                            break;
                    }
                }
            )
            // Listen to all card changes (we filter by list afterward)
            .on<Card>(
                "postgres_changes" as any,
                {
                    event: "*",
                    schema: "public",
                    table: "cards",
                },
                (payload) => {
                    switch (payload.eventType) {
                        case "INSERT":
                            onCardInsert?.(payload.new as Card);
                            break;
                        case "UPDATE":
                            onCardUpdate?.(payload.new as Card);
                            break;
                        case "DELETE":
                            const old = payload.old as Partial<Card>;
                            onCardDelete?.(old.id!, old.list_id!);
                            break;
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [boardId, supabase, onCardInsert, onCardUpdate, onCardDelete, onListInsert, onListUpdate, onListDelete]);

    return channelRef.current;
}
