"use client";
import React from "react";
import { LampContainer } from "../ui/lamp";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <div>
      <LampContainer className="rounded-none">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center justify-center gap-6 md:gap-8 px-4"
        >
          {/* Main Headline */}
          <h1 className="mt-8 bg-linear-to-br from-zinc-200 to-zinc-400 dark:from-slate-300 dark:to-slate-500 py-4 bg-clip-text text-center text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-transparent leading-tight">
            Build projects
            <br />
            the right way
          </h1>

          {/* Subheadline */}
          <p className="text-zinc-600 dark:text-slate-400 text-center text-base sm:text-lg md:text-xl max-w-2xl px-4">
            Streamline your workflow with powerful task management, 
            team collaboration, and intelligent automation. Built for modern teams.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 md:mt-6">
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:scale-105 w-full sm:w-auto justify-center"
            >
              
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-zinc-800/50 dark:bg-white/10 hover:bg-zinc-700/50 dark:hover:bg-white/20 text-zinc-900 dark:text-white font-semibold rounded-lg border border-zinc-300 dark:border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
            >
              Watch Demo
            </Link>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-6 md:mt-8 text-zinc-500 dark:text-slate-400 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Always Free to Start</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-400 dark:bg-slate-600" />
            <div className="flex items-center gap-2">
              <span>✨ No Credit Card Required</span>
            </div>
          </motion.div>
        </motion.div>
      </LampContainer>
    </div>
  );
}