"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
    type DraggableProvided,
    type DroppableProvided,
} from "@hello-pangea/dnd";
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
    CheckCircle2,
    Users,
    Tag,
    Settings,
    Copy,
} from "lucide-react";
import { toast } from "sonner";
import {
    getBoardWithLists,
    createList,
    createCard,
    deleteCard,
    deleteList,
    moveCard,
    reorderCards,
    reorderLists,
    updateList,
    copyList,
    updateBoard,
    deleteBoard,
    getWorkspaceMembers,
    createLabel,
    deleteLabel,
} from "@/lib/actions";
import { useBoardRealtime } from "@/lib/hooks/useRealtime";
import { CardModal } from "@/components/dashboard-components/CardModal";
import type {
    BoardWithLists,
    ListWithCards,
    CardWithRelations,
    Card,
    List,
    Label,
} from "@/lib/types/database";
import { BoardSettingsModal } from "@/components/dashboard-components/BoardSettingsModal";

// Type for workspace members from the API
type WorkspaceMember = { id: string; name: string | null; email: string; avatar_url: string | null; role: string };

export default function BoardPage() {
    const params = useParams();
    const router = useRouter();
    const boardId = params.id as string;

    const [board, setBoard] = useState<BoardWithLists | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingList, setAddingList] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [creatingList, setCreatingList] = useState(false);
    const [addingCardToList, setAddingCardToList] = useState<string | null>(null);
    const [newCardTitle, setNewCardTitle] = useState("");
    const [creatingCard, setCreatingCard] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CardWithRelations | null>(null);
    const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
    const [showBoardSettings, setShowBoardSettings] = useState(false);

    // Fetch board data
    useEffect(() => {
        async function fetchBoard() {
            try {
                const b = await getBoardWithLists(boardId);
                setBoard(b);

                // Fetch workspace members for assignee picker
                if (b) {
                    const members = await getWorkspaceMembers(b.workspace_id);
                    setWorkspaceMembers(members);
                }
            } catch (error) {
                console.error("Error fetching board:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchBoard();
    }, [boardId]);

    // Real-time callbacks
    const handleCardInsert = useCallback((card: Card) => {
        setBoard((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list.id === card.list_id
                        ? { ...list, cards: [...list.cards, card as CardWithRelations] }
                        : list
                ),
            };
        });
    }, []);

    const handleCardUpdate = useCallback((card: Card) => {
        setBoard((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                lists: prev.lists.map((list) => ({
                    ...list,
                    cards: list.cards.map((c) =>
                        c.id === card.id ? { ...c, ...card } : c
                    ),
                })),
            };
        });
        // Update selected card if it's the one being updated
        setSelectedCard((prev) =>
            prev?.id === card.id ? { ...prev, ...card } : prev
        );
    }, []);

    const handleCardDelete = useCallback((cardId: string, listId: string) => {
        setBoard((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list.id === listId
                        ? { ...list, cards: list.cards.filter((c) => c.id !== cardId) }
                        : list
                ),
            };
        });
        // Close modal if deleted card was selected
        setSelectedCard((prev) => (prev?.id === cardId ? null : prev));
    }, []);

    const handleListInsert = useCallback((list: List) => {
        setBoard((prev) => {
            if (!prev) return prev;
            // Check if list already exists
            if (prev.lists.some((l) => l.id === list.id)) return prev;
            return {
                ...prev,
                lists: [...prev.lists, { ...list, cards: [] }],
            };
        });
    }, []);

    const handleListUpdate = useCallback((list: List) => {
        setBoard((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                lists: prev.lists.map((l) =>
                    l.id === list.id ? { ...l, ...list } : l
                ),
            };
        });
    }, []);

    const handleListDelete = useCallback((listId: string) => {
        setBoard((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                lists: prev.lists.filter((l) => l.id !== listId),
            };
        });
    }, []);

    // Subscribe to real-time updates
    useBoardRealtime({
        boardId,
        onCardInsert: handleCardInsert,
        onCardUpdate: handleCardUpdate,
        onCardDelete: handleCardDelete,
        onListInsert: handleListInsert,
        onListUpdate: handleListUpdate,
        onListDelete: handleListDelete,
    });

    // Drag and Drop Handler
    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, type } = result;

        // Dropped outside droppable area
        if (!destination) return;

        // No movement
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        if (!board) return;

        if (type === "LIST") {
            // Reordering lists
            const newLists = Array.from(board.lists);
            const [movedList] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, movedList);

            // Optimistic update
            setBoard({ ...board, lists: newLists });

            // Persist to database
            const listIds = newLists.map((l) => l.id);
            await reorderLists(boardId, listIds);
        } else if (type === "CARD") {
            const sourceListId = source.droppableId;
            const destListId = destination.droppableId;

            if (sourceListId === destListId) {
                // Reordering within the same list
                const list = board.lists.find((l) => l.id === sourceListId);
                if (!list) return;

                const newCards = Array.from(list.cards);
                const [movedCard] = newCards.splice(source.index, 1);
                newCards.splice(destination.index, 0, movedCard);

                // Optimistic update
                setBoard({
                    ...board,
                    lists: board.lists.map((l) =>
                        l.id === sourceListId ? { ...l, cards: newCards } : l
                    ),
                });

                // Persist to database
                const cardIds = newCards.map((c) => c.id);
                await reorderCards(sourceListId, cardIds);
            } else {
                // Moving card to different list
                const sourceList = board.lists.find((l) => l.id === sourceListId);
                const destList = board.lists.find((l) => l.id === destListId);
                if (!sourceList || !destList) return;

                const sourceCards = Array.from(sourceList.cards);
                const destCards = Array.from(destList.cards);

                const [movedCard] = sourceCards.splice(source.index, 1);
                destCards.splice(destination.index, 0, { ...movedCard, list_id: destListId });

                // Optimistic update
                setBoard({
                    ...board,
                    lists: board.lists.map((l) => {
                        if (l.id === sourceListId) return { ...l, cards: sourceCards };
                        if (l.id === destListId) return { ...l, cards: destCards };
                        return l;
                    }),
                });

                // Persist to database
                await moveCard(movedCard.id, destListId, destination.index);
            }
        }
    };

    // Create List Handler
    const handleAddList = async () => {
        if (!newListName.trim() || !board) return;

        setCreatingList(true);
        try {
            const list = await createList({ board_id: boardId, name: newListName });
            if (list) {
                // Real-time will handle adding to state, but add optimistically too
                setBoard({
                    ...board,
                    lists: [...board.lists, { ...list, cards: [] }],
                });
                setNewListName("");
                setAddingList(false);
                toast.success("List created");
            }
        } catch (error) {
            console.error("Error creating list:", error);
            toast.error("Failed to create list");
        } finally {
            setCreatingList(false);
        }
    };

    // Create Card Handler
    const handleAddCard = async (listId: string) => {
        if (!newCardTitle.trim() || !board || creatingCard) return;

        setCreatingCard(true);
        try {
            const card = await createCard({ list_id: listId, title: newCardTitle });
            if (card) {
                // Real-time will handle it, but optimistic update
                setBoard({
                    ...board,
                    lists: board.lists.map((list) =>
                        list.id === listId
                            ? { ...list, cards: [...list.cards, card as CardWithRelations] }
                            : list
                    ),
                });
                setNewCardTitle("");
                setAddingCardToList(null);
                toast.success("Card created");
            }
        } catch (error) {
            console.error("Error creating card:", error);
            toast.error("Failed to create card");
        } finally {
            setCreatingCard(false);
        }
    };

    // Delete Card Handler
    const handleDeleteCard = async (cardId: string, listId: string) => {
        if (!board) return;

        try {
            // Optimistic update
            setBoard({
                ...board,
                lists: board.lists.map((list) =>
                    list.id === listId
                        ? { ...list, cards: list.cards.filter((c) => c.id !== cardId) }
                        : list
                ),
            });
            setSelectedCard(null);

            await deleteCard(cardId);
            toast.success("Card deleted");
        } catch (error) {
            console.error("Error deleting card:", error);
            toast.error("Failed to delete card");
            // Refetch on error
            const b = await getBoardWithLists(boardId);
            setBoard(b);
        }
    };

    // Delete List Handler
    const handleDeleteList = async (listId: string) => {
        if (!board) return;

        if (!window.confirm("Are you sure you want to delete this list and all its cards?")) {
            return;
        }

        try {
            // Optimistic update
            setBoard({
                ...board,
                lists: board.lists.filter((l) => l.id !== listId),
            });

            await deleteList(listId);
            toast.success("List deleted");
        } catch (error) {
            console.error("Error deleting list:", error);
            toast.error("Failed to delete list");
            // Refetch on error
            const b = await getBoardWithLists(boardId);
            setBoard(b);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-200">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                </div>
            </div>
        );
    }

    // Not found state
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
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium transition-colors">
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Share</span>
                    </button>
                    <button
                        onClick={() => setShowBoardSettings(true)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Board Settings"
                    >
                        <MoreHorizontal className="w-5 h-5 text-white/80" />
                    </button>
                </div>
            </div>

            {/* Kanban Board with Drag and Drop */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="board" type="LIST" direction="horizontal">
                    {(provided: DroppableProvided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex-1 overflow-x-auto overflow-y-hidden p-4"
                        >
                            <div className="flex gap-4 h-full items-start">
                                {/* Lists */}
                                {board.lists
                                    .sort((a, b) => a.position - b.position)
                                    .map((list, index) => (
                                        <Draggable
                                            key={list.id}
                                            draggableId={list.id}
                                            index={index}
                                        >
                                            {(provided: DraggableProvided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                >
                                                    <ListColumn
                                                        list={list}
                                                        dragHandleProps={provided.dragHandleProps}
                                                        onAddCard={() => setAddingCardToList(list.id)}
                                                        addingCard={addingCardToList === list.id}
                                                        creatingCard={creatingCard}
                                                        newCardTitle={newCardTitle}
                                                        setNewCardTitle={setNewCardTitle}
                                                        onSubmitCard={() => handleAddCard(list.id)}
                                                        onCancelAdd={() => {
                                                            setAddingCardToList(null);
                                                            setNewCardTitle("");
                                                        }}
                                                        onCardClick={setSelectedCard}
                                                        onDeleteList={() => handleDeleteList(list.id)}
                                                        onRenameList={async (newName) => {
                                                            try {
                                                                await updateList(list.id, { name: newName });
                                                                setBoard({
                                                                    ...board,
                                                                    lists: board.lists.map((l) =>
                                                                        l.id === list.id ? { ...l, name: newName } : l
                                                                    ),
                                                                });
                                                                toast.success("List renamed");
                                                            } catch (error) {
                                                                console.error("Error renaming list:", error);
                                                                toast.error("Failed to rename list");
                                                            }
                                                        }}
                                                        onCopyList={async () => {
                                                            try {
                                                                const newList = await copyList(list.id);
                                                                if (newList) {
                                                                    // Refetch board to get updated lists with cards
                                                                    const b = await getBoardWithLists(boardId);
                                                                    setBoard(b);
                                                                    toast.success("List copied");
                                                                }
                                                            } catch (error) {
                                                                console.error("Error copying list:", error);
                                                                toast.error("Failed to copy list");
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                {provided.placeholder}

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
                                                disabled={creatingList}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleAddList}
                                                    disabled={creatingList || !newListName.trim()}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                                >
                                                    {creatingList && <Loader2 className="w-4 h-4 animate-spin" />}
                                                    Add List
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setAddingList(false);
                                                        setNewListName("");
                                                    }}
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
                    )}
                </Droppable>
            </DragDropContext>

            {/* Card Detail Modal */}
            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    labels={board.labels || []}
                    workspaceMembers={workspaceMembers}
                    onClose={() => setSelectedCard(null)}
                    onDelete={() => {
                        const list = board.lists.find((l) =>
                            l.cards.some((c) => c.id === selectedCard.id)
                        );
                        if (list) handleDeleteCard(selectedCard.id, list.id);
                    }}
                    onUpdate={(updatedCard) => {
                        setSelectedCard(updatedCard);
                        setBoard({
                            ...board,
                            lists: board.lists.map((list) => ({
                                ...list,
                                cards: list.cards.map((c) =>
                                    c.id === updatedCard.id ? updatedCard : c
                                ),
                            })),
                        });
                    }}
                />
            )}

            {/* Board Settings Modal */}
            {showBoardSettings && (
                <BoardSettingsModal
                    board={board}
                    onClose={() => setShowBoardSettings(false)}
                    onUpdate={(updatedBoard) => {
                        setBoard({ ...board, ...updatedBoard });
                        setShowBoardSettings(false);
                    }}
                />
            )}
        </div>
    );
}

/* =====================================================
   List Column Component with Drag Handle
   ===================================================== */

interface ListColumnProps {
    list: ListWithCards;
    dragHandleProps: any;
    onAddCard: () => void;
    addingCard: boolean;
    creatingCard: boolean;
    newCardTitle: string;
    setNewCardTitle: (title: string) => void;
    onSubmitCard: () => void;
    onCancelAdd: () => void;
    onCardClick: (card: CardWithRelations) => void;
    onDeleteList: () => void;
    onRenameList: (newName: string) => void;
    onCopyList: () => void;
}

function ListColumn({
    list,
    dragHandleProps,
    onAddCard,
    addingCard,
    creatingCard,
    newCardTitle,
    setNewCardTitle,
    onSubmitCard,
    onCancelAdd,
    onCardClick,
    onDeleteList,
    onRenameList,
    onCopyList,
}: ListColumnProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(list.name);

    return (
        <div className="shrink-0 w-72 flex flex-col max-h-[calc(100vh-180px)]">
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-full">
                {/* List Header with Drag Handle */}
                <div
                    {...(isEditing ? {} : dragHandleProps)}
                    className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800 cursor-grab active:cursor-grabbing"
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {!isEditing && (
                            <GripVertical className="w-4 h-4 text-zinc-400 dark:text-zinc-600 shrink-0" />
                        )}
                        {isEditing ? (
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (editName.trim() && editName !== list.name) {
                                            onRenameList(editName.trim());
                                        }
                                        setIsEditing(false);
                                    } else if (e.key === "Escape") {
                                        setEditName(list.name);
                                        setIsEditing(false);
                                    }
                                }}
                                onBlur={() => {
                                    if (editName.trim() && editName !== list.name) {
                                        onRenameList(editName.trim());
                                    }
                                    setIsEditing(false);
                                }}
                                className="flex-1 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                autoFocus
                            />
                        ) : (
                            <>
                                <h3
                                    className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300"
                                    onDoubleClick={() => {
                                        setEditName(list.name);
                                        setIsEditing(true);
                                    }}
                                    title="Double-click to rename"
                                >
                                    {list.name}
                                </h3>
                                <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">
                                    {list.cards.length}
                                </span>
                            </>
                        )}
                    </div>
                    {!isEditing && (
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
                                    <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg py-1 min-w-40">
                                        <button
                                            onClick={() => {
                                                setEditName(list.name);
                                                setIsEditing(true);
                                                setShowMenu(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Rename list
                                        </button>
                                        <button
                                            onClick={() => {
                                                onCopyList();
                                                setShowMenu(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy list
                                        </button>
                                        <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                                        <button
                                            onClick={() => {
                                                onDeleteList();
                                                setShowMenu(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete list
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Cards with Droppable */}
                <Droppable droppableId={list.id} type="CARD">
                    {(provided: DroppableProvided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex-1 overflow-y-auto p-2 space-y-2 min-h-5"
                        >
                            {list.cards
                                .sort((a, b) => a.position - b.position)
                                .map((card, index) => (
                                    <Draggable
                                        key={card.id}
                                        draggableId={card.id}
                                        index={index}
                                    >
                                        {(provided: DraggableProvided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <CardItem
                                                    card={card}
                                                    onClick={() => onCardClick(card)}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                            {provided.placeholder}

                            {/* Add Card Form */}
                            {addingCard && (
                                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-2">
                                    <textarea
                                        placeholder="Enter card title..."
                                        value={newCardTitle}
                                        onChange={(e) => setNewCardTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey && !creatingCard) {
                                                e.preventDefault();
                                                onSubmitCard();
                                            }
                                        }}
                                        className="w-full px-2 py-1.5 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm resize-none focus:outline-none min-h-15 disabled:opacity-50"
                                        autoFocus
                                        disabled={creatingCard}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={onSubmitCard}
                                            disabled={creatingCard || !newCardTitle.trim()}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {creatingCard && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Add Card
                                        </button>
                                        <button
                                            onClick={onCancelAdd}
                                            disabled={creatingCard}
                                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <X className="w-5 h-5 text-zinc-500" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Droppable>

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

/* =====================================================
   Card Item Component
   ===================================================== */

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
                    <div
                        className={`flex items-center gap-1 text-xs ${card.is_complete
                            ? "text-green-500"
                            : new Date(card.due_date) < new Date()
                                ? "text-red-500"
                                : ""
                            }`}
                    >
                        {card.is_complete ? (
                            <CheckCircle2 className="w-3 h-3" />
                        ) : (
                            <Calendar className="w-3 h-3" />
                        )}
                        {new Date(card.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })}
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
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.name || ""}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                user.name?.[0]?.toUpperCase() || "?"
                            )}
                        </div>
                    ))}
                    {card.assignees.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            +{card.assignees.length - 3}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
