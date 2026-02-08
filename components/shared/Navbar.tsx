"use client";
import React, { useState, useEffect } from "react";
import { HoveredLink, MenuItem, ProductItem } from "../ui/navbar-menu";
import Image from "next/image";
import ThemeToggle from "../ui/theme-toggle";
import Link from "next/link";
import { Menu as MenuIcon, X, LayoutDashboard } from "lucide-react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function Navbar() {
  const [active, setActive] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full flex items-center justify-center">
      <div className="fixed top-0 inset-x-0 max-w-7xl mx-auto z-100 px-4">
        {/* Rounded Navbar Container */}
        <nav
          className="relative rounded-full border border-slate-200 dark:border-white/20 bg-slate-50/90 dark:bg-black backdrop-blur-lg shadow-lg"
          onMouseLeave={() => setActive(null)}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">

            {/* Left: Logo + Axon */}
            <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <Image
                src="/images/axonlogo-v2.png"
                alt="Axon Logo"
                width={50}
                height={50}
                className="object-contain  w-8 h-8 sm:w-10 sm:h-10 md:w-12.5 md:h-12.5"
              />
              <span className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                Axon
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-900 dark:text-white" />
              ) : (
                <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-900 dark:text-white" />
              )}
            </button>

            {/* Desktop: Center Menu Items */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <MenuItem setActive={setActive} active={active} item="Features">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="/features">All Features</HoveredLink>
                  <HoveredLink href="/features#boards">Board Management</HoveredLink>
                  <HoveredLink href="/features#collaboration">Team Collaboration</HoveredLink>
                  <HoveredLink href="/features#calendar">Calendar & Due Dates</HoveredLink>
                </div>
              </MenuItem>

              <MenuItem setActive={setActive} active={active} item="Solutions">
                <div className="text-sm grid grid-cols-2 gap-10 p-4">
                  <ProductItem
                    title="For Teams"
                    href="/solutions"
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop"
                    description="Collaborate seamlessly with your entire team"
                  />
                  <ProductItem
                    title="For Startups"
                    href="/solutions"
                    src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop"
                    description="Move fast without sacrificing organization"
                  />
                  <ProductItem
                    title="For Developers"
                    href="/solutions"
                    src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop"
                    description="Track bugs, sprints, and releases"
                  />
                  <ProductItem
                    title="For Enterprise"
                    href="/solutions"
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop"
                    description="Enterprise-grade security and control"
                  />
                </div>
              </MenuItem>

              <MenuItem setActive={setActive} active={active} item="Resources">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="/resources">Resource Center</HoveredLink>
                  <HoveredLink href="/resources#getting-started">Getting Started</HoveredLink>
                  <HoveredLink href="/resources#guides">User Guides</HoveredLink>
                  <HoveredLink href="/resources#api">API Documentation</HoveredLink>
                </div>
              </MenuItem>

              <Link
                href="/pricing"
                className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-medium transition-colors"
              >
                Pricing
              </Link>
            </div>

            {/* Desktop: Right - Auth + Theme Toggle */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              {mounted && (
                <>
                  <SignedOut>
                    <Link
                      href="/sign-in"
                      className="px-6 py-2.5 rounded-lg font-medium text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Log in
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-9 h-9"
                        }
                      }}
                    />
                  </SignedIn>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-white/20 shadow-xl p-4 sm:p-6">
              <div className="flex flex-col space-y-3 sm:space-y-4">
                {/* Mobile Menu Items */}
                <Link
                  href="/features"
                  className="text-zinc-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/solutions"
                  className="text-zinc-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Solutions
                </Link>
                <Link
                  href="/resources"
                  className="text-zinc-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Resources
                </Link>
                <Link
                  href="/pricing"
                  className="text-zinc-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>

                <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-2" />

                {/* Mobile Actions */}
                <div className="flex items-center justify-between pt-2">
                  {mounted && (
                    <>
                      <SignedOut>
                        <Link
                          href="/sign-in"
                          className="px-6 py-2.5 rounded-lg font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Log in
                        </Link>
                      </SignedOut>
                      <SignedIn>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <UserButton
                          afterSignOutUrl="/"
                          appearance={{
                            elements: {
                              avatarBox: "w-12 h-12"
                            }
                          }}
                        />
                      </SignedIn>
                    </>
                  )}
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}