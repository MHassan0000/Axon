"use client";

import { PricingTable } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-linear-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
            {/* Header */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <Link
                        href="/sign-in"
                        className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Simple, transparent pricing
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6">
                            Choose your plan
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                            Start free and upgrade when you need more power. No hidden fees,
                            cancel anytime.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Table */}
            <section className="pb-16 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-xl">
                        <PricingTable />
                    </div>
                </motion.div>
            </section>

            {/* Features Comparison */}
            <section className="py-16 px-4 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-zinc-900 dark:text-white mb-12">
                        Compare Plans
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Free Plan */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                                Free
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                                Perfect for getting started
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Up to 2 workspaces",
                                    "Up to 3 boards per workspace",
                                    "Unlimited cards & lists",
                                    "Basic labels",
                                    "Community support",
                                ].map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"
                                    >
                                        <Check className="w-4 h-4 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-linear-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 p-6 relative overflow-hidden">
                            <div className="absolute top-4 right-4 px-2 py-1 bg-indigo-500 text-white text-xs font-bold rounded">
                                POPULAR
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                                Pro
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                                For power users & teams
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Unlimited workspaces",
                                    "Unlimited boards",
                                    "File attachments",
                                    "Advanced labels & colors",
                                    "Priority support",
                                    "Early access to new features",
                                ].map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"
                                    >
                                        <Check className="w-4 h-4 text-indigo-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-zinc-900 dark:text-white mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        {[
                            {
                                q: "Can I upgrade or downgrade at any time?",
                                a: "Yes! You can upgrade to Pro anytime and the change takes effect immediately. If you downgrade, you'll keep Pro features until the end of your billing period.",
                            },
                            {
                                q: "What happens to my data if I downgrade?",
                                a: "Your data is never deleted. If you exceed Free plan limits after downgrading, you won't be able to create new workspaces or boards until you upgrade or remove some.",
                            },
                            {
                                q: "Is there a free trial for Pro?",
                                a: "We offer a generous Free plan that lets you try all core features. Upgrade to Pro when you need more power.",
                            },
                            {
                                q: "What payment methods do you accept?",
                                a: "We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express.",
                            },
                        ].map((faq) => (
                            <div
                                key={faq.q}
                                className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6"
                            >
                                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                                    {faq.q}
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 bg-linear-to-r from-indigo-500 to-purple-600">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Ready to get started?
                    </h2>
                    <p className="text-indigo-100 mb-8">
                        Join thousands of teams already using Axon to manage their projects.
                    </p>
                    <Link
                        href="/sign-up"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        Start Free Today
                    </Link>
                </div>
            </section>
        </div>
    );
}
