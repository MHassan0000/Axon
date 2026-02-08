"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, UserMinus, X, Loader2, LogOut } from "lucide-react";

export type ConfirmDialogVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmDialogVariant;
    icon?: "trash" | "warning" | "user-remove" | "logout";
    isLoading?: boolean;
}

const variantStyles: Record<ConfirmDialogVariant, {
    iconBg: string;
    iconColor: string;
    buttonBg: string;
    buttonHover: string;
}> = {
    danger: {
        iconBg: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-600 dark:text-red-400",
        buttonBg: "bg-red-600 hover:bg-red-700",
        buttonHover: "hover:bg-red-700",
    },
    warning: {
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
        iconColor: "text-amber-600 dark:text-amber-400",
        buttonBg: "bg-amber-600 hover:bg-amber-700",
        buttonHover: "hover:bg-amber-700",
    },
    info: {
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        buttonBg: "bg-blue-600 hover:bg-blue-700",
        buttonHover: "hover:bg-blue-700",
    },
};

const iconComponents = {
    trash: Trash2,
    warning: AlertTriangle,
    "user-remove": UserMinus,
    logout: LogOut,
};

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    icon = "warning",
    isLoading = false,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    // Focus trap and escape key handling
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isLoading) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        confirmButtonRef.current?.focus();

        // Prevent body scroll
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose, isLoading]);

    if (!isOpen) return null;

    const styles = variantStyles[variant];
    const IconComponent = iconComponents[icon];

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Dialog */}
            <div
                ref={dialogRef}
                className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-6">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
                        <IconComponent className={`w-6 h-6 ${styles.iconColor}`} />
                    </div>

                    {/* Title */}
                    <h2
                        id="confirm-dialog-title"
                        className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2"
                    >
                        {title}
                    </h2>

                    {/* Message */}
                    <p
                        id="confirm-dialog-message"
                        className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed"
                    >
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 pb-6">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmButtonRef}
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${styles.buttonBg} rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Hook for easier usage
export function useConfirmDialog() {
    const [state, setState] = React.useState<{
        isOpen: boolean;
        props: Omit<ConfirmDialogProps, "isOpen" | "onClose" | "onConfirm">;
        resolve: ((confirmed: boolean) => void) | null;
    }>({
        isOpen: false,
        props: { title: "", message: "" },
        resolve: null,
    });

    const confirm = React.useCallback(
        (props: Omit<ConfirmDialogProps, "isOpen" | "onClose" | "onConfirm">): Promise<boolean> => {
            return new Promise((resolve) => {
                setState({
                    isOpen: true,
                    props,
                    resolve,
                });
            });
        },
        []
    );

    const handleClose = React.useCallback(() => {
        state.resolve?.(false);
        setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    }, [state.resolve]);

    const handleConfirm = React.useCallback(() => {
        state.resolve?.(true);
        setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    }, [state.resolve]);

    const DialogComponent = React.useCallback(
        () => (
            <ConfirmDialog
                isOpen={state.isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                {...state.props}
            />
        ),
        [state.isOpen, state.props, handleClose, handleConfirm]
    );

    return { confirm, ConfirmDialog: DialogComponent };
}
