"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    MoreHorizontal,
    Loader2,
    X,
    Trash2,
    Edit3,
    GripVertical,
    Calendar,
    MessageSquare,
    Paperclip,
    CheckCircle2
} from "lucide-react";
import {
    getBoardWithLists,
    createList,
    createCard,
    updateCard,
    deleteCard,
    deleteList,
    moveCard,
    reorderCards
} from "@/lib/actions";
import type { BoardWithLists, ListWithCards, CardWithRelations, Label } from "@/lib/types/database";

export default function BoardPage() {
    const params = useParams();
    const router = useRouter();
    const boardId = params.id as string;

    const [board, setBoard] = useState<BoardWithLists | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingList, setAddingList] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [addingCardToList, setAddingCardToList] = useState<string | null>(null);
    const [newCardTitle, setNewCardTitle] = useState("");
    const [selectedCard, setSelectedCard] = useState<CardWithRelations | null>(null);

    useEffect(() => {
        async function fetchBoard() {
            try {
                const b = await getBoardWithLists(boardId);
                setBoard(b);
            } catch (error) {
                console.error("Error fetching board:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchBoard();
    }, [boardId]);

    const handleAddList = async () => {
        if (!newListName.trim() || !board) return;

        setAddingList(true);
        try {
            const list = await createList({ board_id: boardId, name: newListName });
            if (list) {
                setBoard({
                    ...board,
                    lists: [...board.lists, { ...list, cards: [] }]
                });
                setNewListName("");
            }
        } catch (error) {
            console.error("Error creating list:", error);
        } finally {
            setAddingList(false);
        }
    };

    const handleAddCard = async (listId: string) => {
        if (!newCardTitle.trim() || !board) return;

        try {
            const card = await createCard({ list_id: listId, title: newCardTitle });
            if (card) {
                setBoard({
                    ...board,
                    lists: board.lists.map(list =>
                        list.id === listId
                            ? { ...list, cards: [...list.cards, card as CardWithRelations] }
                            : list
                    )
                });
                setNewCardTitle("");
                setAddingCardToList(null);
            }
        } catch (error) {
            console.error("Error creating card:", error);
        }
    };

    const handleDeleteCard = async (cardId: string, listId: string) => {
        if (!board) return;

        try {
            await deleteCard(cardId);
            setBoard({
                ...board,
                lists: board.lists.map(list =>
                    list.id === listId
                        ? { ...list, cards: list.cards.filter(c => c.id !== cardId) }
                        : list
                )
            });
            setSelectedCard(null);
        } catch (error) {
            console.error("Error deleting card:", error);
        }
    };

    const handleDeleteList = async (listId: string) => {
        if (!board) return;

        try {
            await deleteList(listId);
            setBoard({
                ...board,
                lists: board.lists.filter(l => l.id !== listId)
            });
        } catch (error) {
            console.error("Error deleting list:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-200">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                </div>
            </div>
        );
    }

    if (!board) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-200">
                <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                        Board not found
                    </h2>
                    <Link
                        href="/dashboard"
                        className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col h-full transition-colors duration-200"
            style={{ backgroundColor: board.background_color || "#0a0a0a" }}
        >
            {/* Board Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/80" />
                    </button>
                    <h1 className="text-lg font-semibold text-white">
                        {board.name}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium transition-colors">
                        Share
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-white/80" />
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
                <div className="flex gap-4 h-full">
                    {/* Lists */}
                    {board.lists.map((list) => (
                        <ListColumn
                            key={list.id}
                            list={list}
                            onAddCard={() => setAddingCardToList(list.id)}
                            addingCard={addingCardToList === list.id}
                            newCardTitle={newCardTitle}
                            setNewCardTitle={setNewCardTitle}
                            onSubmitCard={() => handleAddCard(list.id)}
                            onCancelAdd={() => { setAddingCardToList(null); setNewCardTitle(""); }}
                            onCardClick={setSelectedCard}
                            onDeleteList={() => handleDeleteList(list.id)}
                        />
                    ))}

                    {/* Add List */}
                    <div className="shrink-0 w-72">
                        {addingList ? (
                            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
                                <input
                                    type="text"
                                    placeholder="Enter list name..."
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddList()}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 mb-2"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddList}
                                        className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                                    >
                                        Add List
                                    </button>
                                    <button
                                        onClick={() => { setAddingList(false); setNewListName(""); }}
                                        className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-zinc-500" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAddingList(true)}
                                className="w-full flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 text-sm font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add another list
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Card Detail Modal */}
            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    labels={board.labels || []}
                    onClose={() => setSelectedCard(null)}
                    onDelete={() => {
                        const list = board.lists.find(l => l.cards.some(c => c.id === selectedCard.id));
                        if (list) handleDeleteCard(selectedCard.id, list.id);
                    }}
                />
            )}
        </div>
    );
}

