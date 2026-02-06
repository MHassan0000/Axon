"use client";

import React, { useState } from "react";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
} from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and total days
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Generate calendar days
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const today = new Date();
    const isToday = (day: number) =>
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

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
                            <p className="text-sm text-zinc-500">
                                View tasks and due dates
                            </p>
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
                        {calendarDays.map((day, index) => (
                            <div
                                key={index}
                                className={`
                                    min-h-25 sm:min-h-30 p-2 border-b border-r border-zinc-200 dark:border-zinc-800/50
                                    ${day === null ? "bg-zinc-100/50 dark:bg-zinc-950/50" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"}
                                    ${index % 7 === 6 ? "border-r-0" : ""}
                                    transition-colors cursor-pointer
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
                                        {/* Placeholder for due date cards */}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-zinc-500" />
                        <div>
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Due Date Integration Coming Soon
                            </p>
                            <p className="text-xs text-zinc-500">
                                Cards with due dates will appear on the calendar automatically
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
