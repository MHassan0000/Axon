"use client";

import React, { useState, useRef } from "react";
import {
    X,
    Settings,
    Trash2,
    Edit3,
    Palette,
    Tag,
    Plus,
    Loader2,
    AlertTriangle,
    ImagePlus,
    Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    updateBoard,
    deleteBoard,
    createLabel,
    deleteLabel,
    uploadBoardBackground,
} from "@/lib/actions";
import { boardNameSchema, labelNameSchema, labelColorSchema } from "@/lib/validations";
import type { Board, Label } from "@/lib/types/database";

/* =====================================================
   Types
   ===================================================== */

interface BoardSettingsModalProps {
    board: Board & { labels?: Label[] };
    onClose: () => void;
    onUpdate: (board: Board) => void;
}

/* =====================================================
   Preset Colors
   ===================================================== */

const PRESET_COLORS = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#eab308", // yellow
    "#84cc16", // lime
    "#22c55e", // green
    "#10b981", // emerald
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#0ea5e9", // sky
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#d946ef", // fuchsia
    "#ec4899", // pink
];

/* =====================================================
   Board Settings Modal Component
   ===================================================== */

export function BoardSettingsModal({
    board,
    onClose,
    onUpdate,
}: BoardSettingsModalProps) {
    const router = useRouter();

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [activeTab, setActiveTab] = useState<"general" | "labels" | "danger">("general");
    const [boardName, setBoardName] = useState(board.name);
    const [boardColor, setBoardColor] = useState(board.background_color || PRESET_COLORS[4]);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(board.background_image || null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(board.background_image || null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [saving, setSaving] = useState(false);

    // Labels state
    const [labels, setLabels] = useState<Label[]>(board.labels || []);
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[4]);
    const [creatingLabel, setCreatingLabel] = useState(false);

    // Delete state
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [deleting, setDeleting] = useState(false);

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Please select a valid image (JPEG, PNG, WebP, or GIF)");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        setImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    // Remove selected/current image
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setBackgroundImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Save board settings
    const handleSaveBoard = async () => {
        const validation = boardNameSchema.safeParse(boardName);
        if (!validation.success) {
            toast.error(validation.error.issues[0]?.message || "Invalid board name");
            return;
        }

        setSaving(true);
        try {
            let finalImageUrl: string | null = backgroundImage;

            // Upload new image if selected
            if (imageFile) {
                setUploadingImage(true);
                const formData = new FormData();
                formData.append("file", imageFile);
                const uploadResult = await uploadBoardBackground(board.workspace_id, formData);
                setUploadingImage(false);

                if (uploadResult.error) {
                    toast.error(uploadResult.error);
                    setSaving(false);
                    return;
                }
                finalImageUrl = uploadResult.url;
            }

            const updated = await updateBoard(board.id, {
                name: validation.data,
                background_color: boardColor,
                background_image: finalImageUrl,
            });
            if (updated) {
                onUpdate(updated);
                toast.success("Board updated");
            }
        } catch {
            toast.error("Failed to update board");
        } finally {
            setSaving(false);
            setUploadingImage(false);
        }
    };

    // Create label
    const handleCreateLabel = async () => {
        const nameValidation = labelNameSchema.safeParse(newLabelName);
        const colorValidation = labelColorSchema.safeParse(newLabelColor);

        if (!nameValidation.success) {
            toast.error(nameValidation.error.issues[0]?.message || "Invalid label name");
            return;
        }
        if (!colorValidation.success) {
            toast.error("Invalid label color");
            return;
        }

        setCreatingLabel(true);
        try {
            const label = await createLabel(board.id, newLabelName, newLabelColor);
            if (label) {
                setLabels([...labels, label]);
                setNewLabelName("");
                setNewLabelColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
                toast.success("Label created");
            }
        } catch {
            toast.error("Failed to create label");
        } finally {
            setCreatingLabel(false);
        }
    };

    // Delete label
    const handleDeleteLabel = async (labelId: string) => {
        try {
            await deleteLabel(labelId);
            setLabels(labels.filter(l => l.id !== labelId));
            toast.success("Label deleted");
        } catch {
            toast.error("Failed to delete label");
        }
    };

    // Delete board
    const handleDeleteBoard = async () => {
        if (deleteConfirmation !== board.name) {
            toast.error("Please type the board name to confirm deletion");
            return;
        }

        setDeleting(true);
        try {
            const success = await deleteBoard(board.id);
            if (success) {
                toast.success("Board deleted");
                router.push(`/dashboard/workspace/${board.workspace_id}`);
            }
        } catch {
            toast.error("Failed to delete board");
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-xl shadow-2xl max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            Board Settings
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-4">
                    <button
                        onClick={() => setActiveTab("general")}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "general"
                            ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab("labels")}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "labels"
                            ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                    >
                        Labels
                    </button>
                    <button
                        onClick={() => setActiveTab("danger")}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "danger"
                            ? "border-red-500 text-red-600 dark:text-red-400"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                    >
                        Danger Zone
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-96">
                    {/* General Tab */}
                    {activeTab === "general" && (
                        <div className="space-y-6">
                            {/* Board Name */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Board Name
                                </label>
                                <input
                                    type="text"
                                    value={boardName}
                                    onChange={(e) => setBoardName(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                                />
                            </div>

                            {/* Board Color */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Board Color
                                </label>
                                <div className="grid grid-cols-8 gap-2">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setBoardColor(color)}
                                            className={`w-8 h-8 rounded-lg transition-transform ${boardColor === color
                                                ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-white scale-110"
                                                : "hover:scale-105"
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Background Image */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Background Image (optional)
                                </label>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                                    Upload a custom background image. This will override the board color.
                                </p>
                                
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />

                                {imagePreview ? (
                                    <div className="relative">
                                        <div
                                            className="w-full h-32 rounded-lg bg-cover bg-center border border-zinc-200 dark:border-zinc-700"
                                            style={{ backgroundImage: `url(${imagePreview})` }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-24 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                                    >
                                        <ImagePlus className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                            Click to upload image
                                        </span>
                                    </button>
                                )}
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSaveBoard}
                                disabled={saving || uploadingImage || !boardName.trim()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                            >
                                {(saving || uploadingImage) && <Loader2 className="w-4 h-4 animate-spin" />}
                                {uploadingImage ? "Uploading image..." : "Save Changes"}
                            </button>
                        </div>
                    )}

                    {/* Labels Tab */}
                    {activeTab === "labels" && (
                        <div className="space-y-4">
                            {/* New Label Form */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Create New Label
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newLabelName}
                                        onChange={(e) => setNewLabelName(e.target.value)}
                                        placeholder="Label name"
                                        className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                                    />
                                    <button
                                        onClick={handleCreateLabel}
                                        disabled={creatingLabel || !newLabelName.trim()}
                                        className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                    >
                                        {creatingLabel ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <div className="grid grid-cols-8 gap-2">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setNewLabelColor(color)}
                                            className={`w-6 h-6 rounded transition-transform ${newLabelColor === color
                                                ? "ring-2 ring-offset-1 ring-zinc-900 dark:ring-white scale-110"
                                                : "hover:scale-105"
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Labels List */}
                            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                                    Existing Labels
                                </h4>
                                {labels.length > 0 ? (
                                    <div className="space-y-2">
                                        {labels.map((label) => (
                                            <div
                                                key={label.id}
                                                className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-4 h-4 rounded"
                                                        style={{ backgroundColor: label.color }}
                                                    />
                                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                                        {label.name}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteLabel(label.id)}
                                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 dark:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                                        No labels yet. Create one above!
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Danger Tab */}
                    {activeTab === "danger" && (
                        <div className="space-y-6">
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                                            Delete Board
                                        </h4>
                                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                            This action cannot be undone. All lists, cards, and comments will be permanently deleted.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Type <span className="font-semibold">{board.name}</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="Board name"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-600"
                                />
                            </div>

                            <button
                                onClick={handleDeleteBoard}
                                disabled={deleting || deleteConfirmation !== board.name}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                <Trash2 className="w-4 h-4" />
                                Delete Board Permanently
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
