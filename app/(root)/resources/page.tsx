"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
    ArrowRight,
    MessageCircle,
    HelpCircle,
    ExternalLink,
    ChevronRight,
} from "lucide-react";
import { resourcesPageData } from "@/constants/homepage";

export default function ResourcesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white dark:bg-black mt-20">


            {/* Hero Section with Search */}
            <section className="py-16 md:py-24 px-4 bg-linear-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6">
                            Resource Center
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-8">
                            Everything you need to master Axon—guides, tutorials, and documentation.
                        </p>


                    </motion.div>
                </div>
            </section>

            {/* Quick Links */}
            <section className="py-8 px-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {resourcesPageData.quickLinks.map((link, index) => (
                            <motion.a
                                key={link.title}
                                href={link.href}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="group flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all"
                            >
                                <div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-white text-sm mb-0.5">
                                        {link.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                                        {link.description}
                                    </p>
                                </div>
                                {link.external ? (
                                    <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                                )}
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Documentation Categories */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                            Browse by Category
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Find what you need, organized by topic
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                        {resourcesPageData.categories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Category Header */}
                                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center shrink-0">
                                            <category.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-1">
                                                {category.title}
                                            </h3>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Articles List */}
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {category.articles.map((article) => (
                                        <a
                                            key={article.title}
                                            href="#"
                                            className="group flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <span className="text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                                {article.title}
                                            </span>
                                            <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 ml-4">
                                                {article.time}
                                            </span>
                                        </a>
                                    ))}
                                </div>

                                {/* View All */}
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30">
                                    <a
                                        href="#"
                                        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                    >
                                        View all articles
                                        <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 md:py-24 px-4 bg-zinc-50 dark:bg-zinc-950">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <HelpCircle className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Quick answers to common questions
                        </p>
                    </div>

                    <div className="space-y-3">
                        {resourcesPageData.faqs.map((faq, index) => (
                            <motion.div
                                key={faq.question}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <button
                                    onClick={() =>
                                        setExpandedFaq(expandedFaq === index ? null : index)
                                    }
                                    className="w-full text-left p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                                            {faq.question}
                                        </h3>
                                        <ChevronRight
                                            className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform ${expandedFaq === index ? "rotate-90" : ""
                                                }`}
                                        />
                                    </div>
                                    {expandedFaq === index && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed"
                                        >
                                            {faq.answer}
                                        </motion.p>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Support CTA */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 md:p-12 text-center">
                        <MessageCircle className="w-12 h-12 text-white/80 mx-auto mb-6" />
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Still have questions?
                        </h2>
                        <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
                            Our support team is here to help. Reach out and we'll get back to you
                            within 24 hours.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
                            >
                                Contact Support
                                <ArrowRight className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors border border-white/20"
                            >
                                Join Community
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        © 2026 Axon. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            Terms
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
