"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { UserRole } from "@/types";

export interface NavMenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  roles?: UserRole[];
}

export interface UserMenuProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Compact mode - only shows Settings, Help & Support, and Logout
   * Use in mobile drawer where navigation links are already visible
   */
  compact?: boolean;
  /**
   * Navigation items to display in the dropdown (desktop mode)
   */
  navItems?: NavMenuItem[];
}

/**
 * UserMenu Component
 *
 * Displays login/register buttons for guests or avatar dropdown for authenticated users.
 * Dropdown items are customized based on user role.
 *
 * @example
 * ```tsx
 * <UserMenu />
 * ```
 */
export const UserMenu: React.FC<UserMenuProps> = ({ className, compact = false, navItems = [] }) => {
  const { data: session, status } = useSession();

  // Loading state
  if (status === "loading") {
    return (
      <div className={className}>
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  // Not authenticated - show login/register buttons
  if (!session) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Login
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="primary" size="sm">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  // Authenticated user
  const user = session.user;

  // Build dropdown items based on role
  const getDropdownItems = (): DropdownItem[] => {
    const items: DropdownItem[] = [];

    // Navigation links from header (skip in compact mode - already in mobile nav)
    if (!compact && navItems.length > 0) {
      navItems.forEach((navItem) => {
        items.push({
          label: navItem.label,
          href: navItem.href,
          icon: navItem.icon,
        });
      });
      items.push({ divider: true });
    }

    // Common items (always shown)
    items.push(
      { label: "Help & Support", href: "/support" },
      { divider: true },
      {
        label: "Logout",
        onClick: () => signOut({ callbackUrl: "/" }),
        destructive: true,
        icon: (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        ),
      }
    );

    return items;
  };

  return (
    <div className={className}>
      <Dropdown
        trigger={
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar name={user.name || user.email} size="md" />
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-text-primary">
                {user.name || user.email}
              </div>
              <div className="text-xs text-text-secondary capitalize">
                {user.role.toLowerCase()}
              </div>
            </div>
          </div>
        }
        items={getDropdownItems()}
        align="right"
      />
    </div>
  );
};
