"use client";
import React, { useRef, useEffect } from "react";
import { LampContainer } from "../ui/lamp";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (videoRef.current) {

        videoRef.current.currentTime = 0;

        const playPromise = videoRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Video playing successfully
            })
            .catch(() => {
              // Autoplay prevented - user interaction needed
            });
        }
      }
    }, 700);

    return () => clearTimeout(timer);
  }, []);


  return (
    <div>
      <LampContainer className="rounded-none">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12 w-full max-w-7xl px-4 sm:px-6 md:px-8">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center lg:items-start gap-6 md:gap-8 flex-1"
          >
            {/* Main Headline */}
            <h1 className="mt-6 sm:mt-8 lg:mt-0 bg-linear-to-br from-zinc-700 to-zinc-900 dark:from-slate-300 dark:to-slate-500 py-4 bg-clip-text text-center lg:text-left text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-transparent leading-tight">
              Build projects
              <br />
              the right way
            </h1>

            {/* Subheadline */}
            <p className="text-zinc-700 dark:text-slate-400 text-center lg:text-left text-sm sm:text-base md:text-lg lg:text-xl max-w-xl">
              Streamline your workflow with powerful task management,
              team collaboration, and intelligent automation. Built for modern teams.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-4 md:mt-6">
              <Link
                href="/sign-up"
                className="group relative inline-flex items-center gap-2 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:scale-105 w-full sm:w-auto justify-center text-sm sm:text-base"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-zinc-900 dark:text-white font-semibold rounded-lg border border-zinc-300 dark:border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center text-sm sm:text-base"
              >
                Watch Demo
              </Link>
            </div>
          </motion.div>

          {/* Right Side - Video */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="flex-1 w-full max-w-xl lg:max-w-none"
          >
            {/* Video container */}
            <div className="relative rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-800 shadow-lg bg-zinc-100 dark:bg-zinc-900">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                preload="auto"
                className="w-full h-auto object-cover"
              >
                <source src="/assets/updatedhero-mobile-final.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>
        </div>
      </LampContainer>
    </div>
  );
}