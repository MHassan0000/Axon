"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Layers, ArrowRight, CheckCircle2 } from "lucide-react";
import { featuresPageData } from "@/constants/homepage";

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black mt-20">


            {/* Hero Section */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">

                            Everything you need
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6">
                            Powerful features,{" "}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-500">
                                simple interface
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                            Axon combines powerful project management with a clean, intuitive design.
                            No bloat, no learning curve—just results.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Features Grid */}
            <section className="py-16 px-4 bg-zinc-50 dark:bg-zinc-950">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {featuresPageData.features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group"
                            >
                                <div className="h-full p-6 md:p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                        <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
                                        {feature.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {feature.highlights.map((highlight) => (
                                            <li
                                                key={highlight}
                                                className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500"
                                            >
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                {highlight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional Features */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                            And so much more
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Every detail designed for productivity
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featuresPageData.additionalFeatures.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 px-4 bg-linear-to-br from-indigo-500 to-purple-600">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Layers className="w-12 h-12 text-white/80 mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to get organized?
                        </h2>
                        <p className="text-indigo-100 mb-8 text-lg">
                            Start using Axon for free today. No credit card required.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
                            >
                                Start Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                            >
                                View Pricing
                            </Link>
                        </div>
                    </motion.div>
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
