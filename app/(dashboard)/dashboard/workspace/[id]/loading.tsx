export default function WorkspaceLoading() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-200">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div>
                        <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                        <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse mt-2" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                    <div className="h-9 w-9 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 overflow-auto p-6">
                <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-28 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
