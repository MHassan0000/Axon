"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { workflows } from "@/constants/homepage";

export default function AppWorkflow() {
    return (
        <section className="relative w-full py-12 sm:py-16 md:py-24 bg-zinc-100 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Section Header */}
                <div className="text-center mb-10 sm:mb-12 md:mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-sm font-medium text-indigo-500 dark:text-indigo-400 mb-3 tracking-wider uppercase"
                    >
                        Seamless Integration
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4"
                    >
                        Turn Messages Into Tasks
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-zinc-700 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto"
                    >
                        Connect your favorite tools and let AI transform your workflow
                    </motion.p>
                </div>

                {/* Workflow Cards */}
                <div className="space-y-12 sm:space-y-16 md:space-y-24">
                    {workflows.map((workflow, index) => (
                        <motion.div
                            key={workflow.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: index * 0.2,
                            }}
                            className={`flex flex-col ${workflow.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
                                } items-center gap-6 sm:gap-8 lg:gap-12`}
                        >
                            {/* Image */}
                            <div className="w-full lg:w-1/2">
                                <div className="relative rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <Image
                                        src={workflow.image}
                                        alt={workflow.imageAlt}
                                        width={800}
                                        height={500}
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="w-full lg:w-1/2 space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 sm:p-2.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20">
                                        <workflow.icon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                        {workflow.title}
                                    </h3>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
                                    {workflow.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
