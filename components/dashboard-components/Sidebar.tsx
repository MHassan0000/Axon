"use client";

import React, { useState } from "react";
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
import { usePathname } from "next/navigation";
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

    // Check if path matches or starts with href (for nested routes)
    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-16 left-4 z-40 p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 shadow-lg"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:relative z-50 lg:z-auto
                    flex flex-col bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80
                    h-full transition-all duration-300 ease-out
                    ${isCollapsed ? "lg:w-18" : "lg:w-64"}
                    ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                </button>

                {/* Desktop Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`
                        hidden lg:flex items-center justify-center
                        absolute -right-3 top-6 z-10
                        w-6 h-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md
                        hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600
                        transition-all duration-200 group
                        shadow-md
                    `}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <PanelLeft className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
                    ) : (
                        <PanelLeftClose className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
                    )}
                </button>

                {/* Sidebar Header */}
                <div className={`flex items-center h-14 border-b border-zinc-200 dark:border-zinc-800/80 px-4 ${isCollapsed ? "justify-center" : ""}`}>
                    {!isCollapsed && (
                        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                            Axon
                        </span>
                    )}
                    {isCollapsed && (
                        <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">A</span>
                        </div>
                    )}
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
                                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Workspaces
                                </span>
                                <Link
                                    href="/dashboard"
                                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                                    title="Add workspace"
                                >
                                    <Plus className="w-3.5 h-3.5 text-zinc-400" />
                                </Link>
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
                                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200"
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
                                <p className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500">
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
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200"
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
