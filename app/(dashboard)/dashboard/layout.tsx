"use client";

import React, { Suspense } from "react";
import DashboardNav from "@/components/dashboard-components/DashboardNav";
import Sidebar from "@/components/dashboard-components/Sidebar";
import { WorkspaceProvider } from "@/lib/context/WorkspaceContext";
import { DashboardPageSkeleton } from "@/components/ui/Skeleton";

// Skeleton for the sidebar during loading
function SidebarSkeleton() {
    return (
        <div className="hidden md:flex md:w-64 h-full bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 flex-col">
            {/* Header skeleton */}
            <div className="h-14 border-b border-zinc-200 dark:border-zinc-800/80 px-4 flex items-center">
                <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="p-3 space-y-4 flex-1">
                {/* Nav items skeleton */}
                <div className="space-y-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                    ))}
                </div>
                {/* Workspaces section skeleton */}
                <div className="pt-4 mt-2">
                    <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-3 mx-3" />
                    <div className="space-y-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-9 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
            {/* Bottom skeleton */}
            <div className="border-t border-zinc-200 dark:border-zinc-800/80 p-3 space-y-1">
                <div className="h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                <div className="h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <WorkspaceProvider>
            <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
                {/* Top Navigation - Sticky */}
                <DashboardNav />

                {/* Main Content Area */}
                <div className="flex h-[calc(100vh-56px)]">
                    {/* Sidebar - wrapped in Suspense */}
                    <Suspense fallback={<SidebarSkeleton />}>
                        <Sidebar />
                    </Suspense>

                    {/* Content Area - Flexible, wrapped in Suspense */}
                    <main className="flex-1 overflow-hidden transition-all duration-300">
                        <Suspense fallback={<DashboardPageSkeleton />}>
                            {children}
                        </Suspense>
                    </main>
                </div>
            </div>
        </WorkspaceProvider>
    );
}

