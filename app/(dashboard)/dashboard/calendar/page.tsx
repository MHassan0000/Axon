"use client";

import React, { useState, useMemo } from "react";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    X,
    Clock,
    CheckCircle2,
    ExternalLink,
    LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { useCardsWithDueDatesQuery } from "@/lib/hooks";
import { CalendarPageSkeleton } from "@/components/ui/Skeleton";
import type { CalendarCard } from "@/lib/actions";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Card status helper
function getCardStatus(card: CalendarCard): "complete" | "overdue" | "upcoming" | "today" {
    if (card.is_complete) return "complete";
    const dueDate = new Date(card.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today) return "overdue";
    if (dueDate.getTime() === today.getTime()) return "today";
    return "upcoming";
}

// Status colors
const statusStyles = {
    complete: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    overdue: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    today: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    upcoming: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
};

// Card Preview Modal Component
function CardPreviewModal({
    card,
    onClose,
}: {
    card: CalendarCard;
    onClose: () => void;
}) {
    const status = getCardStatus(card);
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header with board color */}
                <div 
                    className="h-2"
                    style={{ backgroundColor: card.board_color || "#6366f1" }}
                />
                
                <div className="p-5">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-4 h-4 text-zinc-500" />
                    </button>

                    {/* Card Title */}
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 pr-8 mb-4">
                        {card.title}
                    </h3>

                    {/* Card Details */}
                    <div className="space-y-3">
                        {/* Board & List */}
                        <div className="flex items-center gap-2 text-sm">
                            <LayoutGrid className="w-4 h-4 text-zinc-400" />
                            <span className="text-zinc-600 dark:text-zinc-400">
                                {card.board_name}
                            </span>
                            <span className="text-zinc-400 dark:text-zinc-600">•</span>
                            <span className="text-zinc-500 dark:text-zinc-500">
                                {card.list_name}
                            </span>
                        </div>

                        {/* Due Date with Status */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${statusStyles[status]}`}>
                            {status === "complete" ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : (
                                <Clock className="w-4 h-4" />
                            )}
                            <span className="font-medium">
                                {new Date(card.due_date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                            {status === "complete" && (
                                <span className="text-xs opacity-75">(Completed)</span>
                            )}
                            {status === "overdue" && (
                                <span className="text-xs opacity-75">(Overdue)</span>
                            )}
                            {status === "today" && (
                                <span className="text-xs opacity-75">(Due Today)</span>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <Link
                            href={`/dashboard/board/${card.board_id}`}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                            onClick={onClose}
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open Board
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Day Cards Modal - shows all cards for a specific day
function DayCardsModal({
    date,
    cards,
    onClose,
    onCardClick,
}: {
    date: Date;
    cards: CalendarCard[];
    onClose: () => void;
    onCardClick: (card: CalendarCard) => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {date.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                        </h3>
                        <p className="text-sm text-zinc-500 mt-0.5">
                            {cards.length} {cards.length === 1 ? "task" : "tasks"} due
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {cards.map((card) => {
                            const status = getCardStatus(card);
                            return (
                                <button
                                    key={card.id}
                                    onClick={() => onCardClick(card)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-md ${statusStyles[status]}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0"
                                            style={{ backgroundColor: card.board_color || "#6366f1" }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {card.title}
                                            </p>
                                            <p className="text-xs opacity-75 mt-1">
                                                {card.board_name} • {card.list_name}
                                            </p>
                                        </div>
                                        {status === "complete" && (
                                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CalendarPage() {
    const { data: cards = [], isLoading } = useCardsWithDueDatesQuery();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCard, setSelectedCard] = useState<CalendarCard | null>(null);
    const [selectedDayCards, setSelectedDayCards] = useState<{ date: Date; cards: CalendarCard[] } | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Group cards by date (YYYY-MM-DD)
    const cardsByDate = useMemo(() => {
        const grouped = new Map<string, CalendarCard[]>();
        cards.forEach((card) => {
            const dateKey = new Date(card.due_date).toISOString().split("T")[0];
            const existing = grouped.get(dateKey) || [];
            existing.push(card);
            grouped.set(dateKey, existing);
        });
        return grouped;
    }, [cards]);

    // Memoize calendar computation
    const { calendarDays } = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        
        const calDays: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) {
            calDays.push(null);
        }
        for (let i = 1; i <= days; i++) {
            calDays.push(i);
        }
        
        return { calendarDays: calDays };
    }, [year, month]);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const today = new Date();
    const isToday = (day: number) =>
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

    // Memoize getCardsForDay helper
    const getCardsForDay = useMemo(() => {
        return (day: number): CalendarCard[] => {
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            return cardsByDate.get(dateKey) || [];
        };
    }, [year, month, cardsByDate]);

    // Handle card click
    const handleCardClick = (card: CalendarCard, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedCard(card);
    };

    // Handle day click (when there are more than 3 cards)
    const handleDayClick = (day: number, dayCards: CalendarCard[]) => {
        if (dayCards.length > 0) {
            const date = new Date(year, month, day);
            setSelectedDayCards({ date, cards: dayCards });
        }
    };

    // Stats for header
    const totalCards = cards.length;
    const overdueCards = cards.filter(c => getCardStatus(c) === "overdue").length;
    const todayCards = cards.filter(c => getCardStatus(c) === "today").length;

    if (isLoading) {
        return <CalendarPageSkeleton />;
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            {/* Page Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                        <div>
                            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                Calendar
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-zinc-500 mt-0.5">
                                {totalCards > 0 ? (
                                    <>
                                        <span>{totalCards} tasks</span>
                                        {todayCards > 0 && (
                                            <span className="text-amber-600 dark:text-amber-400">
                                                {todayCards} due today
                                            </span>
                                        )}
                                        {overdueCards > 0 && (
                                            <span className="text-red-600 dark:text-red-400">
                                                {overdueCards} overdue
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span>No tasks with due dates</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToToday}
                            className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={prevMonth}
                                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-l-lg transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                            </button>
                            <span className="px-4 py-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 min-w-35 text-center">
                                {MONTHS[month]} {year}
                            </span>
                            <button
                                onClick={nextMonth}
                                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-r-lg transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
                        {DAYS.map((day) => (
                            <div
                                key={day}
                                className="py-3 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, index) => {
                            const dayCards = day ? getCardsForDay(day) : [];
                            const hasCards = dayCards.length > 0;
                            
                            return (
                                <div
                                    key={index}
                                    onClick={() => day && dayCards.length > 0 && handleDayClick(day, dayCards)}
                                    className={`
                                        min-h-25 sm:min-h-30 p-2 border-b border-r border-zinc-200 dark:border-zinc-800/50
                                        ${day === null ? "bg-zinc-100/50 dark:bg-zinc-950/50" : ""}
                                        ${index % 7 === 6 ? "border-r-0" : ""}
                                        ${hasCards ? "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors" : ""}
                                    `}
                                >
                                    {day !== null && (
                                        <>
                                            <span
                                                className={`
                                                    inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                                                    ${isToday(day)
                                                        ? "bg-zinc-900 dark:bg-white text-white dark:text-black"
                                                        : "text-zinc-700 dark:text-zinc-300"
                                                    }
                                                `}
                                            >
                                                {day}
                                            </span>
                                            {/* Due Date Cards */}
                                            <div className="mt-1 space-y-1">
                                                {dayCards.slice(0, 3).map((card) => {
                                                    const status = getCardStatus(card);
                                                    return (
                                                        <button
                                                            key={card.id}
                                                            onClick={(e) => handleCardClick(card, e)}
                                                            className={`
                                                                w-full px-1.5 py-0.5 text-xs rounded truncate text-left
                                                                transition-all hover:opacity-80 hover:shadow-sm
                                                                ${status === "complete" 
                                                                    ? "bg-green-500 text-white line-through opacity-75" 
                                                                    : status === "overdue"
                                                                        ? "bg-red-500 text-white"
                                                                        : status === "today"
                                                                            ? "bg-amber-500 text-white"
                                                                            : "text-white"
                                                                }
                                                            `}
                                                            style={
                                                                status === "upcoming" 
                                                                    ? { backgroundColor: card.board_color || "#6366f1" }
                                                                    : undefined
                                                            }
                                                            title={`${card.title} (${card.board_name})`}
                                                        >
                                                            {card.title}
                                                        </button>
                                                    );
                                                })}
                                                {dayCards.length > 3 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDayClick(day, dayCards);
                                                        }}
                                                        className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 pl-1.5 font-medium"
                                                    >
                                                        +{dayCards.length - 3} more
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-green-500" />
                        <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-red-500" />
                        <span>Overdue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-amber-500" />
                        <span>Due Today</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-indigo-500" />
                        <span>Upcoming</span>
                    </div>
                </div>
            </div>

            {/* Card Preview Modal */}
            {selectedCard && (
                <CardPreviewModal
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                />
            )}

            {/* Day Cards Modal */}
            {selectedDayCards && (
                <DayCardsModal
                    date={selectedDayCards.date}
                    cards={selectedDayCards.cards}
                    onClose={() => setSelectedDayCards(null)}
                    onCardClick={(card) => {
                        setSelectedDayCards(null);
                        setSelectedCard(card);
                    }}
                />
            )}
        </div>
    );
}
