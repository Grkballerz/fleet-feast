"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { NavMenu, NavMenuItem } from "@/components/navigation/NavMenu";
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
 * Mobile-only navigation bar with popup menu.
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
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Mobile Bottom Nav Bar - WCAG 2.4.1, 4.1.2 */}
      <nav
        role="navigation"
        aria-label="Mobile bottom navigation"
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 neo-glass-header border-t-3 border-black neo-shadow-lg ${className}`}
      >
        <div className="flex justify-center gap-2 px-4 py-2">
          {/* Home */}
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            aria-label="Home"
            className="flex flex-col items-center justify-center py-2 px-4 rounded-neo hover:bg-secondary hover:neo-shadow transition-all active:translate-x-0.5 active:translate-y-0.5"
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
            className="flex flex-col items-center justify-center py-2 px-4 rounded-neo hover:bg-secondary hover:neo-shadow transition-all active:translate-x-0.5 active:translate-y-0.5"
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

          {/* Messages - only show for Customer and Vendor (not Admin) */}
          {session && session.user.role !== UserRole.ADMIN && (
            <Link
              href={
                session.user.role === UserRole.VENDOR
                  ? "/vendor/messages"
                  : "/customer/messages"
              }
              aria-current={pathname?.includes("/messages") ? "page" : undefined}
              aria-label="Messages"
              className="flex flex-col items-center justify-center py-2 px-4 rounded-neo hover:bg-secondary hover:neo-shadow transition-all active:translate-x-0.5 active:translate-y-0.5"
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

          {/* Menu Button with Popup */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Open menu"
              aria-expanded={isOpen}
              aria-controls="mobile-menu-popup"
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-neo hover:bg-secondary hover:neo-shadow transition-all active:translate-x-0.5 active:translate-y-0.5 ${isOpen ? 'bg-secondary neo-shadow' : ''}`}
            >
              <svg
                className="h-6 w-6 text-text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
              <span className="text-xs text-text-secondary mt-1 font-bold">Menu</span>
            </button>

            {/* Popup Menu */}
            {isOpen && (
              <div
                ref={menuRef}
                id="mobile-menu-popup"
                className="absolute bottom-full right-0 mb-2 w-64 bg-white border-3 border-black rounded-neo neo-shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
              >
                {/* Menu Header */}
                <div className="flex items-center justify-between p-3 border-b-3 border-black bg-secondary/80">
                  <h2 className="neo-heading text-sm text-text-primary">Menu</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-neo hover:bg-white/50 transition-all"
                    aria-label="Close menu"
                  >
                    <svg
                      className="h-5 w-5 text-text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Menu Content */}
                <div className="p-2">
                  <NavMenu
                    items={items}
                    userRole={session?.user.role}
                    mobile
                    onItemClick={() => setIsOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};
