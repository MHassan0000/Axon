"use client";

import React, { useState } from "react";
import {
    LayoutDashboard,
    Settings,
    Users,
    FolderKanban,
    BarChart3,
    Calendar,
    MessageSquare,
    HelpCircle,
    Menu,
    X,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/*
  Professional Sidebar Component
  - Animated toggle button (not bland chevron)
  - Smooth transitions
  - Mobile responsive with overlay
  - Black and white theme
  - Ready for backend integration
*/

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
    { icon: <MessageSquare className="w-5 h-5" />, label: "Messages", href: "/dashboard/messages" },
];

const bottomNavItems: NavItem[] = [
    { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/dashboard/settings" },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Help", href: "/dashboard/help" },
];

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-16 left-4 z-40 p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all duration-200 shadow-lg"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5 text-zinc-300" />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:relative z-50 lg:z-auto
                    flex flex-col bg-zinc-950 border-r border-zinc-800/80
                    h-full transition-all duration-300 ease-out
                    ${isCollapsed ? "lg:w-18" : "lg:w-64"}
                    ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5 text-zinc-400" />
                </button>

                {/* Desktop Toggle Button - Professional Animated Icon */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`
                        hidden lg:flex items-center justify-center
                        absolute -right-3 top-6 z-10
                        w-6 h-6 bg-zinc-900 border border-zinc-700 rounded-md
                        hover:bg-zinc-800 hover:border-zinc-600
                        transition-all duration-200 group
                        shadow-md
                    `}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <PanelLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    ) : (
                        <PanelLeftClose className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    )}
                </button>

                {/* Sidebar Header */}
                <div className={`flex items-center h-14 border-b border-zinc-800/80 px-4 ${isCollapsed ? "justify-center" : ""}`}>
                    {!isCollapsed && (
                        <span className="text-lg font-semibold text-zinc-100 tracking-tight">
                            Workspace
                        </span>
                    )}
                    {isCollapsed && (
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <span className="text-sm font-bold text-zinc-300">A</span>
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
                                isActive={pathname === item.href}
                                onMobileClick={() => setIsMobileOpen(false)}
                            />
                        ))}
                    </nav>
                </div>

                {/* Bottom Navigation */}
                <div className="border-t border-zinc-800/80 p-3 space-y-1">
                    {bottomNavItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            icon={item.icon}
                            label={item.label}
                            href={item.href}
                            isCollapsed={isCollapsed}
                            isActive={pathname === item.href}
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
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
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
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
            )}
        </Link>
    );
}
