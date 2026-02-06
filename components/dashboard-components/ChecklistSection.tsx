"use client";

import React, { useState, useEffect } from "react";
import {
    CheckSquare,
    Square,
    Plus,
    Trash2,
    Loader2,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
    createChecklist,
    getChecklists,
    deleteChecklist,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
} from "@/lib/actions";
import type { ChecklistWithItems } from "@/lib/types/database";

interface ChecklistSectionProps {
    cardId: string;
}

export function ChecklistSection({ cardId }: ChecklistSectionProps) {
    const [checklists, setChecklists] = useState<ChecklistWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingChecklist, setAddingChecklist] = useState(false);
    const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});
    const [collapsedChecklists, setCollapsedChecklists] = useState<Set<string>>(new Set());

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

    // Add a new checklist
    const handleAddChecklist = async () => {
        setAddingChecklist(true);
        try {
            const newChecklist = await createChecklist(cardId);
            if (newChecklist) {
                setChecklists([...checklists, { ...newChecklist, items: [] }]);
                toast.success("Checklist added");
            }
        } catch (error) {
            console.error("Error adding checklist:", error);
            toast.error("Failed to add checklist");
        } finally {
            setAddingChecklist(false);
        }
    };

    // Delete a checklist
    const handleDeleteChecklist = async (checklistId: string) => {
        try {
            const success = await deleteChecklist(checklistId);
            if (success) {
                setChecklists(checklists.filter((c) => c.id !== checklistId));
                toast.success("Checklist deleted");
            }
        } catch (error) {
            console.error("Error deleting checklist:", error);
            toast.error("Failed to delete checklist");
        }
    };

    // Add an item to a checklist
    const handleAddItem = async (checklistId: string) => {
        const title = newItemInputs[checklistId]?.trim();
        if (!title) return;

        try {
            const newItem = await addChecklistItem(checklistId, title);
            if (newItem) {
                setChecklists(
                    checklists.map((c) =>
                        c.id === checklistId ? { ...c, items: [...c.items, newItem] } : c
                    )
                );
                setNewItemInputs({ ...newItemInputs, [checklistId]: "" });
            }
        } catch (error) {
            console.error("Error adding item:", error);
            toast.error("Failed to add item");
        }
    };

    // Toggle item completion
    const handleToggleItem = async (checklistId: string, itemId: string, currentState: boolean) => {
        try {
            await toggleChecklistItem(itemId, !currentState);
            setChecklists(
                checklists.map((c) =>
                    c.id === checklistId
                        ? {
                            ...c,
                            items: c.items.map((item) =>
                                item.id === itemId ? { ...item, is_complete: !currentState } : item
                            ),
                        }
                        : c
                )
            );
        } catch (error) {
            console.error("Error toggling item:", error);
            toast.error("Failed to update item");
        }
    };

    // Delete an item
    const handleDeleteItem = async (checklistId: string, itemId: string) => {
        try {
            await deleteChecklistItem(itemId);
            setChecklists(
                checklists.map((c) =>
                    c.id === checklistId
                        ? { ...c, items: c.items.filter((item) => item.id !== itemId) }
                        : c
                )
            );
        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error("Failed to delete item");
        }
    };

    // Toggle collapse
    const toggleCollapse = (checklistId: string) => {
        const newSet = new Set(collapsedChecklists);
        if (newSet.has(checklistId)) {
            newSet.delete(checklistId);
        } else {
            newSet.add(checklistId);
        }
        setCollapsedChecklists(newSet);
    };

    // Calculate progress
    const getProgress = (items: ChecklistWithItems["items"]) => {
        if (items.length === 0) return 0;
        const completed = items.filter((i) => i.is_complete).length;
        return Math.round((completed / items.length) * 100);
    };

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
                    disabled={addingChecklist}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                    {addingChecklist ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <Plus className="w-3 h-3" />
                    )}
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

                        return (
                            <div
                                key={checklist.id}
                                className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700"
                            >
                                {/* Checklist Header */}
                                <div className="flex items-center justify-between mb-2">
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
                                    <button
                                        onClick={() => handleDeleteChecklist(checklist.id)}
                                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
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
                                            {checklist.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-2 group"
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
                                                    >
                                                        {item.is_complete ? (
                                                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                                                        ) : (
                                                            <Square className="w-4 h-4 text-zinc-400" />
                                                        )}
                                                    </button>
                                                    <span
                                                        className={`flex-1 text-sm ${item.is_complete
                                                                ? "text-zinc-400 line-through"
                                                                : "text-zinc-700 dark:text-zinc-300"
                                                            }`}
                                                    >
                                                        {item.title}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteItem(checklist.id, item.id)
                                                        }
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add Item Input */}
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
