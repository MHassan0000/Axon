"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { testimonials, companyLogos } from "@/constants/homepage";

export default function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <section className="relative w-full py-16 md:py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Testimonial Carousel */}
                <div className="relative mb-12">
                    {/* Navigation Arrows & Dots */}
                    <div className="flex items-center justify-end gap-4 mb-8">
                        {/* Pagination Dots */}
                        <div className="flex items-center gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                        ? "w-8 bg-zinc-700 dark:bg-zinc-300"
                                        : "w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                                        }`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Arrow Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={prevSlide}
                                className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Slides */}
                    <div className="relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-8 md:p-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800"
                            >
                                {/* Left: Quote */}
                                <div className="flex flex-col justify-between">
                                    <div>
                                        <p className="text-zinc-700 dark:text-zinc-300 text-lg md:text-xl leading-relaxed mb-6">
                                            "{testimonials[currentIndex].quote}"
                                        </p>
                                    </div>
                                    <div>
                                        <div className="h-px bg-zinc-300 dark:bg-zinc-700 mb-4" />
                                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            {testimonials[currentIndex].author}
                                        </p>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Statistic */}
                                <div className="flex items-center justify-center">
                                    <div className="w-full p-8 md:p-12 bg-indigo-600 dark:bg-indigo-500 rounded-xl">
                                        <p className="text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                                            {testimonials[currentIndex].stat}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="text-center space-y-8">
                    <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg">
                        Join a community of <span className="font-semibold text-zinc-900 dark:text-zinc-100">millions of users globally</span> who are using Axon to get more done.
                    </p>

                    {/* Company Logos */}
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                        {companyLogos.map((company, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 font-semibold text-lg md:text-xl tracking-tight hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
                            >
                                <company.icon className="w-6 h-6" />
                                <span>{company.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
