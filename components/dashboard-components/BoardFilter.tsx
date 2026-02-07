"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
    Filter,
    X,
    Check,
    Calendar,
    Tag,
    Users,
    Clock,
    CheckCircle2,
    Circle,
    AlertCircle,
} from "lucide-react";
import type { Label, User, CardWithRelations, ListWithCards } from "@/lib/types/database";

/* =====================================================
   Filter Types
   ===================================================== */

export interface FilterState {
    labels: string[];           // Label IDs
    assignees: string[];        // User IDs
    dueDate: DueDateFilter[];   // Due date filters
    completion: CompletionFilter | null;
    noLabels: boolean;
    noAssignees: boolean;
    noDueDate: boolean;
}

export type DueDateFilter = 
    | "overdue"
    | "due_today"
    | "due_week"
    | "due_month"
    | "no_date";

export type CompletionFilter = "complete" | "incomplete";

export const initialFilterState: FilterState = {
    labels: [],
    assignees: [],
    dueDate: [],
    completion: null,
    noLabels: false,
    noAssignees: false,
    noDueDate: false,
};

/* =====================================================
   Filter Logic (exported for use in board page)
   ===================================================== */

export function isFilterActive(filters: FilterState): boolean {
    return (
        filters.labels.length > 0 ||
        filters.assignees.length > 0 ||
        filters.dueDate.length > 0 ||
        filters.completion !== null ||
        filters.noLabels ||
        filters.noAssignees ||
        filters.noDueDate
    );
}

export function getActiveFilterCount(filters: FilterState): number {
    let count = 0;
    count += filters.labels.length;
    count += filters.assignees.length;
    count += filters.dueDate.length;
    if (filters.completion) count++;
    if (filters.noLabels) count++;
    if (filters.noAssignees) count++;
    if (filters.noDueDate) count++;
    return count;
}

export function filterCard(card: CardWithRelations, filters: FilterState): boolean {
    // If no filters are active, show all cards
    if (!isFilterActive(filters)) return true;

    // Label filters
    if (filters.labels.length > 0) {
        const cardLabelIds = card.labels?.map(l => l.id) || [];
        const hasMatchingLabel = filters.labels.some(labelId => cardLabelIds.includes(labelId));
        if (!hasMatchingLabel) return false;
    }

    // No labels filter
    if (filters.noLabels) {
        if (card.labels && card.labels.length > 0) return false;
    }

    // Assignee filters
    if (filters.assignees.length > 0) {
        const cardAssigneeIds = card.assignees?.map(a => a.id) || [];
        const hasMatchingAssignee = filters.assignees.some(userId => cardAssigneeIds.includes(userId));
        if (!hasMatchingAssignee) return false;
    }

    // No assignees filter
    if (filters.noAssignees) {
        if (card.assignees && card.assignees.length > 0) return false;
    }

    // Due date filters
    if (filters.dueDate.length > 0) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);
        const endOfMonth = new Date(today);
        endOfMonth.setDate(today.getDate() + 30);

        let matchesDueDate = false;

        for (const dueDateFilter of filters.dueDate) {
            if (dueDateFilter === "no_date") {
                if (!card.due_date) matchesDueDate = true;
            } else if (card.due_date) {
                const dueDate = new Date(card.due_date);
                
                switch (dueDateFilter) {
                    case "overdue":
                        if (dueDate < today && !card.is_complete) matchesDueDate = true;
                        break;
                    case "due_today":
                        if (dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
                            matchesDueDate = true;
                        }
                        break;
                    case "due_week":
                        if (dueDate >= today && dueDate <= endOfWeek) matchesDueDate = true;
                        break;
                    case "due_month":
                        if (dueDate >= today && dueDate <= endOfMonth) matchesDueDate = true;
                        break;
                }
            }
        }

        if (!matchesDueDate) return false;
    }

    // No due date filter (separate from dueDate array)
    if (filters.noDueDate) {
        if (card.due_date) return false;
    }

    // Completion filter
    if (filters.completion !== null) {
        if (filters.completion === "complete" && !card.is_complete) return false;
        if (filters.completion === "incomplete" && card.is_complete) return false;
    }

    return true;
}

