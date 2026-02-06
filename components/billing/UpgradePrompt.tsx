import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface UpgradePromptProps {
    feature?: string;
    title?: string;
    description?: string;
    variant?: "inline" | "card" | "banner";
}

export function UpgradePrompt({
    feature,
    title = "Pro Feature",
    description,
    variant = "card",
}: UpgradePromptProps) {
    const defaultDescription = feature
        ? `${feature} requires a Pro subscription.`
        : "Upgrade to Pro for unlimited access and premium features.";

    if (variant === "banner") {
        return (
            <div className="w-full py-3 px-4 bg-linear-to-r from-indigo-500 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {description || defaultDescription}
                        </span>
                    </div>
                    <Link
                        href="/pricing"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
                    >
                        Upgrade
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        );
    }

    if (variant === "inline") {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-indigo-600 dark:text-indigo-400">Pro</span>
                <Link
                    href="/pricing"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                    Upgrade
                </Link>
            </div>
        );
    }

    // Card variant (default)
    return (
        <div className="p-4 bg-linear-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="font-semibold text-zinc-900 dark:text-white">
                    {title}
                </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {description || defaultDescription}
            </p>
            <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
                Upgrade to Pro
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}

interface LimitIndicatorProps {
    current: number;
    max: number;
    label: string;
    showUpgrade?: boolean;
}

export function LimitIndicator({
    current,
    max,
    label,
    showUpgrade = true,
}: LimitIndicatorProps) {
    const percentage = max === Infinity ? 0 : (current / max) * 100;
    const isAtLimit = current >= max && max !== Infinity;
    const isNearLimit = percentage >= 80 && !isAtLimit;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
                <span
                    className={`font-medium ${isAtLimit
                        ? "text-red-500"
                        : isNearLimit
                            ? "text-amber-500"
                            : "text-zinc-900 dark:text-white"
                        }`}
                >
                    {current} / {max === Infinity ? "∞" : max}
                </span>
            </div>
            {max !== Infinity && (
                <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${isAtLimit
                            ? "bg-red-500"
                            : isNearLimit
                                ? "bg-amber-500"
                                : "bg-indigo-500"
                            }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            )}
            {isAtLimit && showUpgrade && (
                <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                >
                    <Sparkles className="w-3 h-3" />
                    Upgrade for unlimited
                </Link>
            )}
        </div>
    );
}

interface PlanBadgeProps {
    plan: "free" | "pro";
    size?: "sm" | "md";
}

export function PlanBadge({ plan, size = "sm" }: PlanBadgeProps) {
    if (plan === "pro") {
        return (
            <span
                className={`inline-flex items-center gap-1 font-semibold bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-full ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
                    }`}
            >
                <Sparkles className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
                PRO
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
                }`}
        >
            FREE
        </span>
    );
}
