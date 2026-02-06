import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-200">
            {/* Page Header Skeleton */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div>
                    <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse mt-2" />
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-8">
                    {/* Workspaces Grid Skeleton */}
                    <section>
                        <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-4" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                                        <div className="flex-1">
                                            <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                        </div>
                                    </div>
                                    <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded mt-2" />
                                    <div className="h-3 w-2/3 bg-zinc-100 dark:bg-zinc-900 rounded mt-2" />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Stats Skeleton */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/50">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-xl animate-pulse"
                            >
                                <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
                                <div className="h-8 w-12 bg-zinc-300 dark:bg-zinc-700 rounded" />
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
}
