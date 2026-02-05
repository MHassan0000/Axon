"use client";
import React from "react";
import Link from "next/link";
import { footerLinks, socialLinks } from "@/constants/homepage";

export default function Footer() {
    return (
        <footer className="relative w-full bg-zinc-900 dark:bg-black border-t border-zinc-800 dark:border-zinc-900">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
                    {/* Logo & Tagline */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="inline-block mb-4">
                            <h3 className="text-2xl font-bold text-white">Axon</h3>
                        </Link>
                        <p className="text-zinc-400 text-sm mb-6 max-w-xs">
                            Built for teams who value speed, clarity, and focus.
                        </p>
                        <Link
                            href="/sign-in"
                            className="text-sm text-zinc-300 hover:text-white transition-colors"
                        >
                            Log In →
                        </Link>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm">
                            {footerLinks.product.title}
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.product.links.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-zinc-400 hover:text-white text-sm transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm">
                            {footerLinks.resources.title}
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.links.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-zinc-400 hover:text-white text-sm transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm">
                            {footerLinks.company.title}
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.company.links.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-zinc-400 hover:text-white text-sm transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-zinc-800 dark:bg-zinc-900 mb-8" />

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Legal Links */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm">
                        <Link
                            href="/privacy"
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            Terms
                        </Link>
                        <span className="text-zinc-600">
                            © 2026 Axon
                        </span>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-zinc-800 dark:bg-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                                aria-label={social.name}
                            >
                                <social.icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
