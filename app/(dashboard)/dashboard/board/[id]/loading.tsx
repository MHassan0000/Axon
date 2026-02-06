export default function BoardLoading() {
    return (
        <div className="flex flex-col h-full bg-zinc-900 transition-colors duration-200">
            {/* Board Header Skeleton */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/10 animate-pulse" />
                    <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-20 bg-white/10 rounded-lg animate-pulse" />
                    <div className="w-9 h-9 bg-white/10 rounded-lg animate-pulse" />
                </div>
            </div>

            {/* Kanban Board Skeleton */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
                <div className="flex gap-4 h-full items-start">
                    {[...Array(4)].map((_, listIndex) => (
                        <div
                            key={listIndex}
                            className="shrink-0 w-72 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
                        >
                            {/* List Header */}
                            <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                                    <div className="h-5 w-24 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                                </div>
                                <div className="w-4 h-4 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                            </div>

                            {/* Cards */}
                            <div className="p-2 space-y-2">
                                {[...Array(3)].map((_, cardIndex) => (
                                    <div
                                        key={cardIndex}
                                        className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 animate-pulse"
                                    >
                                        <div className="flex gap-1 mb-2">
                                            <div className="h-4 w-12 bg-blue-200 dark:bg-blue-900/50 rounded" />
                                            <div className="h-4 w-16 bg-green-200 dark:bg-green-900/50 rounded" />
                                        </div>
                                        <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-700 rounded" />
                                        <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-700 rounded mt-2" />
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                            <div className="h-3 w-8 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Card Button */}
                            <div className="px-3 py-2">
                                <div className="h-8 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}

                    {/* Add List Button */}
                    <div className="shrink-0 w-72 h-12 bg-white/10 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    );
}
