"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/navigation/UserMenu";
import { NavMenu, publicNavItems, customerNavItems, vendorNavItems, adminNavItems } from "@/components/navigation/NavMenu";
import { MobileDrawer } from "@/components/navigation/MobileDrawer";
import { UserRole } from "@/types";

export interface HeaderProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Header Component
 *
 * Main site header with:
 * - Logo
 * - Desktop navigation (hidden on mobile)
 * - Search bar (placeholder)
 * - User menu or login/register buttons
 * - Mobile hamburger menu
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export const Header: React.FC<HeaderProps> = ({ className }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  // Determine navigation items based on user role
  const getNavItems = () => {
    if (!session) {
      return publicNavItems;
    }

    switch (session.user.role) {
      case UserRole.CUSTOMER:
        return customerNavItems;
      case UserRole.VENDOR:
        return vendorNavItems;
      case UserRole.ADMIN:
        return adminNavItems;
      default:
        return publicNavItems;
    }
  };

  const navItems = getNavItems();

  return (
    <header className={`neo-glass-header sticky top-0 z-30 border-b-3 border-black ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Desktop Nav (for non-authenticated users) */}
          <div className="flex items-center gap-8">
            {/* Logo - WCAG 2.4.4, 4.1.2 */}
            <Link href="/" aria-label="Fleet Feast home" className="flex items-center gap-2 shrink-0 group">
              <div className="h-10 w-10 bg-primary rounded-neo neo-border flex items-center justify-center neo-shadow transition-all group-hover:neo-shadow-lg group-hover:-translate-y-0.5">
                <svg
                  className="h-6 w-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </div>
              <span className="neo-heading text-xl text-text-primary">
                Fleet<span className="text-primary">Feast</span>
              </span>
            </Link>

            {/* Desktop Navigation - WCAG 1.3.1, 2.4.1 */}
            <nav className="hidden lg:flex" aria-label="Main navigation">
              <NavMenu items={navItems} userRole={session?.user.role} />
            </nav>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Search food trucks..."
                className="neo-input w-full px-4 py-2 pl-10 pr-4 text-sm rounded-neo"
                aria-label="Search food trucks"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Right: User Menu - WCAG 4.1.2 */}
          <nav className="hidden lg:flex items-center gap-4" aria-label="User menu">
            <UserMenu navItems={navItems} />
          </nav>

          {/* Mobile: Hamburger Button - WCAG 4.1.2 */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-neo hover:bg-secondary transition-all hover:neo-shadow active:translate-x-0.5 active:translate-y-0.5"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            <svg
              className="h-6 w-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="search"
              placeholder="Search food trucks..."
              className="neo-input w-full px-4 py-2 pl-10 pr-4 text-sm rounded-neo"
              aria-label="Search food trucks"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        id="mobile-navigation-drawer"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <div className="flex flex-col gap-6">
          {/* Navigation Links */}
          <NavMenu
            items={navItems}
            userRole={session?.user.role}
            mobile
            onItemClick={() => setMobileMenuOpen(false)}
          />

          {/* User Section */}
          <div className="pt-4 border-t border-border">
            <UserMenu compact />
          </div>
        </div>
      </MobileDrawer>
    </header>
  );
};
