"use client";

import React from "react";
import DashboardNav from "@/components/dashboard-components/DashboardNav";
import Sidebar from "@/components/dashboard-components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
            {/* Top Navigation - Sticky */}
            <DashboardNav />

            {/* Main Content Area */}
            <div className="flex h-[calc(100vh-56px)]">
                {/* Sidebar - manages its own state */}
                <Sidebar />

                {/* Content Area - Flexible */}
                <main className="flex-1 overflow-hidden transition-all duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
}
