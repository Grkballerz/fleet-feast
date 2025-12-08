"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { NavMenu, NavMenuItem } from "@/components/navigation/NavMenu";
import { MobileDrawer } from "@/components/navigation/MobileDrawer";
import { UserRole } from "@/types";

export interface MobileNavProps {
  /**
   * Navigation items to display
   */
  items: NavMenuItem[];
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * MobileNav Component
 *
 * Mobile-only navigation bar with hamburger menu.
 * Shows at the bottom of the screen for easy thumb access.
 *
 * @example
 * ```tsx
 * <MobileNav items={navItems} />
 * ```
 */
export const MobileNav: React.FC<MobileNavProps> = ({ items, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Nav Bar - WCAG 2.4.1, 4.1.2 */}
      <nav
        role="navigation"
        aria-label="Mobile bottom navigation"
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 neo-glass-header border-t-3 border-black neo-shadow-lg ${className}`}
      >
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {/* Home */}
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            aria-label="Home"
            className="flex flex-col items-center justify-center py-2 px-3 rounded-neo hover:bg-secondary hover:neo-shadow transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <svg
              className="h-6 w-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs text-text-secondary mt-1 font-bold">Home</span>
          </Link>

          {/* Search */}
          <Link
            href="/search"
            aria-current={pathname === "/search" ? "page" : undefined}
            aria-label="Search food trucks"
            className="flex flex-col items-center justify-center py-2 px-3 rounded-neo hover:bg-secondary hover:neo-shadow transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <svg
              className="h-6 w-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-xs text-text-secondary mt-1 font-bold">Search</span>
          </Link>

          {/* Messages */}
          {session && (
            <Link
              href={
                session.user.role === UserRole.VENDOR
                  ? "/vendor/messages"
                  : "/dashboard/messages"
              }
              aria-current={pathname?.includes("/messages") ? "page" : undefined}
              aria-label="Messages"
              className="flex flex-col items-center justify-center py-2 px-3 rounded-neo hover:bg-secondary hover:neo-shadow transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <svg
                className="h-6 w-6 text-text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span className="text-xs text-text-secondary mt-1 font-bold">Messages</span>
            </Link>
          )}

          {/* Menu */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu-drawer"
            className="flex flex-col items-center justify-center py-2 px-3 rounded-neo hover:bg-secondary hover:neo-shadow transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <svg
              className="h-6 w-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span className="text-xs text-text-secondary mt-1 font-bold">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer
        id="mobile-menu-drawer"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <NavMenu
          items={items}
          userRole={session?.user.role}
          mobile
          onItemClick={() => setIsOpen(false)}
        />
      </MobileDrawer>
    </>
  );
};
