"use client";

import React, { Suspense } from "react";
import DashboardNav from "@/components/dashboard-components/DashboardNav";
import Sidebar from "@/components/dashboard-components/Sidebar";
import { WorkspaceProvider } from "@/lib/context/WorkspaceContext";
import { DashboardPageSkeleton } from "@/components/ui/Skeleton";

// Skeleton for the sidebar during loading
function SidebarSkeleton() {
    return (
        <div className="hidden md:block w-64 h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80">
            <div className="p-4 space-y-4">
                {/* Workspace selector skeleton */}
                <div className="h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                {/* Nav items skeleton */}
                <div className="space-y-2 pt-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-9 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                    ))}
                </div>
                {/* Workspaces section skeleton */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse mb-3" />
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
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

