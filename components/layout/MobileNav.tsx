"use client";

import React, { useState } from "react";
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

  return (
    <>
      {/* Mobile Bottom Nav Bar */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border shadow-lg ${className}`}
      >
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {/* Home */}
          <a
            href="/"
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <svg
              className="h-6 w-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs text-text-secondary mt-1">Home</span>
          </a>

          {/* Search */}
          <a
            href="/search"
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <svg
              className="h-6 w-6 text-text-primary"
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
            <span className="text-xs text-text-secondary mt-1">Search</span>
          </a>

          {/* Messages */}
          {session && (
            <a
              href={
                session.user.role === UserRole.VENDOR
                  ? "/vendor/messages"
                  : "/dashboard/messages"
              }
              className="flex flex-col items-center justify-center py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <svg
                className="h-6 w-6 text-text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span className="text-xs text-text-secondary mt-1">Messages</span>
            </a>
          )}

          {/* Menu */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <svg
              className="h-6 w-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span className="text-xs text-text-secondary mt-1">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
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
