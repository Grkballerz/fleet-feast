"use client";

import React from "react";
import Link from "next/link";
import { NavMenu, NavMenuItem } from "@/components/navigation/NavMenu";
import { UserRole } from "@/types";

export interface SidebarProps {
  /**
   * Navigation items to display
   */
  items: NavMenuItem[];
  /**
   * Current user role
   */
  userRole?: UserRole;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Sidebar Component
 *
 * Vertical sidebar navigation for dashboard layouts.
 * Shows logo and vertical navigation menu.
 *
 * @example
 * ```tsx
 * <Sidebar items={vendorNavItems} userRole={UserRole.VENDOR} />
 * ```
 */
export const Sidebar: React.FC<SidebarProps> = ({
  items,
  userRole,
  className,
}) => {
  return (
    <aside
      className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-white ${className}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 h-16 px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <svg
              className="h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-text-primary">
            Fleet<span className="text-primary">Feast</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <NavMenu items={items} userRole={userRole} mobile />
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-text-secondary text-center">
          © 2024 FleetFeast
        </p>
      </div>
    </aside>
  );
};
