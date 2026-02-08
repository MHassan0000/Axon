"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
    LayoutDashboard,
    Settings,
    Users,
    FolderKanban,
    BarChart3,
    Calendar,
    Activity,
    HelpCircle,
    Menu,
    X,
    PanelLeftClose,
    PanelLeft,
    Plus,
    LayoutGrid,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaces } from "@/lib/context/WorkspaceContext";

interface NavItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

const mainNavItems: NavItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", href: "/dashboard" },
    { icon: <FolderKanban className="w-5 h-5" />, label: "Projects", href: "/dashboard/projects" },
    { icon: <BarChart3 className="w-5 h-5" />, label: "Analytics", href: "/dashboard/analytics" },
    { icon: <Calendar className="w-5 h-5" />, label: "Calendar", href: "/dashboard/calendar" },
    { icon: <Users className="w-5 h-5" />, label: "Team", href: "/dashboard/team" },
    { icon: <Activity className="w-5 h-5" />, label: "Activity", href: "/dashboard/activity" },
];

const bottomNavItems: NavItem[] = [
    { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/dashboard/settings" },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Help", href: "/dashboard/help" },
];

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { workspaces, loading: loadingWorkspaces } = useWorkspaces();
    const pathname = usePathname();
    const router = useRouter();

    // Memoize workspace IDs to prevent useEffect from re-running when workspace objects change
    // but IDs stay the same
    const workspaceIds = useMemo(
        () => workspaces.slice(0, 5).map((w) => w.id),
        [workspaces]
    );

    // Prefetch common routes on mount for faster navigation
    // Only re-run when workspace IDs actually change, not on every render
    useEffect(() => {
        // Prefetch main navigation routes
        mainNavItems.forEach((item) => {
            router.prefetch(item.href);
        });

        // Prefetch workspace routes
        workspaceIds.forEach((id) => {
            router.prefetch(`/dashboard/workspace/${id}`);
        });
    }, [router, workspaceIds]);

    // Check if path matches or starts with href (for nested routes)
    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile Menu Button - positioned in navbar area */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden fixed top-2 left-4 z-60 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 shadow-sm"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:relative z-50 md:z-auto
                    flex flex-col bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80
                    h-full transition-all duration-300 ease-out
                    ${isCollapsed ? "md:w-18" : "md:w-64"}
                    ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"}
                `}
            >
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                </button>

                {/* Sidebar Header */}
                <div className={`flex items-center h-14 border-b border-zinc-200 dark:border-zinc-800/80 px-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
                    {!isCollapsed && (
                        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                            Axon
                        </span>
                    )}
                    {/* Desktop Toggle Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`
                            hidden md:flex items-center justify-center
                            w-8 h-8 rounded-lg
                            hover:bg-zinc-200 dark:hover:bg-zinc-800
                            transition-all duration-200 group
                        `}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <PanelLeft className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
                        ) : (
                            <PanelLeftClose className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
                        )}
                    </button>
                </div>

                {/* Main Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-3">
                    <nav className="space-y-1">
                        {mainNavItems.map((item) => (
                            <SidebarItem
                                key={item.href}
                                icon={item.icon}
                                label={item.label}
                                href={item.href}
                                isCollapsed={isCollapsed}
                                isActive={isActive(item.href)}
                                onMobileClick={() => setIsMobileOpen(false)}
                            />
                        ))}
                    </nav>

                    {/* Workspaces Section */}
                    {!isCollapsed && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between px-3 mb-2">
                                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider">
                                    Workspaces
                                </span>

                            </div>

                            {loadingWorkspaces ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                                </div>
                            ) : workspaces.length > 0 ? (
                                <nav className="space-y-1">
                                    {workspaces.slice(0, 5).map((workspace) => (
                                        <Link
                                            key={workspace.id}
                                            href={`/dashboard/workspace/${workspace.id}`}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`
                                                group flex items-center gap-3 w-full px-3 py-2 rounded-lg
                                                transition-all duration-200
                                                ${pathname.includes(workspace.id)
                                                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                                    : "text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200"
                                                }
                                            `}
                                        >
                                            <div className="w-6 h-6 rounded bg-linear-to-br from-zinc-600 to-zinc-800 dark:from-zinc-500 dark:to-zinc-700 flex items-center justify-center shrink-0">
                                                <LayoutGrid className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <span className="text-sm font-medium truncate">
                                                {workspace.name}
                                            </span>
                                        </Link>
                                    ))}
                                </nav>
                            ) : (
                                <p className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-500">
                                    No workspaces yet
                                </p>
                            )}
                        </div>
                    )}

                    {/* Collapsed workspace icons */}
                    {isCollapsed && workspaces.length > 0 && (
                        <div className="mt-6 space-y-2">
                            {workspaces.slice(0, 3).map((workspace) => (
                                <Link
                                    key={workspace.id}
                                    href={`/dashboard/workspace/${workspace.id}`}
                                    className={`
                                        flex items-center justify-center p-2 rounded-lg
                                        transition-all duration-200
                                        ${pathname.includes(workspace.id)
                                            ? "bg-zinc-200 dark:bg-zinc-800"
                                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                                        }
                                    `}
                                    title={workspace.name}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-zinc-600 to-zinc-800 dark:from-zinc-500 dark:to-zinc-700 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">
                                            {workspace.name[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <div className="border-t border-zinc-200 dark:border-zinc-800/80 p-3 space-y-1">
                    {bottomNavItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            icon={item.icon}
                            label={item.label}
                            href={item.href}
                            isCollapsed={isCollapsed}
                            isActive={isActive(item.href)}
                            onMobileClick={() => setIsMobileOpen(false)}
                        />
                    ))}
                </div>
            </aside>
        </>
    );
}

/* Sidebar Navigation Item */
function SidebarItem({
    icon,
    label,
    href,
    isCollapsed,
    isActive = false,
    onMobileClick,
}: {
    icon: React.ReactNode;
    label: string;
    href: string;
    isCollapsed: boolean;
    isActive?: boolean;
    onMobileClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onMobileClick}
            className={`
                group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                transition-all duration-200
                ${isCollapsed ? "justify-center" : ""}
                ${isActive
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200"
                }
            `}
            title={isCollapsed ? label : undefined}
        >
            <span className={`shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                {icon}
            </span>
            {!isCollapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
            )}
            {/* Active indicator */}
            {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white" />
            )}
        </Link>
    );
}
