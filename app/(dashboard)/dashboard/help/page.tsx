"use client";

import React from "react";
import {
    HelpCircle,
    Keyboard,
    Book,
    MessageCircle,
    ExternalLink,
} from "lucide-react";
import { keyboardShortcuts, faqItems, appVersion } from "@/constants/homepage";

export default function HelpPage() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
            {/* Page Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                    <HelpCircle className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
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
                            {keyboardShortcuts.map((shortcut, index) => (
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
                        Axon v{appVersion}
                    </div>
                </div>
            </div>
        </div>
    );
}
