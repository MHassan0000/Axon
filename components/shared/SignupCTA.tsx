"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupCTA() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate email
        if (!email) {
            setError("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        // Store email in sessionStorage for pre-filling on signup page
        if (typeof window !== "undefined") {
            sessionStorage.setItem("signupEmail", email);
        }

        // Redirect to Clerk's signup page
        router.push("/sign-up");
    };

    return (
        <section className="relative w-full py-16 sm:py-20 md:py-28 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Heading */}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 sm:mb-4">
                        Get started with Axon today
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                        Join thousands of teams already working smarter
                    </p>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-lg mx-auto mb-3 sm:mb-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <div className="flex-1">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError(""); // Clear error on input change
                                    }}
                                    placeholder="Email"
                                    className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-lg border-2 ${error
                                            ? "border-red-500 dark:border-red-500"
                                            : "border-zinc-300 dark:border-zinc-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                                        } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:outline-none transition-colors text-sm sm:text-base`}
                                />
                                {error && (
                                    <p className="text-red-500 dark:text-red-400 text-sm mt-2 text-left">
                                        {error}
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                            >
                                Sign up - it's free!
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>

                    {/* Privacy Notice */}
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        By entering my email, I acknowledge the{" "}
                        <Link href="/privacy" className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline">
                            Privacy Policy
                        </Link>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