export function filterLists(lists: ListWithCards[], filters: FilterState): ListWithCards[] {
    if (!isFilterActive(filters)) return lists;

    return lists.map(list => ({
        ...list,
        cards: list.cards.filter(card => filterCard(card, filters)),
    })).filter(list => list.cards.length > 0 || !isFilterActive(filters));
}

/* =====================================================
   Board Filter Component
   ===================================================== */

interface BoardFilterProps {
    labels: Label[];
    members: { id: string; name: string | null; email: string; avatar_url: string | null }[];
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
}

export function BoardFilter({ labels, members, filters, onFiltersChange }: BoardFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const activeCount = getActiveFilterCount(filters);
    const hasActiveFilters = isFilterActive(filters);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    // Toggle handlers
    const toggleLabel = useCallback((labelId: string) => {
        const newLabels = filters.labels.includes(labelId)
            ? filters.labels.filter(id => id !== labelId)
            : [...filters.labels, labelId];
        onFiltersChange({ ...filters, labels: newLabels, noLabels: false });
    }, [filters, onFiltersChange]);

    const toggleAssignee = useCallback((userId: string) => {
        const newAssignees = filters.assignees.includes(userId)
            ? filters.assignees.filter(id => id !== userId)
            : [...filters.assignees, userId];
        onFiltersChange({ ...filters, assignees: newAssignees, noAssignees: false });
    }, [filters, onFiltersChange]);

    const toggleDueDate = useCallback((dueDateFilter: DueDateFilter) => {
        const newDueDate = filters.dueDate.includes(dueDateFilter)
            ? filters.dueDate.filter(d => d !== dueDateFilter)
            : [...filters.dueDate, dueDateFilter];
        onFiltersChange({ ...filters, dueDate: newDueDate, noDueDate: false });
    }, [filters, onFiltersChange]);

    const toggleCompletion = useCallback((completion: CompletionFilter) => {
        const newCompletion = filters.completion === completion ? null : completion;
        onFiltersChange({ ...filters, completion: newCompletion });
    }, [filters, onFiltersChange]);

    const toggleNoLabels = useCallback(() => {
        onFiltersChange({ ...filters, noLabels: !filters.noLabels, labels: [] });
    }, [filters, onFiltersChange]);

    const toggleNoAssignees = useCallback(() => {
        onFiltersChange({ ...filters, noAssignees: !filters.noAssignees, assignees: [] });
    }, [filters, onFiltersChange]);

    const toggleNoDueDate = useCallback(() => {
        onFiltersChange({ ...filters, noDueDate: !filters.noDueDate, dueDate: [] });
    }, [filters, onFiltersChange]);

    const clearAllFilters = useCallback(() => {
        onFiltersChange(initialFilterState);
    }, [onFiltersChange]);

    return (
        <div className="relative">
            {/* Filter Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    hasActiveFilters
                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        : "bg-white/10 hover:bg-white/20 text-white/80"
                }`}
            >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
                {activeCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                        {activeCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="fixed sm:absolute right-4 sm:right-0 top-auto sm:top-full mt-2 z-[100] w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                            Filter Cards
                        </h3>
                        <div className="flex items-center gap-2">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Clear all
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                            >
                                <X className="w-4 h-4 text-zinc-500" />
                            </button>
                        </div>
                    </div>

                    <div className="p-3 space-y-4">
                        {/* Completion Status */}
                        <FilterSection title="Completion" icon={<CheckCircle2 className="w-4 h-4" />}>
                            <FilterCheckbox
                                checked={filters.completion === "complete"}
                                onChange={() => toggleCompletion("complete")}
                                label="Complete"
                                icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
                            />
                            <FilterCheckbox
                                checked={filters.completion === "incomplete"}
                                onChange={() => toggleCompletion("incomplete")}
                                label="Incomplete"
                                icon={<Circle className="w-4 h-4 text-zinc-400" />}
                            />
                        </FilterSection>

                        {/* Due Date */}
                        <FilterSection title="Due Date" icon={<Calendar className="w-4 h-4" />}>
                            <FilterCheckbox
                                checked={filters.dueDate.includes("overdue")}
                                onChange={() => toggleDueDate("overdue")}
                                label="Overdue"
                                icon={<AlertCircle className="w-4 h-4 text-red-500" />}
                            />
                            <FilterCheckbox
                                checked={filters.dueDate.includes("due_today")}
                                onChange={() => toggleDueDate("due_today")}
                                label="Due today"
                                icon={<Clock className="w-4 h-4 text-yellow-500" />}
                            />
                            <FilterCheckbox
                                checked={filters.dueDate.includes("due_week")}
                                onChange={() => toggleDueDate("due_week")}
                                label="Due this week"
                                icon={<Calendar className="w-4 h-4 text-blue-500" />}
                            />
                            <FilterCheckbox
                                checked={filters.dueDate.includes("due_month")}
                                onChange={() => toggleDueDate("due_month")}
                                label="Due this month"
                                icon={<Calendar className="w-4 h-4 text-purple-500" />}
                            />
                            <FilterCheckbox
                                checked={filters.noDueDate}
                                onChange={toggleNoDueDate}
                                label="No due date"
                                icon={<Calendar className="w-4 h-4 text-zinc-400" />}
                            />
                        </FilterSection>

                        {/* Labels */}
                        <FilterSection title="Labels" icon={<Tag className="w-4 h-4" />}>
                            <FilterCheckbox
                                checked={filters.noLabels}
                                onChange={toggleNoLabels}
                                label="No labels"
                                icon={<Tag className="w-4 h-4 text-zinc-400" />}
                            />
                            {labels.length > 0 && (
                                <div className="border-t border-zinc-100 dark:border-zinc-800 my-2 pt-2">
                                    {labels.map(label => (
                                        <FilterCheckbox
                                            key={label.id}
                                            checked={filters.labels.includes(label.id)}
                                            onChange={() => toggleLabel(label.id)}
                                            label={label.name || "Unnamed"}
                                            icon={
                                                <span
                                                    className="w-4 h-4 rounded"
                                                    style={{ backgroundColor: label.color }}
                                                />
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                            {labels.length === 0 && !filters.noLabels && (
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 px-2 py-1">
                                    No labels on this board
                                </p>
                            )}
                        </FilterSection>

                        {/* Members / Assignees */}
                        <FilterSection title="Members" icon={<Users className="w-4 h-4" />}>
                            <FilterCheckbox
                                checked={filters.noAssignees}
                                onChange={toggleNoAssignees}
                                label="No members"
                                icon={<Users className="w-4 h-4 text-zinc-400" />}
                            />
                            {members.length > 0 && (
                                <div className="border-t border-zinc-100 dark:border-zinc-800 my-2 pt-2">
                                    {members.map(member => (
                                        <FilterCheckbox
                                            key={member.id}
                                            checked={filters.assignees.includes(member.id)}
                                            onChange={() => toggleAssignee(member.id)}
                                            label={member.name || member.email}
                                            icon={
                                                <div className="w-5 h-5 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-xs font-medium overflow-hidden">
                                                    {member.avatar_url ? (
                                                        <img
                                                            src={member.avatar_url}
                                                            alt={member.name || ""}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-zinc-600 dark:text-zinc-300">
                                                            {(member.name || member.email)?.[0]?.toUpperCase() || "?"}
                                                        </span>
                                                    )}
                                                </div>
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                            {members.length === 0 && !filters.noAssignees && (
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 px-2 py-1">
                                    No members in workspace
                                </p>
                            )}
                        </FilterSection>
                    </div>

                    {/* Footer with summary */}
                    {hasActiveFilters && (
                        <div className="sticky bottom-0 px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {activeCount} filter{activeCount !== 1 ? "s" : ""} active
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* =====================================================
   Helper Components
   ===================================================== */

function FilterSection({ 
    title, 
    icon, 
    children 
}: { 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
}) {
    return (
        <div>
            <h4 className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2 px-1">
                {icon}
                {title}
            </h4>
            <div className="space-y-0.5">
                {children}
            </div>
        </div>
    );
}

function FilterCheckbox({
    checked,
    onChange,
    label,
    icon,
}: {
    checked: boolean;
    onChange: () => void;
    label: string;
    icon?: React.ReactNode;
}) {
    return (
        <button
            onClick={onChange}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                checked
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
        >
            <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    checked
                        ? "bg-blue-500 border-blue-500"
                        : "border-zinc-300 dark:border-zinc-600"
                }`}
            >
                {checked && <Check className="w-3 h-3 text-white" />}
            </div>
            {icon && <span className="shrink-0">{icon}</span>}
            <span className="flex-1 text-left truncate">{label}</span>
        </button>
    );
}
