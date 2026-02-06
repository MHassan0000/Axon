"use client";

import React, { useState, useEffect } from "react";
import {
    X,
    Settings,
    Trash2,
    Edit3,
    Users,
    Loader2,
    AlertTriangle,
    Plus,
    UserMinus,
    Mail,
    Crown,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    updateWorkspace,
    deleteWorkspace,
    getWorkspaceMembers,
    removeWorkspaceMember,
    addWorkspaceMember,
    searchUsers,
} from "@/lib/actions";
import { workspaceNameSchema, workspaceDescriptionSchema } from "@/lib/validations";
import type { Workspace } from "@/lib/types/database";

/* =====================================================
   Types
   ===================================================== */

interface WorkspaceSettingsModalProps {
    workspace: Workspace;
    onClose: () => void;
    onUpdate: (workspace: Partial<Workspace>) => void;
}

type WorkspaceMember = {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
    role: string;
};

type Tab = "general" | "members" | "danger";

/* =====================================================
   Main Component
   ===================================================== */

export function WorkspaceSettingsModal({
    workspace,
    onClose,
    onUpdate,
}: WorkspaceSettingsModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("general");

    // General settings state
    const [name, setName] = useState(workspace.name);
    const [description, setDescription] = useState(workspace.description || "");
    const [saving, setSaving] = useState(false);

    // Members state
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [addingMember, setAddingMember] = useState(false);

    // Delete state
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleting, setDeleting] = useState(false);

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
                setSearchResults(results.filter((u: any) => !memberIds.has(u.id)));
            } catch {
                // Silently fail on search errors
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery, members]);

    // Save general settings
    const handleSaveGeneral = async () => {
        const nameValidation = workspaceNameSchema.safeParse(name);
        if (!nameValidation.success) {
            toast.error(nameValidation.error.issues[0]?.message || "Invalid workspace name");
            return;
        }

        const descValidation = workspaceDescriptionSchema.safeParse(description);
        if (!descValidation.success) {
            toast.error(descValidation.error.issues[0]?.message || "Invalid description");
            return;
        }

        setSaving(true);
        try {
            await updateWorkspace(workspace.id, { name: nameValidation.data, description });
            onUpdate({ name: nameValidation.data, description });
            toast.success("Workspace updated");
        } catch {
            toast.error("Failed to update workspace");
        } finally {
            setSaving(false);
        }
    };

    // Add member
    const handleAddMember = async (userId: string, userEmail: string) => {
        setAddingMember(true);
        try {
            await addWorkspaceMember(workspace.id, userId);
            const m = await getWorkspaceMembers(workspace.id);
            setMembers(m);
            setSearchQuery("");
            setSearchResults([]);
            toast.success(`Added ${userEmail} to workspace`);
        } catch {
            toast.error("Failed to add member");
        } finally {
            setAddingMember(false);
        }
    };

    // Remove member
    const handleRemoveMember = async (userId: string, userName: string | null) => {
        if (!window.confirm(`Remove ${userName || "this member"} from the workspace?`)) {
            return;
        }

        try {
            await removeWorkspaceMember(workspace.id, userId);
            setMembers(members.filter((m) => m.id !== userId));
            toast.success("Member removed");
        } catch {
            toast.error("Failed to remove member");
        }
    };

    // Delete workspace
    const handleDeleteWorkspace = async () => {
        if (deleteConfirm !== workspace.name) {
            toast.error("Please type the workspace name to confirm");
            return;
        }

        setDeleting(true);
        try {
            await deleteWorkspace(workspace.id);
            toast.success("Workspace deleted");
            router.push("/dashboard");
        } catch {
            toast.error("Failed to delete workspace");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-zinc-500" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            Workspace Settings
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={() => setActiveTab("general")}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "general"
                            ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                    >
                        <Edit3 className="w-4 h-4" />
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab("members")}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "members"
                            ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        Members
                    </button>
                    <button
                        onClick={() => setActiveTab("danger")}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "danger"
                            ? "border-red-500 text-red-500"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Danger Zone
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                    {/* General Tab */}
                    {activeTab === "general" && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Workspace Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                    placeholder="My Workspace"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
                                    placeholder="Describe this workspace..."
                                />
                            </div>

                            <button
                                onClick={handleSaveGeneral}
                                disabled={saving || !name.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all disabled:opacity-50"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    )}

                    {/* Members Tab */}
                    {activeTab === "members" && (
                        <div className="space-y-6">
                            {/* Add Member */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Add Member
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
                                                    onClick={() => handleAddMember(user.id, user.email)}
                                                    disabled={addingMember}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center text-sm font-medium">
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
                                                    <Plus className="w-4 h-4 text-zinc-400" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

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
                                                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center text-sm font-medium">
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
                                                            <Crown className="w-4 h-4 text-yellow-500" />
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
                                                {member.role !== "owner" && (
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
                        </div>
                    )}

                    {/* Danger Zone Tab */}
                    {activeTab === "danger" && (
                        <div className="space-y-6">
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-red-700 dark:text-red-400">
                                            Delete Workspace
                                        </h3>
                                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                            This will permanently delete the workspace, all boards, lists,
                                            and cards. This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Type <span className="font-bold text-red-500">{workspace.name}</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirm}
                                    onChange={(e) => setDeleteConfirm(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-red-200 dark:border-red-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder={workspace.name}
                                />
                            </div>

                            <button
                                onClick={handleDeleteWorkspace}
                                disabled={deleting || deleteConfirm !== workspace.name}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Delete Workspace
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
