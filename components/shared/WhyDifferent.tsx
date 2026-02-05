"use client";
import React from "react";
import { motion } from "framer-motion";
import { X, Focus, Zap } from "lucide-react";

const values = [
  {
    icon: Zap,
    title: "Speed First",
    description: "Every interaction is instant. No loading spinners, no delays.",
  },
  {
    icon: Focus,
    title: "Clarity Over Clutter",
    description: "Only what matters. We removed everything that gets in your way.",
  },
  {
    icon: X,
    title: "No Feature Bloat",
    description: "Built to solve one problem exceptionally well, not everything poorly.",
  },
];

export default function WhyDifferent() {
  return (
    <section className="relative w-full py-16 md:py-24 bg-zinc-100 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400 mb-3 tracking-wider uppercase">
              Built Different
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 leading-tight">
              Intentionally Simple,
              <br />
              Powerfully Fast
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed mb-8">
              We're not trying to be everything to everyone. We built a task management tool that does one thing incredibly well: help you get work done without getting in the way.
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
              No complicated workflows. No feature overload. No learning curve. Just a clean, fast, and reliable workspace that respects your time and focus.
            </p>
          </motion.div>

          {/* Right Side - Value Cards */}
          <div className="space-y-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                }}
                className="group"
              >
                <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-lg dark:hover:shadow-zinc-950/50">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="shrink-0 p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20 transition-colors duration-300">
                      <value.icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-500 transition-colors duration-300" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                        {value.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
