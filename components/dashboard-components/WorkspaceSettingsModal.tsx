"use client";

import React, { useState } from "react";
import {
    X,
    Settings,
    Trash2,
    Edit3,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    updateWorkspace,
    deleteWorkspace,
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

type Tab = "general" | "danger";

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

    // Delete state
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleting, setDeleting] = useState(false);

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
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl">
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
