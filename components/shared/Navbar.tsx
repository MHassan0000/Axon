"use client";
import React, { useState } from "react";
import { HoveredLink, MenuItem, ProductItem } from "../ui/navbar-menu";
import Image from "next/image";
import ThemeToggle from "../ui/theme-toggle";
import Link from "next/link";
import { Menu as MenuIcon, X } from "lucide-react";

export default function Navbar() {
  const [active, setActive] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="relative w-full flex items-center justify-center">
      <div className="fixed top-0 inset-x-0 max-w-7xl mx-auto z-100 px-4">
        {/* Rounded Navbar Container */}
        <nav 
          className="relative rounded-full border border-slate-200 dark:border-white/20 bg-slate-50/90 dark:bg-black backdrop-blur-lg shadow-lg"
          onMouseLeave={() => setActive(null)}
        >
          <div className="flex items-center justify-between px-8 py-6">
            
            {/* Left: Logo + Axon */}
            <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <Image
                src="/images/Axonlogo.png"
                alt="Axon Logo"
                width={50}
                height={50}
                className="object-contain mt-2"
              />
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                Axon
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-zinc-900 dark:text-white" />
              ) : (
                <MenuIcon className="w-6 h-6 text-zinc-900 dark:text-white" />
              )}
            </button>

            {/* Desktop: Center Menu Items */}
            <div className="hidden lg:flex items-center gap-8">
              <MenuItem setActive={setActive} active={active} item="Features">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="/boards">Board Management</HoveredLink>
                  <HoveredLink href="/tasks">Task Tracking</HoveredLink>
                  <HoveredLink href="/collaboration">Team Collaboration</HoveredLink>
                  <HoveredLink href="/analytics">Analytics Dashboard</HoveredLink>
                </div>
              </MenuItem>

              <MenuItem setActive={setActive} active={active} item="Solutions">
                <div className="text-sm grid grid-cols-2 gap-10 p-4">
                  <ProductItem
                    title="Project Management"
                    href="/solutions/projects"
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=200&fit=crop"
                    description="Organize projects with powerful boards and workflows"
                  />
                  <ProductItem
                    title="Team Workspace"
                    href="/solutions/teams"
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop"
                    description="Collaborate seamlessly with your entire team"
                  />
                  <ProductItem
                    title="Automation"
                    href="/solutions/automation"
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop"
                    description="Automate workflows and boost productivity"
                  />
                  <ProductItem
                    title="Integrations"
                    href="/solutions/integrations"
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"
                    description="Connect with your favorite tools and services"
                  />
                </div>
              </MenuItem>

              <MenuItem setActive={setActive} active={active} item="Resources">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="/docs">Documentation</HoveredLink>
                  <HoveredLink href="/guides">Getting Started</HoveredLink>
                  <HoveredLink href="/blog">Blog</HoveredLink>
                  <HoveredLink href="/support">Support Center</HoveredLink>
                </div>
              </MenuItem>

              <MenuItem setActive={setActive} active={active} item="Pricing">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="/pricing/free">Free Plan</HoveredLink>
                  <HoveredLink href="/pricing/professional">Professional</HoveredLink>
                  <HoveredLink href="/pricing/business">Business</HoveredLink>
                  <HoveredLink href="/pricing/enterprise">Enterprise</HoveredLink>
                </div>
              </MenuItem>
            </div>

            {/* Desktop: Right - Login Button + Theme Toggle */}
            <div className="hidden lg:flex items-center gap-4">
              <Link 
                href="sign-in"
                className="px-6 py-2.5 rounded-lg font-medium text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Log in
              </Link>
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-white/20 shadow-xl p-6">
              <div className="flex flex-col space-y-4">
                {/* Mobile Menu Items */}
                <Link 
                  href="/boards" 
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
                  href="/docs" 
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
                  <Link 
                    href="/sign-in"
                    className="px-6 py-2.5 rounded-lg font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
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