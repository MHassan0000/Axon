"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    iconPath: "/icons/kanban-svgrepo-com.svg",
    title: "Create Your Board",
    description: "Start with a blank canvas or choose from templates",

  },
  {
    iconPath: "/icons/task-collection-svgrepo-com.svg",
    title: "Add Tasks",
    description: "Drag, drop, and organize your workflow visually",

  },
  {
    iconPath: "/icons/in-progress-svgrepo-com.svg",
    title: "Track Progress",
    description: "Watch your tasks move from idea to completion",

  },
  {
    iconPath: "/icons/collaboration-team-svgrepo-com.svg",
    title: "Collaborate",
    description: "Share boards and work together in real-time",

  },
];

export default function HowItWorks() {
  return (
    <section className="relative w-full py-16 md:py-24 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            Get started in seconds. No learning curve.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
              }}
              className="relative group"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 font-bold text-sm z-10">
                {index + 1}
              </div>

              {/* Card */}
              <div className="relative h-full p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 overflow-hidden group-hover:shadow-lg dark:group-hover:shadow-zinc-950/50">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Icon */}
                <div className={`relative mb-4 p-3 w-fit rounded-lg bg-white bg-opacity-10`}>
                  <Image
                    src={step.iconPath}
                    alt={step.title}
                    width={35}
                    height={35}
                    className="opacity-70 dark:opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>

                {/* Content */}
                <h3 className="relative text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {step.title}
                </h3>
                <p className="relative text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow Connector (desktop only, not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                  <ArrowRight className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
