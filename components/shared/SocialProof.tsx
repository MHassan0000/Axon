"use client";
import React from "react";
import { motion } from "framer-motion";
import { socialProofStats, socialProofTestimonials } from "@/constants/homepage";

export default function SocialProof() {
  return (
    <section className="relative w-full py-16 md:py-24 bg-zinc-100 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16">
          {socialProofStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="flex flex-col items-center text-center group"
            >
              <div className="mb-4 p-3 rounded-xl bg-zinc-200/50 dark:bg-zinc-800/50 group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20 transition-colors duration-300">
                <stat.icon className="w-6 h-6 text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-500 transition-colors duration-300" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 mb-16" />

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {socialProofTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.3 + index * 0.1,
              }}
              className="group p-6 rounded-lg bg-white dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300"
            >
              <p className="text-zinc-700 dark:text-zinc-300 mb-4 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {testimonial.author}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
