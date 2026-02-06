"use client";

import React from "react";
import {
    HelpCircle,
    Keyboard,
    Book,
    MessageCircle,
    ExternalLink,
    Command,
    ArrowUp,
    ArrowDown,
    CornerDownLeft,
} from "lucide-react";

const shortcuts = [
    { keys: ["⌘", "K"], description: "Open global search" },
    { keys: ["⌘", "N"], description: "Create new card" },
    { keys: ["Escape"], description: "Close modal" },
    { keys: ["↑", "↓"], description: "Navigate search results" },
    { keys: ["Enter"], description: "Select item" },
];

const faqItems = [
    {
        question: "How do I create a new board?",
        answer: "Navigate to a workspace and click the 'New Board' button, or use the Create menu in the navigation bar.",
    },
    {
        question: "How do I invite team members?",
        answer: "Go to Workspace Settings and use the Members tab to search and add users to your workspace.",
    },
    {
        question: "Can I move cards between lists?",
        answer: "Yes! Simply drag and drop cards between lists to move them. You can also drag to reorder within the same list.",
    },
    {
        question: "How do I set a due date?",
        answer: "Click on a card to open the card modal, then use the Due Date section to set or change the due date.",
    },
];

export default function HelpPage() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            {/* Page Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            Help & Support
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Keyboard shortcuts and FAQs
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="max-w-3xl space-y-8">
                    {/* Keyboard Shortcuts */}
                    <section className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <Keyboard className="w-4 h-4" />
                            Keyboard Shortcuts
                        </h2>

                        <div className="space-y-3">
                            {shortcuts.map((shortcut, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-2 px-3 bg-white dark:bg-zinc-800/50 rounded-lg"
                                >
                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {shortcut.description}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {shortcut.keys.map((key, i) => (
                                            <React.Fragment key={i}>
                                                <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded text-xs font-mono text-zinc-700 dark:text-zinc-300">
                                                    {key}
                                                </kbd>
                                                {i < shortcut.keys.length - 1 && (
                                                    <span className="text-zinc-400 text-xs">+</span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <Book className="w-4 h-4" />
                            Frequently Asked Questions
                        </h2>

                        <div className="space-y-4">
                            {faqItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-white dark:bg-zinc-800/50 rounded-lg"
                                >
                                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                                        {item.question}
                                    </h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {item.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Contact Support */}
                    <section className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Need More Help?
                        </h2>

                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                            Can't find what you're looking for? Reach out to our support team.
                        </p>

                        <a
                            href="mailto:support@axon.app"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                        >
                            Contact Support
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </section>

                    {/* Version Info */}
                    <div className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                        Axon v1.0.0 • Built with ❤️
                    </div>
                </div>
            </div>
        </div>
    );
}
