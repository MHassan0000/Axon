"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
    CheckSquare,
    Square,
    Users,
    Tag,
    Settings,
    Copy,
    Upload,
    File,
    Image as ImageIcon,
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
    uploadPreparedAttachment,
    updateCard,
} from "@/lib/actions";
import { useBoardRealtime } from "@/lib/hooks/useRealtime";
import { useInvalidateOnCardChange } from "@/lib/hooks/useDashboard";
import { CardModal } from "@/components/dashboard-components/CardModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BoardPageSkeleton } from "@/components/ui/Skeleton";
import { 
    BoardFilter, 
    type FilterState, 
    initialFilterState, 
    filterCard, 
    isFilterActive,
    getActiveFilterCount 
} from "@/components/dashboard-components/BoardFilter";
import type {
    BoardWithLists,
    ListWithCards,
    CardWithRelations,
    Card,
    List,
    Label,
} from "@/lib/types/database";
import { BoardSettingsModal } from "@/components/dashboard-components/BoardSettingsModal";

// File attachment type for card creation
type PendingFile = {
    file: File;
    preview?: string;
};

// Type for workspace members from the API
type WorkspaceMember = { id: string; name: string | null; email: string; avatar_url: string | null; role: string };

export default function BoardPage() {
    const params = useParams();
    const router = useRouter();
    const boardId = params.id as string;

    // Cache invalidation hook for card changes
    const invalidateOnCardChange = useInvalidateOnCardChange();

    const [board, setBoard] = useState<BoardWithLists | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingList, setAddingList] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [addingCardToList, setAddingCardToList] = useState<string | null>(null);
    const [newCardTitle, setNewCardTitle] = useState("");
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [selectedCard, setSelectedCard] = useState<CardWithRelations | null>(null);
    const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
    const [showBoardSettings, setShowBoardSettings] = useState(false);
    
    // Filter state
    const [filters, setFilters] = useState<FilterState>(initialFilterState);

    // Memoized filtered lists for rendering
    const filteredLists = useMemo(() => {
        if (!board || !isFilterActive(filters)) return board?.lists || [];
        
        return board.lists.map(list => ({
            ...list,
            cards: list.cards.filter(card => filterCard(card, filters)),
        }));
    }, [board, filters]);

    // Confirmation dialog state
    const [deleteListConfirm, setDeleteListConfirm] = useState<{ isOpen: boolean; listId: string | null; listName: string }>({
        isOpen: false,
        listId: null,
        listName: "",
    });

    // Fetch board data
    useEffect(() => {
        async function fetchBoard() {
            try {
                const b = await getBoardWithLists(boardId);
                // Sort lists and cards by position on initial load
                if (b) {
                    b.lists = b.lists.sort((a, b) => a.position - b.position);
                    b.lists.forEach(list => {
                        list.cards = list.cards.sort((a, b) => a.position - b.position);
                    });
                }
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
            // Check if card already exists (from optimistic update)
            const existingList = prev.lists.find((l) => l.cards.some((c) => c.id === card.id));
            if (existingList) return prev; // Already exists, skip
            
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
                        c.id === card.id 
                            ? { ...c, ...card, comments_count: c.comments_count, attachments_count: c.attachments_count } 
                            : c
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
    const handleDragEnd = useCallback(async (result: DropResult) => {
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

            // Store previous state for rollback
            const previousLists = board.lists;

            // Optimistic update
            setBoard({ ...board, lists: newLists });

            // Persist to database
            const listIds = newLists.map((l) => l.id);
            const success = await reorderLists(boardId, listIds);
            
            if (!success) {
                // Rollback on failure
                setBoard({ ...board, lists: previousLists });
                toast.error("Failed to reorder lists");
            }
        } else if (type === "CARD") {
            const sourceListId = source.droppableId;
            const destListId = destination.droppableId;

            // Store previous state for rollback
            const previousLists = board.lists;

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
                const success = await reorderCards(sourceListId, cardIds);
                
                if (!success) {
                    // Rollback on failure
                    setBoard({ ...board, lists: previousLists });
                    toast.error("Failed to reorder cards");
                }
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
                const success = await moveCard(movedCard.id, destListId, destination.index);
                
                if (!success) {
                    // Rollback on failure
                    setBoard({ ...board, lists: previousLists });
                    toast.error("Failed to move card");
                }
            }
        }
    }, [board, boardId]);

    // Create List Handler - Instant optimistic update
    const handleAddList = useCallback(async () => {
        if (!newListName.trim() || !board) return;

        const tempId = `temp-${Date.now()}`;
        const tempList: ListWithCards = {
            id: tempId,
            board_id: boardId,
            name: newListName.trim(),
            color: "#6366f1",
            position: board.lists.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            cards: [],
        };

        // Immediately update UI
        setBoard({
            ...board,
            lists: [...board.lists, tempList],
        });
        setNewListName("");
        setAddingList(false);

        try {
            const list = await createList({ board_id: boardId, name: tempList.name });
            if (list) {
                // Replace temp list with real list
                setBoard((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        lists: prev.lists.map((l) =>
                            l.id === tempId ? { ...list, cards: [] } : l
                        ),
                    };
                });
            } else {
                // Remove temp list on failure
                setBoard((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        lists: prev.lists.filter((l) => l.id !== tempId),
                    };
                });
                toast.error("Failed to create list");
            }
        } catch (error) {
            console.error("Error creating list:", error);
            // Remove temp list on error
            setBoard((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    lists: prev.lists.filter((l) => l.id !== tempId),
                };
            });
            toast.error("Failed to create list");
        }
    }, [board, boardId, newListName]);

    // Create Card Handler - Instant optimistic update with file upload support
    const handleAddCard = useCallback(async (listId: string, filesToUpload?: PendingFile[]) => {
        if (!newCardTitle.trim() || !board) return;

        // Don't allow adding to temp lists
        if (listId.startsWith("temp-")) {
            toast.error("Please wait for the list to be created");
            return;
        }

        const list = board.lists.find((l) => l.id === listId);
        if (!list) return;

        const tempId = `temp-card-${Date.now()}`;
        const hasFiles = filesToUpload && filesToUpload.length > 0;
        const tempCard: CardWithRelations = {
            id: tempId,
            list_id: listId,
            title: newCardTitle.trim(),
            description: null,
            position: list.cards.length,
            due_date: null,
            is_complete: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            labels: [],
            assignees: [],
            comments_count: 0,
            attachments_count: hasFiles ? filesToUpload.length : 0,
        };

        // Immediately update UI
        setBoard({
            ...board,
            lists: board.lists.map((l) =>
                l.id === listId
                    ? { ...l, cards: [...l.cards, tempCard] }
                    : l
            ),
        });
        setNewCardTitle("");
        setPendingFiles([]);
        setAddingCardToList(null);

        try {
            const card = await createCard({ list_id: listId, title: tempCard.title });
            if (card) {
                // Upload files if any
                if (hasFiles) {
                    const uploadPromises = filesToUpload.map(async (pf) => {
                        const arrayBuffer = await pf.file.arrayBuffer();
                        const base64 = btoa(
                            new Uint8Array(arrayBuffer).reduce(
                                (data, byte) => data + String.fromCharCode(byte),
                                ""
                            )
                        );
                        return uploadPreparedAttachment(card.id, {
                            name: pf.file.name,
                            type: pf.file.type,
                            size: pf.file.size,
                            data: base64,
                        });
                    });

                    // Upload files in background - don't wait
                    Promise.all(uploadPromises).catch((err) => {
                        console.error("Error uploading attachments:", err);
                    });
                }

                // Replace temp card with real card
                setBoard((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        lists: prev.lists.map((l) =>
                            l.id === listId
                                ? {
                                    ...l,
                                    cards: l.cards.map((c) =>
                                        c.id === tempId ? { ...tempCard, ...card, attachments_count: hasFiles ? filesToUpload.length : 0 } as CardWithRelations : c
                                    ),
                                }
                                : l
                        ),
                    };
                });
                // Invalidate analytics/activity caches after card creation
                invalidateOnCardChange({ activity: true, analytics: true });
            } else {
                // Remove temp card on failure
                setBoard((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        lists: prev.lists.map((l) =>
                            l.id === listId
                                ? { ...l, cards: l.cards.filter((c) => c.id !== tempId) }
                                : l
                        ),
                    };
                });
                toast.error("Failed to create card");
            }
        } catch (error) {
            console.error("Error creating card:", error);
            // Remove temp card on error
            setBoard((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    lists: prev.lists.map((l) =>
                        l.id === listId
                            ? { ...l, cards: l.cards.filter((c) => c.id !== tempId) }
                            : l
                    ),
                };
            });
            toast.error("Failed to create card");
        }
    }, [board, newCardTitle, invalidateOnCardChange]);

    // Delete Card Handler
    const handleDeleteCard = useCallback(async (cardId: string, listId: string) => {
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
            // Invalidate analytics/activity caches after card deletion
            invalidateOnCardChange({ activity: true, analytics: true });
        } catch (error) {
            console.error("Error deleting card:", error);
            toast.error("Failed to delete card");
            // Refetch on error
            const b = await getBoardWithLists(boardId);
            setBoard(b);
        }
    }, [board, boardId, invalidateOnCardChange]);

    // Delete List Handler - show confirmation dialog
    const handleDeleteList = useCallback((listId: string) => {
        if (!board) return;
        const list = board.lists.find(l => l.id === listId);
        setDeleteListConfirm({
            isOpen: true,
            listId,
            listName: list?.name || "this list",
        });
    }, [board]);

    // Confirmed delete list
    const confirmDeleteList = async () => {
        if (!board || !deleteListConfirm.listId) return;

        const listId = deleteListConfirm.listId;
        setDeleteListConfirm({ isOpen: false, listId: null, listName: "" });

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

    // Toggle Card Complete Handler - Instant optimistic update
    const handleToggleComplete = useCallback(async (card: CardWithRelations) => {
        if (!board) return;

        // Don't allow toggling on temp cards
        if (card.id.startsWith("temp-")) return;

        const newIsComplete = !card.is_complete;

        // Optimistic update
        setBoard({
            ...board,
            lists: board.lists.map((list) => ({
                ...list,
                cards: list.cards.map((c) =>
                    c.id === card.id ? { ...c, is_complete: newIsComplete } : c
                ),
            })),
        });

        // Update selected card if it's the one being toggled
        if (selectedCard?.id === card.id) {
            setSelectedCard({ ...selectedCard, is_complete: newIsComplete });
        }

        try {
            await updateCard(card.id, { is_complete: newIsComplete });
            // Invalidate analytics (completion affects stats) and calendar (due date display changes)
            invalidateOnCardChange({ activity: true, analytics: true, calendar: true });
        } catch (error) {
            console.error("Error toggling card complete:", error);
            toast.error("Failed to update card");
            // Rollback on error
            setBoard({
                ...board,
                lists: board.lists.map((list) => ({
                    ...list,
                    cards: list.cards.map((c) =>
                        c.id === card.id ? { ...c, is_complete: card.is_complete } : c
                    ),
                })),
            });
            if (selectedCard?.id === card.id) {
                setSelectedCard({ ...selectedCard, is_complete: card.is_complete });
            }
        }
    }, [board, selectedCard, invalidateOnCardChange]);

    // Loading state
    if (loading) {
        return <BoardPageSkeleton />;
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

    const boardBackgroundStyle = board.background_image
        ? {
            backgroundImage: `url(${board.background_image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { backgroundColor: board.background_color || "#0a0a0a" };

    return (
        <div
            className="flex flex-col h-full transition-colors duration-200"
            style={boardBackgroundStyle}
        >
            {/* Board Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-black/30 backdrop-blur-sm border-b border-white/10 relative z-50">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        onClick={() => router.back()}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                    </button>
                    <h1 className="text-base sm:text-lg font-semibold text-white truncate">
                        {board.name}
                    </h1>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Filter Button */}
                    <BoardFilter
                        labels={board.labels || []}
                        members={workspaceMembers}
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                    <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium transition-colors">
                        <Users className="w-4 h-4" />
                        <span>Share</span>
                    </button>
                    <button className="sm:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                        <Users className="w-4 h-4 text-white/80" />
                    </button>
                    <button
                        onClick={() => setShowBoardSettings(true)}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Board Settings"
                    >
                        <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
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
                                {/* Lists - filtered based on active filters */}
                                {filteredLists.map((list, index) => (
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
                                                        newCardTitle={newCardTitle}
                                                        setNewCardTitle={setNewCardTitle}
                                                        pendingFiles={pendingFiles}
                                                        setPendingFiles={setPendingFiles}
                                                        onSubmitCard={() => handleAddCard(list.id, pendingFiles)}
                                                        onCancelAdd={() => {
                                                            setAddingCardToList(null);
                                                            setNewCardTitle("");
                                                            setPendingFiles([]);
                                                        }}
                                                        onCardClick={setSelectedCard}
                                                        onDeleteList={() => handleDeleteList(list.id)}
                                                        onToggleComplete={handleToggleComplete}
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
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleAddList}
                                                    disabled={!newListName.trim()}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                                >
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

            {/* Delete List Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteListConfirm.isOpen}
                onClose={() => setDeleteListConfirm({ isOpen: false, listId: null, listName: "" })}
                onConfirm={confirmDeleteList}
                title="Delete List"
                message={`Are you sure you want to delete "${deleteListConfirm.listName}" and all its cards? This action cannot be undone.`}
                confirmText="Delete List"
                cancelText="Cancel"
                variant="danger"
                icon="trash"
            />
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
    newCardTitle: string;
    setNewCardTitle: (title: string) => void;
    pendingFiles: PendingFile[];
    setPendingFiles: (files: PendingFile[]) => void;
    onSubmitCard: () => void;
    onCancelAdd: () => void;
    onCardClick: (card: CardWithRelations) => void;
    onDeleteList: () => void;
    onRenameList: (newName: string) => void;
    onCopyList: () => void;
    onToggleComplete: (card: CardWithRelations) => void;
}

const ListColumn = React.memo(function ListColumn({
    list,
    dragHandleProps,
    onAddCard,
    addingCard,
    newCardTitle,
    setNewCardTitle,
    pendingFiles,
    setPendingFiles,
    onSubmitCard,
    onCancelAdd,
    onCardClick,
    onDeleteList,
    onRenameList,
    onCopyList,
    onToggleComplete,
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
                            {/* Cards - order maintained by optimistic updates, no sorting needed */}
                            {list.cards.map((card, index) => (
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
                                                    onToggleComplete={() => onToggleComplete(card)}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                            {provided.placeholder}

                            {/* Add Card Form */}
                            {addingCard && (
                                <AddCardForm
                                    newCardTitle={newCardTitle}
                                    setNewCardTitle={setNewCardTitle}
                                    pendingFiles={pendingFiles}
                                    setPendingFiles={setPendingFiles}
                                    onSubmitCard={onSubmitCard}
                                    onCancelAdd={onCancelAdd}
                                />
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
});

/* =====================================================
   Card Item Component
   ===================================================== */

const CardItem = React.memo(function CardItem({ 
    card, 
    onClick, 
    onToggleComplete 
}: { 
    card: CardWithRelations; 
    onClick: () => void;
    onToggleComplete: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`group bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md cursor-pointer transition-all ${
                card.is_complete ? "opacity-75" : ""
            }`}
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

            {/* Title with Checkbox */}
            <div className="flex items-start gap-2 mb-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete();
                    }}
                    className={`shrink-0 mt-0.5 p-0.5 rounded transition-colors ${
                        card.is_complete
                            ? "text-green-500 hover:text-green-600"
                            : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                    }`}
                    title={card.is_complete ? "Mark incomplete" : "Mark complete"}
                >
                    {card.is_complete ? (
                        <CheckSquare className="w-4 h-4" />
                    ) : (
                        <Square className="w-4 h-4" />
                    )}
                </button>
                <p className={`text-sm text-zinc-900 dark:text-zinc-100 ${
                    card.is_complete ? "line-through text-zinc-500 dark:text-zinc-400" : ""
                }`}>
                    {card.title}
                </p>
            </div>

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
});

/* =====================================================
   Add Card Form Component with File Upload
   ===================================================== */

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB limit for server actions
const ALLOWED_TYPES = [
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain", "text/csv", "application/json", "application/zip",
];

interface AddCardFormProps {
    newCardTitle: string;
    setNewCardTitle: (title: string) => void;
    pendingFiles: PendingFile[];
    setPendingFiles: (files: PendingFile[]) => void;
    onSubmitCard: () => void;
    onCancelAdd: () => void;
}

const AddCardForm = React.memo(function AddCardForm({
    newCardTitle,
    setNewCardTitle,
    pendingFiles,
    setPendingFiles,
    onSubmitCard,
    onCancelAdd,
}: AddCardFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const validFiles: PendingFile[] = [];
        const errors: string[] = [];

        Array.from(files).forEach((file) => {
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name} exceeds 1MB limit. Please use a smaller file.`);
                return;
            }
            if (!ALLOWED_TYPES.includes(file.type)) {
                errors.push(`${file.name} has unsupported file type`);
                return;
            }

            // Create preview for images
            let preview: string | undefined;
            if (file.type.startsWith("image/")) {
                preview = URL.createObjectURL(file);
            }

            validFiles.push({ file, preview });
        });

        if (errors.length > 0) {
            toast.error(errors.join(", "));
        }

        if (validFiles.length > 0) {
            setPendingFiles([...pendingFiles, ...validFiles]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const removeFile = (index: number) => {
        const newFiles = [...pendingFiles];
        // Revoke preview URL to prevent memory leaks
        if (newFiles[index].preview) {
            URL.revokeObjectURL(newFiles[index].preview!);
        }
        newFiles.splice(index, 1);
        setPendingFiles(newFiles);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const isImage = (type: string) => type.startsWith("image/");

    return (
        <div
            className={`bg-white dark:bg-zinc-800 rounded-lg border-2 ${
                isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-zinc-200 dark:border-zinc-700"
            } p-2 transition-colors`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
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
                className="w-full px-2 py-1.5 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm resize-none focus:outline-none min-h-15"
                autoFocus
            />

            {/* Pending Files Preview */}
            {pendingFiles.length > 0 && (
                <div className="mt-2 space-y-1.5">
                    {pendingFiles.map((pf, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-md"
                        >
                            {pf.preview ? (
                                <img
                                    src={pf.preview}
                                    alt={pf.file.name}
                                    className="w-8 h-8 object-cover rounded"
                                />
                            ) : (
                                <div className="w-8 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 rounded">
                                    <File className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                                    {pf.file.name}
                                </p>
                                <p className="text-xs text-zinc-400">
                                    {formatFileSize(pf.file.size)}
                                </p>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded"
                            >
                                <X className="w-3 h-3 text-zinc-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* File Drop Zone Hint */}
            {isDragging && (
                <div className="mt-2 p-3 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-center">
                    <Upload className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Drop files here
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-2">
                <button
                    onClick={onSubmitCard}
                    disabled={!newCardTitle.trim()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add Card
                    {pendingFiles.length > 0 && (
                        <span className="flex items-center gap-1 text-xs opacity-75">
                            <Paperclip className="w-3 h-3" />
                            {pendingFiles.length}
                        </span>
                    )}
                </button>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept={ALLOWED_TYPES.join(",")}
                    onChange={(e) => handleFileSelect(e.target.files)}
                />
                
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    title="Attach files"
                >
                    <Paperclip className="w-5 h-5 text-zinc-500" />
                </button>
                
                <button
                    onClick={onCancelAdd}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-zinc-500" />
                </button>
            </div>
        </div>
    );
});