/* List Column Component */
function ListColumn({
    list,
    onAddCard,
    addingCard,
    newCardTitle,
    setNewCardTitle,
    onSubmitCard,
    onCancelAdd,
    onCardClick,
    onDeleteList
}: {
    list: ListWithCards;
    onAddCard: () => void;
    addingCard: boolean;
    newCardTitle: string;
    setNewCardTitle: (title: string) => void;
    onSubmitCard: () => void;
    onCancelAdd: () => void;
    onCardClick: (card: CardWithRelations) => void;
    onDeleteList: () => void;
}) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="shrink-0 w-72 flex flex-col max-h-full">
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-full">
                {/* List Header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                        {list.name}
                    </h3>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                        </button>
                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg py-1 min-w-[140px]">
                                    <button
                                        onClick={() => { onDeleteList(); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete list
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {list.cards.map((card) => (
                        <CardItem
                            key={card.id}
                            card={card}
                            onClick={() => onCardClick(card)}
                        />
                    ))}

                    {/* Add Card Form */}
                    {addingCard && (
                        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-2">
                            <textarea
                                placeholder="Enter card title..."
                                value={newCardTitle}
                                onChange={(e) => setNewCardTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        onSubmitCard();
                                    }
                                }}
                                className="w-full px-2 py-1.5 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm resize-none focus:outline-none min-h-[60px]"
                                autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={onSubmitCard}
                                    className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                                >
                                    Add Card
                                </button>
                                <button
                                    onClick={onCancelAdd}
                                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-zinc-500" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Card Button */}
                {!addingCard && (
                    <button
                        onClick={onAddCard}
                        className="flex items-center gap-2 px-3 py-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-b-xl text-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add a card
                    </button>
                )}
            </div>
        </div>
    );
}

/* Card Item Component */
function CardItem({ card, onClick }: { card: CardWithRelations; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="group bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md cursor-pointer transition-all"
        >
            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {card.labels.map((label) => (
                        <span
                            key={label.id}
                            className="px-2 py-0.5 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: label.color }}
                        >
                            {label.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Title */}
            <p className="text-sm text-zinc-900 dark:text-zinc-100 mb-2">
                {card.title}
            </p>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
                {card.due_date && (
                    <div className={`flex items-center gap-1 text-xs ${card.is_complete
                            ? "text-green-500"
                            : new Date(card.due_date) < new Date()
                                ? "text-red-500"
                                : ""
                        }`}>
                        {card.is_complete ? (
                            <CheckCircle2 className="w-3 h-3" />
                        ) : (
                            <Calendar className="w-3 h-3" />
                        )}
                        {new Date(card.due_date).toLocaleDateString()}
                    </div>
                )}
                {(card.comments_count || 0) > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                        <MessageSquare className="w-3 h-3" />
                        {card.comments_count}
                    </div>
                )}
                {(card.attachments_count || 0) > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                        <Paperclip className="w-3 h-3" />
                        {card.attachments_count}
                    </div>
                )}
            </div>

            {/* Assignees */}
            {card.assignees && card.assignees.length > 0 && (
                <div className="flex -space-x-2 mt-2">
                    {card.assignees.slice(0, 3).map((user) => (
                        <div
                            key={user.id}
                            className="w-6 h-6 rounded-full bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300"
                            title={user.name || ""}
                        >
                            {user.name?.[0]?.toUpperCase() || "?"}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* Card Modal Component */
function CardModal({
    card,
    labels,
    onClose,
    onDelete
}: {
    card: CardWithRelations;
    labels: Label[];
    onClose: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex-1 pr-4">
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            {card.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 grid grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="col-span-2 space-y-6">
                        {/* Labels */}
                        {card.labels && card.labels.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Labels</h4>
                                <div className="flex flex-wrap gap-2">
                                    {card.labels.map((label) => (
                                        <span
                                            key={label.id}
                                            className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                            style={{ backgroundColor: label.color }}
                                        >
                                            {label.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Description</h4>
                            {card.description ? (
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap">
                                    {card.description}
                                </p>
                            ) : (
                                <p className="text-zinc-400 dark:text-zinc-500 text-sm italic">
                                    No description yet...
                                </p>
                            )}
                        </div>

                        {/* Due Date */}
                        {card.due_date && (
                            <div>
                                <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Due Date</h4>
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${card.is_complete
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                        : new Date(card.due_date) < new Date()
                                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                    }`}>
                                    <Calendar className="w-4 h-4" />
                                    {new Date(card.due_date).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Actions</h4>
                        <button className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 transition-colors">
                            <Edit3 className="w-4 h-4" />
                            Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="w-full flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg text-sm text-red-700 dark:text-red-400 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
