"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    CheckSquare,
    Square,
    Plus,
    Trash2,
    Loader2,
    ChevronDown,
    ChevronRight,
    Pencil,
    Check,
    X,
} from "lucide-react";
import { toast } from "sonner";
import {
    createChecklist,
    getChecklists,
    deleteChecklist,
    updateChecklist,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    updateChecklistItem,
} from "@/lib/actions";
import type { ChecklistWithItems, ChecklistItem } from "@/lib/types/database";

interface ChecklistSectionProps {
    cardId: string;
}

export function ChecklistSection({ cardId }: ChecklistSectionProps) {
    const [checklists, setChecklists] = useState<ChecklistWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});
    const [collapsedChecklists, setCollapsedChecklists] = useState<Set<string>>(new Set());
    const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
    const [editChecklistTitle, setEditChecklistTitle] = useState("");
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editItemTitle, setEditItemTitle] = useState("");

    // Fetch checklists on mount
    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getChecklists(cardId);
                setChecklists(data);
            } catch (error) {
                console.error("Error fetching checklists:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [cardId]);

    // Add a new checklist - OPTIMISTIC
    const handleAddChecklist = useCallback(async () => {
        const tempId = `temp-checklist-${Date.now()}`;
        const tempChecklist: ChecklistWithItems = {
            id: tempId,
            card_id: cardId,
            title: "Checklist",
            position: checklists.length,
            created_at: new Date().toISOString(),
            items: [],
        };

        // Optimistic update
        setChecklists(prev => [...prev, tempChecklist]);

        try {
            const newChecklist = await createChecklist(cardId);
            if (newChecklist) {
                // Replace temp with real
                setChecklists(prev =>
                    prev.map(c => c.id === tempId ? { ...newChecklist, items: [] } : c)
                );
            } else {
                // Rollback on failure
                setChecklists(prev => prev.filter(c => c.id !== tempId));
                toast.error("Failed to add checklist");
            }
        } catch (error) {
            console.error("Error adding checklist:", error);
            // Rollback
            setChecklists(prev => prev.filter(c => c.id !== tempId));
            toast.error("Failed to add checklist");
        }
    }, [cardId, checklists.length]);

    // Delete a checklist - OPTIMISTIC
    const handleDeleteChecklist = useCallback(async (checklistId: string) => {
        const prevChecklists = checklists;
        
        // Optimistic update
        setChecklists(prev => prev.filter(c => c.id !== checklistId));

        try {
            const success = await deleteChecklist(checklistId);
            if (!success) {
                // Rollback
                setChecklists(prevChecklists);
                toast.error("Failed to delete checklist");
            }
        } catch (error) {
            console.error("Error deleting checklist:", error);
            // Rollback
            setChecklists(prevChecklists);
            toast.error("Failed to delete checklist");
        }
    }, [checklists]);

    // Update checklist title - OPTIMISTIC
    const handleUpdateChecklist = useCallback(async (checklistId: string) => {
        if (!editChecklistTitle.trim()) return;
        
        const prevChecklists = checklists;
        const newTitle = editChecklistTitle.trim();
        
        // Optimistic update
        setChecklists(prev =>
            prev.map(c => c.id === checklistId ? { ...c, title: newTitle } : c)
        );
        setEditingChecklistId(null);

        try {
            const success = await updateChecklist(checklistId, newTitle);
            if (!success) {
                // Rollback
                setChecklists(prevChecklists);
                toast.error("Failed to update checklist");
            }
        } catch (error) {
            console.error("Error updating checklist:", error);
            // Rollback
            setChecklists(prevChecklists);
            toast.error("Failed to update checklist");
        }
    }, [checklists, editChecklistTitle]);

    // Add an item to a checklist - OPTIMISTIC
    const handleAddItem = useCallback(async (checklistId: string) => {
        const title = newItemInputs[checklistId]?.trim();
        if (!title) return;

        const tempId = `temp-item-${Date.now()}`;
        const checklist = checklists.find(c => c.id === checklistId);
        const tempItem: ChecklistItem = {
            id: tempId,
            checklist_id: checklistId,
            title,
            is_complete: false,
            position: checklist?.items.length || 0,
            created_at: new Date().toISOString(),
        };

        // Optimistic update
        setChecklists(prev =>
            prev.map(c =>
                c.id === checklistId ? { ...c, items: [...c.items, tempItem] } : c
            )
        );
        setNewItemInputs(prev => ({ ...prev, [checklistId]: "" }));

        try {
            const newItem = await addChecklistItem(checklistId, title);
            if (newItem) {
                // Replace temp with real
                setChecklists(prev =>
                    prev.map(c =>
                        c.id === checklistId
                            ? { ...c, items: c.items.map(item => item.id === tempId ? newItem : item) }
                            : c
                    )
                );
            } else {
                // Rollback
                setChecklists(prev =>
                    prev.map(c =>
                        c.id === checklistId
                            ? { ...c, items: c.items.filter(item => item.id !== tempId) }
                            : c
                    )
                );
                toast.error("Failed to add item");
            }
        } catch (error) {
            console.error("Error adding item:", error);
            // Rollback
            setChecklists(prev =>
                prev.map(c =>
                    c.id === checklistId
                        ? { ...c, items: c.items.filter(item => item.id !== tempId) }
                        : c
                )
            );
            toast.error("Failed to add item");
        }
    }, [checklists, newItemInputs]);

    // Toggle item completion - OPTIMISTIC
    const handleToggleItem = useCallback(async (checklistId: string, itemId: string, currentState: boolean) => {
        const prevChecklists = checklists;
        
        // Optimistic update - toggle immediately
        setChecklists(prev =>
            prev.map(c =>
                c.id === checklistId
                    ? {
                        ...c,
                        items: c.items.map(item =>
                            item.id === itemId ? { ...item, is_complete: !currentState } : item
                        ),
                    }
                    : c
            )
        );

        try {
            await toggleChecklistItem(itemId, !currentState);
            // Success - state already updated
        } catch (error) {
            console.error("Error toggling item:", error);
            // Rollback
            setChecklists(prevChecklists);
            toast.error("Failed to update item");
        }
    }, [checklists]);

    // Delete an item - OPTIMISTIC
    const handleDeleteItem = useCallback(async (checklistId: string, itemId: string) => {
        const prevChecklists = checklists;
        
        // Optimistic update
        setChecklists(prev =>
            prev.map(c =>
                c.id === checklistId
                    ? { ...c, items: c.items.filter(item => item.id !== itemId) }
                    : c
            )
        );

        try {
            await deleteChecklistItem(itemId);
            // Success - state already updated
        } catch (error) {
            console.error("Error deleting item:", error);
            // Rollback
            setChecklists(prevChecklists);
            toast.error("Failed to delete item");
        }
    }, [checklists]);

    // Update item title - OPTIMISTIC
    const handleUpdateItem = useCallback(async (checklistId: string, itemId: string) => {
        if (!editItemTitle.trim()) return;
        
        const prevChecklists = checklists;
        const newTitle = editItemTitle.trim();
        
        // Optimistic update
        setChecklists(prev =>
            prev.map(c =>
                c.id === checklistId
                    ? {
                        ...c,
                        items: c.items.map(item =>
                            item.id === itemId ? { ...item, title: newTitle } : item
                        ),
                    }
                    : c
            )
        );
        setEditingItemId(null);

        try {
            const success = await updateChecklistItem(itemId, newTitle);
            if (!success) {
                // Rollback
                setChecklists(prevChecklists);
                toast.error("Failed to update item");
            }
        } catch (error) {
            console.error("Error updating item:", error);
            // Rollback
            setChecklists(prevChecklists);
            toast.error("Failed to update item");
        }
    }, [checklists, editItemTitle]);

    // Toggle collapse
    const toggleCollapse = useCallback((checklistId: string) => {
        setCollapsedChecklists(prev => {
            const newSet = new Set(prev);
            if (newSet.has(checklistId)) {
                newSet.delete(checklistId);
            } else {
                newSet.add(checklistId);
            }
            return newSet;
        });
    }, []);

    // Calculate progress
    const getProgress = useCallback((items: ChecklistWithItems["items"]) => {
        if (items.length === 0) return 0;
        const completed = items.filter((i) => i.is_complete).length;
        return Math.round((completed / items.length) * 100);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading checklists...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with Add button */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Checklists
                </h3>
                <button
                    onClick={handleAddChecklist}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                    <Plus className="w-3 h-3" />
                    Add
                </button>
            </div>

            {/* Checklists */}
            {checklists.length === 0 ? (
                <p className="text-sm text-zinc-400">No checklists yet</p>
            ) : (
                <div className="space-y-4">
                    {checklists.map((checklist) => {
                        const progress = getProgress(checklist.items);
                        const isCollapsed = collapsedChecklists.has(checklist.id);
                        const isEditingTitle = editingChecklistId === checklist.id;
                        const isTemp = checklist.id.startsWith("temp-");

                        return (
                            <div
                                key={checklist.id}
                                className={`p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 ${isTemp ? "opacity-70" : ""}`}
                            >
                                {/* Checklist Header */}
                                <div className="flex items-center justify-between mb-2">
                                    {isEditingTitle ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={editChecklistTitle}
                                                onChange={(e) => setEditChecklistTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleUpdateChecklist(checklist.id);
                                                    if (e.key === "Escape") setEditingChecklistId(null);
                                                }}
                                                className="flex-1 px-2 py-1 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleUpdateChecklist(checklist.id)}
                                                className="p-1 text-emerald-500 hover:text-emerald-600"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingChecklistId(null)}
                                                className="p-1 text-zinc-400 hover:text-zinc-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => toggleCollapse(checklist.id)}
                                            className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200"
                                        >
                                            {isCollapsed ? (
                                                <ChevronRight className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                            {checklist.title}
                                            <span className="text-xs text-zinc-500">
                                                ({checklist.items.filter((i) => i.is_complete).length}/
                                                {checklist.items.length})
                                            </span>
                                        </button>
                                    )}
                                    {!isEditingTitle && !isTemp && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditingChecklistId(checklist.id);
                                                    setEditChecklistTitle(checklist.title);
                                                }}
                                                className="p-1 text-zinc-400 hover:text-blue-500 transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteChecklist(checklist.id)}
                                                className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mb-3 overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                {/* Items (collapsible) */}
                                {!isCollapsed && (
                                    <>
                                        <div className="space-y-1.5">
                                            {checklist.items.map((item) => {
                                                const isEditingItem = editingItemId === item.id;
                                                const isTempItem = item.id.startsWith("temp-");

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`flex items-center gap-2 group ${isTempItem ? "opacity-70" : ""}`}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleToggleItem(
                                                                    checklist.id,
                                                                    item.id,
                                                                    item.is_complete
                                                                )
                                                            }
                                                            className="shrink-0"
                                                            disabled={isTempItem}
                                                        >
                                                            {item.is_complete ? (
                                                                <CheckSquare className="w-4 h-4 text-emerald-500" />
                                                            ) : (
                                                                <Square className="w-4 h-4 text-zinc-400" />
                                                            )}
                                                        </button>
                                                        {isEditingItem ? (
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <input
                                                                    type="text"
                                                                    value={editItemTitle}
                                                                    onChange={(e) => setEditItemTitle(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter") handleUpdateItem(checklist.id, item.id);
                                                                        if (e.key === "Escape") setEditingItemId(null);
                                                                    }}
                                                                    className="flex-1 px-2 py-0.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    onClick={() => handleUpdateItem(checklist.id, item.id)}
                                                                    className="p-0.5 text-emerald-500 hover:text-emerald-600"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingItemId(null)}
                                                                    className="p-0.5 text-zinc-400 hover:text-zinc-500"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span
                                                                    className={`flex-1 text-sm cursor-pointer ${item.is_complete
                                                                        ? "text-zinc-400 line-through"
                                                                        : "text-zinc-700 dark:text-zinc-300"
                                                                        }`}
                                                                    onDoubleClick={() => {
                                                                        if (!isTempItem) {
                                                                            setEditingItemId(item.id);
                                                                            setEditItemTitle(item.title);
                                                                        }
                                                                    }}
                                                                >
                                                                    {item.title}
                                                                </span>
                                                                {!isTempItem && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingItemId(item.id);
                                                                                setEditItemTitle(item.title);
                                                                            }}
                                                                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-blue-500 transition-all"
                                                                        >
                                                                            <Pencil className="w-3 h-3" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDeleteItem(checklist.id, item.id)
                                                                            }
                                                                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Add Item Input */}
                                        {!isTemp && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={newItemInputs[checklist.id] || ""}
                                                    onChange={(e) =>
                                                        setNewItemInputs({
                                                            ...newItemInputs,
                                                            [checklist.id]: e.target.value,
                                                        })
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            handleAddItem(checklist.id);
                                                        }
                                                    }}
                                                    placeholder="Add an item..."
                                                    className="flex-1 px-2 py-1 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                                />
                                                <button
                                                    onClick={() => handleAddItem(checklist.id)}
                                                    className="px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
