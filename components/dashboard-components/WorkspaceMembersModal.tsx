"use client";

import React, { useState, useEffect } from "react";
import {
    X,
    Users,
    Loader2,
    Plus,
    UserMinus,
    Mail,
    Crown,
    Clock,
    LogOut,
    Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    getWorkspaceMembers,
    removeWorkspaceMember,
    sendWorkspaceInvite,
    searchUsers,
    getWorkspacePendingInvites,
    cancelWorkspaceInvite,
    leaveWorkspace,
    getUserWorkspaceRole,
} from "@/lib/actions";
import { useInvalidateTeamMembers, useInvalidateOnMembershipChange } from "@/lib/hooks/useDashboard";
import { useWorkspaces } from "@/lib/context/WorkspaceContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Workspace } from "@/lib/types/database";

/* =====================================================
   Types
   ===================================================== */

interface WorkspaceMembersModalProps {
    workspace: Workspace;
    onClose: () => void;
    onMembersChange?: () => void;
}

type WorkspaceMember = {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
    role: string;
};

type PendingInvite = {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    created_at: string;
};

/* =====================================================
   Main Component
   ===================================================== */

export function WorkspaceMembersModal({
    workspace,
    onClose,
    onMembersChange,
}: WorkspaceMembersModalProps) {
    const router = useRouter();
    const invalidateTeamMembers = useInvalidateTeamMembers();
    const invalidateOnMembershipChange = useInvalidateOnMembershipChange();
    const { removeWorkspace } = useWorkspaces();
    
    // Current user role
    const [currentUserRole, setCurrentUserRole] = useState<"owner" | "admin" | "member" | null>(null);
    
    // Members state
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    
    // Pending invites state
    const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
    const [loadingInvites, setLoadingInvites] = useState(true);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [sendingInvite, setSendingInvite] = useState(false);

    // Confirmation dialogs
    const [removeMemberConfirm, setRemoveMemberConfirm] = useState<{
        isOpen: boolean;
        userId: string | null;
        userName: string | null;
    }>({ isOpen: false, userId: null, userName: null });
    
    const [leaveConfirm, setLeaveConfirm] = useState(false);
    const [leaving, setLeaving] = useState(false);
    
    const [cancelInviteConfirm, setCancelInviteConfirm] = useState<{
        isOpen: boolean;
        inviteId: string | null;
        userEmail: string | null;
    }>({ isOpen: false, inviteId: null, userEmail: null });

    // Check if current user can manage members (owner or admin)
    const canManageMembers = currentUserRole === "owner" || currentUserRole === "admin";
    const isOwner = currentUserRole === "owner";

    // Load user role
    useEffect(() => {
        async function loadRole() {
            const role = await getUserWorkspaceRole(workspace.id);
            setCurrentUserRole(role);
        }
        loadRole();
    }, [workspace.id]);

    // Load members on mount
    useEffect(() => {
        async function loadMembers() {
            try {
                const m = await getWorkspaceMembers(workspace.id);
                setMembers(m);
            } catch {
                toast.error("Failed to load members");
            } finally {
                setLoadingMembers(false);
            }
        }
        loadMembers();
    }, [workspace.id]);

    // Load pending invites on mount
    useEffect(() => {
        async function loadInvites() {
            if (!canManageMembers) {
                setLoadingInvites(false);
                return;
            }
            try {
                const invites = await getWorkspacePendingInvites(workspace.id);
                setPendingInvites(invites);
            } catch {
                // Silently fail
            } finally {
                setLoadingInvites(false);
            }
        }
        if (currentUserRole !== null) {
            loadInvites();
        }
    }, [workspace.id, canManageMembers, currentUserRole]);

    // Search users when query changes
    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            setSearching(true);
            try {
                const results = await searchUsers(searchQuery);
                const memberIds = new Set(members.map((m) => m.id));
                const invitedEmails = new Set(pendingInvites.map((i) => i.email.toLowerCase()));
                setSearchResults(
                    results.filter(
                        (u: any) => !memberIds.has(u.id) && !invitedEmails.has(u.email.toLowerCase())
                    )
                );
            } catch {
                // Silently fail on search errors
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery, members, pendingInvites]);

    // Send invite to a user
    const handleSendInvite = async (userId: string, userEmail: string, userName: string | null) => {
        setSendingInvite(true);
        try {
            const result = await sendWorkspaceInvite(workspace.id, userEmail);
            if (result.success) {
                // Refresh pending invites
                const invites = await getWorkspacePendingInvites(workspace.id);
                setPendingInvites(invites);
                setSearchQuery("");
                setSearchResults([]);
                toast.success(`Invitation sent to ${userName || userEmail}`);
                invalidateTeamMembers();
                onMembersChange?.();
            } else {
                toast.error(result.error || "Failed to send invite");
            }
        } catch {
            toast.error("Failed to send invite");
        } finally {
            setSendingInvite(false);
        }
    };

    // Invite by email (when no search results found)
    const handleInviteByEmail = async () => {
        const email = searchQuery.trim().toLowerCase();
        if (!email) return;

        setSendingInvite(true);
        try {
            const result = await sendWorkspaceInvite(workspace.id, email);
            if (result.success) {
                const invites = await getWorkspacePendingInvites(workspace.id);
                setPendingInvites(invites);
                setSearchQuery("");
                setSearchResults([]);
                toast.success(`Invitation sent to ${email}`);
                invalidateTeamMembers();
                onMembersChange?.();
            } else {
                toast.error(result.error || "Failed to send invite");
            }
        } catch {
            toast.error("Failed to send invite");
        } finally {
            setSendingInvite(false);
        }
    };

    // Check if search query looks like an email
    const isEmailQuery = searchQuery.includes("@") && searchQuery.includes(".");

    // Remove member - show confirmation dialog
    const handleRemoveMember = (userId: string, userName: string | null) => {
        setRemoveMemberConfirm({ isOpen: true, userId, userName });
    };

    // Confirmed remove member
    const confirmRemoveMember = async () => {
        if (!removeMemberConfirm.userId) return;

        const userId = removeMemberConfirm.userId;
        setRemoveMemberConfirm({ isOpen: false, userId: null, userName: null });

        try {
            await removeWorkspaceMember(workspace.id, userId);
            setMembers(members.filter((m) => m.id !== userId));
            toast.success("Member removed");
            invalidateOnMembershipChange();
            onMembersChange?.();
        } catch {
            toast.error("Failed to remove member");
        }
    };

    // Cancel invite - show confirmation dialog
    const handleCancelInvite = (inviteId: string, userEmail: string) => {
        setCancelInviteConfirm({ isOpen: true, inviteId, userEmail });
    };

    // Confirmed cancel invite
    const confirmCancelInvite = async () => {
        if (!cancelInviteConfirm.inviteId) return;

        const inviteId = cancelInviteConfirm.inviteId;
        setCancelInviteConfirm({ isOpen: false, inviteId: null, userEmail: null });

        try {
            const result = await cancelWorkspaceInvite(inviteId);
            if (result.success) {
                setPendingInvites(pendingInvites.filter((i) => i.id !== inviteId));
                toast.success("Invite cancelled");
            } else {
                toast.error(result.error || "Failed to cancel invite");
            }
        } catch {
            toast.error("Failed to cancel invite");
        }
    };

    // Leave workspace
    const handleLeaveWorkspace = async () => {
        setLeaving(true);
        try {
            const result = await leaveWorkspace(workspace.id);
            if (result.success) {
                // Update WorkspaceContext immediately (for sidebar)
                removeWorkspace(workspace.id);
                // Invalidate all related caches
                invalidateOnMembershipChange();
                toast.success("You have left the workspace");
                onClose();
                router.push("/dashboard");
            } else {
                toast.error(result.error || "Failed to leave workspace");
            }
        } catch {
            toast.error("Failed to leave workspace");
        } finally {
            setLeaving(false);
            setLeaveConfirm(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-zinc-500" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            Workspace Members
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                    {/* Invite Member Section - Only for owners/admins */}
                    {canManageMembers && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Invite Member
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                    placeholder="Search by email or name..."
                                />
                                {searching && (
                                    <Loader2 className="absolute right-3 top-3.5 w-4 h-4 text-zinc-400 animate-spin" />
                                )}

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                        {searchResults.map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleSendInvite(user.id, user.email, user.name)}
                                                disabled={sendingInvite}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center text-sm font-medium overflow-hidden">
                                                    {user.avatar_url ? (
                                                        <img
                                                            src={user.avatar_url}
                                                            alt={user.name || ""}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        user.name?.[0]?.toUpperCase() || "?"
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                        {user.name || "Unknown"}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <Mail className="w-4 h-4 text-zinc-400" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Invite by Email - show when email is entered but no results found */}
                                {isEmailQuery && searchResults.length === 0 && !searching && searchQuery.trim().length >= 3 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-10">
                                        <button
                                            onClick={handleInviteByEmail}
                                            disabled={sendingInvite}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    Send invite to
                                                </p>
                                                <p className="text-xs text-zinc-500 truncate">
                                                    {searchQuery.trim()}
                                                </p>
                                            </div>
                                            {sendingInvite ? (
                                                <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                                            ) : (
                                                <Plus className="w-4 h-4 text-blue-500" />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">
                                Invitations must be accepted by the user before they join the workspace.
                            </p>
                        </div>
                    )}

                    {/* Pending Invites Section */}
                    {canManageMembers && pendingInvites.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Pending Invites ({pendingInvites.length})
                            </h3>
                            <div className="space-y-2">
                                {pendingInvites.map((invite) => (
                                    <div
                                        key={invite.id}
                                        className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center text-sm font-medium overflow-hidden">
                                            {invite.avatar_url ? (
                                                <img
                                                    src={invite.avatar_url}
                                                    alt={invite.name || ""}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                invite.name?.[0]?.toUpperCase() || "?"
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                {invite.name || "Unknown"}
                                            </p>
                                            <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {invite.email}
                                            </p>
                                        </div>
                                        <span className="text-xs text-amber-600 dark:text-amber-400 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                                            Pending
                                        </span>
                                        <button
                                            onClick={() => handleCancelInvite(invite.id, invite.email)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Cancel invite"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Members List */}
                    <div>
                        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                            Current Members ({members.length})
                        </h3>
                        {loadingMembers ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
                            </div>
                        ) : members.length === 0 ? (
                            <p className="text-sm text-zinc-500 text-center py-8">
                                No members in this workspace
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center text-sm font-medium overflow-hidden">
                                            {member.avatar_url ? (
                                                <img
                                                    src={member.avatar_url}
                                                    alt={member.name || ""}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                member.name?.[0]?.toUpperCase() || "?"
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                    {member.name || "Unknown"}
                                                </p>
                                                {member.role === "owner" && (
                                                    <span title="Owner">
                                                        <Crown className="w-4 h-4 text-yellow-500" />
                                                    </span>
                                                )}
                                                {member.role === "admin" && (
                                                    <span title="Admin">
                                                        <Shield className="w-4 h-4 text-blue-500" />
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {member.email}
                                            </p>
                                        </div>
                                        <span className="text-xs text-zinc-400 capitalize px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded">
                                            {member.role}
                                        </span>
                                        {canManageMembers && member.role !== "owner" && (
                                            <button
                                                onClick={() => handleRemoveMember(member.id, member.name)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Remove member"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Leave Workspace Button - Only for non-owners */}
                    {!isOwner && currentUserRole !== null && (
                        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={() => setLeaveConfirm(true)}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                Leave Workspace
                            </button>
                            <p className="text-xs text-zinc-500 mt-2">
                                You will lose access to all boards in this workspace.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Remove Member Confirmation Dialog */}
            <ConfirmDialog
                isOpen={removeMemberConfirm.isOpen}
                onClose={() => setRemoveMemberConfirm({ isOpen: false, userId: null, userName: null })}
                onConfirm={confirmRemoveMember}
                title="Remove Member"
                message={`Are you sure you want to remove ${removeMemberConfirm.userName || "this member"} from the workspace?`}
                confirmText="Remove"
                cancelText="Cancel"
                variant="danger"
                icon="user-remove"
            />

            {/* Cancel Invite Confirmation Dialog */}
            <ConfirmDialog
                isOpen={cancelInviteConfirm.isOpen}
                onClose={() => setCancelInviteConfirm({ isOpen: false, inviteId: null, userEmail: null })}
                onConfirm={confirmCancelInvite}
                title="Cancel Invitation"
                message={`Are you sure you want to cancel the invitation to ${cancelInviteConfirm.userEmail || "this user"}?`}
                confirmText="Cancel Invite"
                cancelText="Keep"
                variant="danger"
            />

            {/* Leave Workspace Confirmation Dialog */}
            <ConfirmDialog
                isOpen={leaveConfirm}
                onClose={() => setLeaveConfirm(false)}
                onConfirm={handleLeaveWorkspace}
                title="Leave Workspace"
                message={`Are you sure you want to leave "${workspace.name}"? You will lose access to all boards and data in this workspace.`}
                confirmText="Leave Workspace"
                cancelText="Stay"
                variant="danger"
                icon="logout"
                isLoading={leaving}
            />
        </div>
    );
}
