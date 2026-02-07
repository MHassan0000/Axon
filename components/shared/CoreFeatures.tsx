"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { coreFeatures } from "@/constants/homepage";

export default function CoreFeatures() {
  return (
    <section className="relative w-full py-12 sm:py-16 md:py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
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
            Work Smarter
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4"
          >
            Built for Productivity
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto"
          >
            Powerful features that stay out of your way
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {coreFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
              }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-4 sm:p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 overflow-hidden hover:shadow-xl dark:hover:shadow-zinc-950/50 hover:-translate-y-1">
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon or Image */}
                <div className="relative mb-4 w-12 h-12 flex items-center justify-center">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={48}
                    height={48}
                    className="opacity-70 dark:opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>

                {/* Content */}
                <h3 className="relative text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {feature.title}
                </h3>
                <p className="relative text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
