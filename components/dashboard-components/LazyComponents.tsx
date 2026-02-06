"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Loading fallback component
const ModalLoadingFallback = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
        </div>
    </div>
);

// Lazy load CardModal - heavy component with checklists, comments, etc.
export const LazyCardModal = dynamic(
    () => import("./CardModal").then((mod) => ({ default: mod.CardModal })),
    {
        loading: () => <ModalLoadingFallback />,
        ssr: false, // Don't render on server - modal is client-side only
    }
);

// Lazy load BoardSettingsModal
export const LazyBoardSettingsModal = dynamic(
    () => import("./BoardSettingsModal").then((mod) => ({ default: mod.BoardSettingsModal })),
    {
        loading: () => <ModalLoadingFallback />,
        ssr: false,
    }
);

// Lazy load WorkspaceSettingsModal
export const LazyWorkspaceSettingsModal = dynamic(
    () => import("./WorkspaceSettingsModal").then((mod) => ({ default: mod.WorkspaceSettingsModal })),
    {
        loading: () => <ModalLoadingFallback />,
        ssr: false,
    }
);

// Lazy load GlobalSearch - heavy component with search functionality
export const LazyGlobalSearch = dynamic(
    () => import("./GlobalSearch").then((mod) => ({ default: mod.GlobalSearch })),
    {
        loading: () => null,
        ssr: false,
    }
);

// Lazy load the drag and drop context - heavy library
export const LazyDragDropContext = dynamic(
    () => import("@hello-pangea/dnd").then((mod) => mod.DragDropContext),
    {
        ssr: false,
    }
);
