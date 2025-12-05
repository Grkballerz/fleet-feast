"use client";

import React from "react";
import { NavLink } from "./NavLink";
import { UserRole } from "@/types";

export interface NavMenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  roles?: UserRole[];
}

export interface NavMenuProps {
  /**
   * Navigation menu items
   */
  items: NavMenuItem[];
  /**
   * Current user role (for filtering items)
   */
  userRole?: UserRole;
  /**
   * Mobile layout
   */
  mobile?: boolean;
  /**
   * Click handler (for closing mobile menu)
   */
  onItemClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * NavMenu Component
 *
 * Renders a list of navigation links filtered by user role.
 *
 * @example
 * ```tsx
 * <NavMenu
 *   items={navigationItems}
 *   userRole={UserRole.CUSTOMER}
 *   mobile={false}
 * />
 * ```
 */
export const NavMenu: React.FC<NavMenuProps> = ({
  items,
  userRole,
  mobile = false,
  onItemClick,
  className,
}) => {
  // Filter items by role if roles are specified
  const filteredItems = items.filter(
    (item) => !item.roles || !userRole || item.roles.includes(userRole)
  );

  const containerStyles = mobile
    ? "flex flex-col gap-1"
    : "flex items-center gap-1";

  return (
    <nav className={className}>
      <div className={containerStyles}>
        {filteredItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            mobile={mobile}
            onClick={onItemClick}
          />
        ))}
      </div>
    </nav>
  );
};

/**
 * Pre-defined navigation items by role
 */

export const customerNavItems: NavMenuItem[] = [
  { label: "Search Trucks", href: "/search" },
  { label: "My Bookings", href: "/dashboard/bookings" },
  { label: "Messages", href: "/dashboard/messages" },
  { label: "Favorites", href: "/dashboard/favorites" },
];

export const vendorNavItems: NavMenuItem[] = [
  { label: "Dashboard", href: "/vendor/dashboard" },
  { label: "Bookings", href: "/vendor/bookings" },
  { label: "Calendar", href: "/vendor/calendar" },
  { label: "Messages", href: "/vendor/messages" },
  { label: "Profile", href: "/vendor/profile" },
];

export const adminNavItems: NavMenuItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Pending Vendors", href: "/admin/vendors/pending" },
  { label: "Disputes", href: "/admin/disputes" },
  { label: "Users", href: "/admin/users" },
  { label: "Analytics", href: "/admin/analytics" },
];

export const publicNavItems: NavMenuItem[] = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "For Vendors", href: "/for-vendors" },
];
