"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { solutionsPageData } from "@/constants/homepage";

export default function SolutionsPage() {
    const [activeSolution, setActiveSolution] = useState(solutionsPageData.solutions[0]);

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
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6">
                            Solutions for{" "}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-500">
                                every team
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                            Whether you're a startup of two or an enterprise of thousands,
                            Axon adapts to how your team works.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Solutions Tabs */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="py-8 px-4 border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 sticky top-18.25 z-40"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {solutionsPageData.solutions.map((solution) => (
                            <button
                                key={solution.id}
                                onClick={() => setActiveSolution(solution)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeSolution.id === solution.id
                                    ? "bg-zinc-900 dark:bg-white text-white dark:text-black"
                                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                                    }`}
                            >
                                <solution.icon className="w-4 h-4" />
                                {solution.title}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Active Solution Detail */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        key={activeSolution.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid lg:grid-cols-2 gap-12 items-center"
                    >
                        {/* Content */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
                                <activeSolution.icon className="w-4 h-4" />
                                {activeSolution.subtitle}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                                {activeSolution.title}
                            </h2>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                                {activeSolution.description}
                            </p>

                            <ul className="space-y-3 mb-8">
                                {activeSolution.benefits.map((benefit, index) => (
                                    <motion.li
                                        key={benefit}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="flex items-start gap-3"
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-zinc-700 dark:text-zinc-300">
                                            {benefit}
                                        </span>
                                    </motion.li>
                                ))}
                            </ul>

                            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6">
                                {activeSolution.cta}
                            </p>

                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                            >
                                Get Started Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Image */}
                        <div className="relative">
                            <div className="aspect-4/3 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                <Image
                                    src={activeSolution.image}
                                    alt={activeSolution.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -z-10 -top-4 -right-4 w-full h-full rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* All Solutions Grid */}
            <section className="py-16 md:py-24 px-4 bg-zinc-50 dark:bg-zinc-950">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                            Explore all solutions
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Click any card to learn more
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {solutionsPageData.solutions.map((solution, index) => (
                            <motion.button
                                key={solution.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                onClick={() => {
                                    setActiveSolution(solution);
                                    window.scrollTo({ top: 400, behavior: "smooth" });
                                }}
                                className={`text-left p-6 rounded-2xl border transition-all duration-300 ${activeSolution.id === solution.id
                                    ? "bg-linear-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 dark:border-indigo-500/30"
                                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg"
                                    }`}
                            >
                                <solution.icon
                                    className={`w-10 h-10 mb-4 ${activeSolution.id === solution.id
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-zinc-400 dark:text-zinc-600"
                                        }`}
                                />
                                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                                    {solution.title}
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                                    {solution.subtitle}
                                </p>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 px-4 bg-linear-to-br from-zinc-900 to-black dark:from-zinc-950 dark:to-black">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Not sure which solution fits?
                        </h2>
                        <p className="text-zinc-400 mb-8 text-lg">
                            Start with our free plan and explore. You can always upgrade or
                            customize as your needs evolve.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 font-semibold rounded-xl hover:bg-zinc-100 transition-colors"
                            >
                                Try Axon Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors border border-white/20"
                            >
                                Compare Plans
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
