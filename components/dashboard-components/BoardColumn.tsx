"use client";

import React, { memo, useMemo, useCallback } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import BoardCard, { CardData } from "./BoardCard";

/*
  Kanban Column - Optimized with React.memo
  - Column title + task count
  - Options menu (3 dots)
  - Scrollable card container
  - Add card button
  - Drag affordance styling
*/

export interface ColumnData {
    id: string;
    title: string;
    cards: CardData[];
    color?: string;
}

interface BoardColumnProps {
    column: ColumnData;
    onAddCard?: (columnId: string) => void;
    onOptionsClick?: (columnId: string) => void;
}

// Memoized Column Header
const ColumnHeader = memo(function ColumnHeader({
    title,
    cardCount,
    color,
    onOptionsClick,
}: {
    title: string;
    cardCount: number;
    color: string;
    onOptionsClick?: () => void;
}) {
    return (
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800">
            <div className="flex items-center gap-2">
                {/* Color indicator */}
                <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                />

                {/* Title and count */}
                <h3 className="text-sm font-medium text-zinc-200">{title}</h3>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                    {cardCount}
                </span>
            </div>

            {/* Options */}
            <button
                onClick={onOptionsClick}
                className="p-1 rounded hover:bg-zinc-800 transition-colors"
            >
                <MoreHorizontal className="w-4 h-4 text-zinc-500" />
            </button>
        </div>
    );
});

// Memoized Cards List
const CardsList = memo(function CardsList({ cards }: { cards: CardData[] }) {
    return (
        <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[calc(100vh-220px)]">
            {cards.map((card) => (
                <BoardCard key={card.id} card={card} />
            ))}
        </div>
    );
});

// Memoized Add Card Button
const AddCardButton = memo(function AddCardButton({
    onClick,
}: {
    onClick?: () => void;
}) {
    return (
        <div className="p-2 border-t border-zinc-800">
            <button
                onClick={onClick}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
            >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add a card</span>
            </button>
        </div>
    );
});

// Main BoardColumn Component
const BoardColumn = memo(function BoardColumn({
    column,
    onAddCard,
    onOptionsClick,
}: BoardColumnProps) {
    const { id, title, cards, color = "#6366f1" } = column;

    // Memoize card count
    const cardCount = useMemo(() => cards.length, [cards.length]);

    // Memoize callbacks
    const handleAddCard = useCallback(() => {
        onAddCard?.(id);
    }, [onAddCard, id]);

    const handleOptionsClick = useCallback(() => {
        onOptionsClick?.(id);
    }, [onOptionsClick, id]);

    return (
        <div className="flex flex-col w-72 min-w-72 bg-zinc-900 rounded-lg shrink-0">
            <ColumnHeader
                title={title}
                cardCount={cardCount}
                color={color}
                onOptionsClick={handleOptionsClick}
            />
            <CardsList cards={cards} />
            <AddCardButton onClick={handleAddCard} />
        </div>
    );
});

export default BoardColumn;
