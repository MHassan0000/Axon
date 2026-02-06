"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
    Mail,
    Crown,
    Shield,
    User,
    Loader2,
    LayoutGrid,
} from "lucide-react";
import { useWorkspaces } from "@/lib/context/WorkspaceContext";
import { getWorkspaceMembers } from "@/lib/actions";
import type { Workspace } from "@/lib/types/database";

interface MemberWithWorkspace {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
    role: string;
    workspaceId: string;
    workspaceName: string;
}

export default function TeamPage() {
    const { workspaces, loading: loadingWorkspaces } = useWorkspaces();
    const [members, setMembers] = useState<MemberWithWorkspace[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMembers() {
            if (loadingWorkspaces) return;

            try {
                const allMembers: MemberWithWorkspace[] = [];

                for (const ws of workspaces) {
                    const wsMembers = await getWorkspaceMembers(ws.id);
                    wsMembers.forEach((m) => {
                        allMembers.push({
                            ...m,
                            workspaceId: ws.id,
                            workspaceName: ws.name,
                        });
                    });
                }

                setMembers(allMembers);
            } catch (error) {
                console.error("Error fetching members:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchMembers();
    }, [workspaces, loadingWorkspaces]);

    // Group members by workspace
    const membersByWorkspace = workspaces.map((ws) => ({
        workspace: ws,
        members: members.filter((m) => m.workspaceId === ws.id),
    }));

    // Get unique members (by id)
    const uniqueMembers = Array.from(
        new Map(members.map((m) => [m.id, m])).values()
    );

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "owner":
                return <Crown className="w-4 h-4 text-amber-500" />;
            case "admin":
                return <Shield className="w-4 h-4 text-blue-500" />;
            default:
                return <User className="w-4 h-4 text-zinc-400" />;
        }
    };

    if (loading || loadingWorkspaces) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-black">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            {/* Page Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            Team
                        </h1>
                        <p className="text-sm text-zinc-500">
                            {uniqueMembers.length} member{uniqueMembers.length !== 1 ? "s" : ""} across {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                {membersByWorkspace.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-75">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                            No team members yet
                        </h2>
                        <p className="text-sm text-zinc-500 text-center max-w-sm">
                            Create a workspace and invite team members to collaborate
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {membersByWorkspace.map(({ workspace, members }) => (
                            <section key={workspace.id}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded bg-linear-to-br from-zinc-600 to-zinc-800 flex items-center justify-center">
                                        <LayoutGrid className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        {workspace.name}
                                    </h2>
                                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                        ({members.length})
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {members.map((member) => (
                                        <div
                                            key={`${workspace.id}-${member.id}`}
                                            className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                                        >
                                            {/* Avatar */}
                                            <div className="relative">
                                                {member.avatar_url ? (
                                                    <img
                                                        src={member.avatar_url}
                                                        alt={member.name || "User"}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-zinc-400 to-zinc-600 flex items-center justify-center">
                                                        <span className="text-lg font-bold text-white">
                                                            {(member.name || member.email)[0]?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                                    {getRoleIcon(member.role)}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                    {member.name || "Unnamed"}
                                                </p>
                                                <p className="text-sm text-zinc-500 truncate flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
