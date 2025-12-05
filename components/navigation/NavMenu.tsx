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
  { label: "Dashboard", href: "/dashboard" },
  { label: "Search Trucks", href: "/search" },
  { label: "My Bookings", href: "/bookings" },
  { label: "Messages", href: "/messages" },
  { label: "Favorites", href: "/dashboard/favorites" },
  { label: "Reviews", href: "/dashboard/reviews" },
  { label: "Payments", href: "/dashboard/payments" },
  { label: "Settings", href: "/dashboard/settings" },
];

export const vendorNavItems: NavMenuItem[] = [
  { label: "Overview", href: "/vendor/dashboard" },
  { label: "Bookings", href: "/vendor/bookings" },
  { label: "Calendar", href: "/vendor/calendar" },
  { label: "Analytics", href: "/vendor/analytics" },
  { label: "Reviews", href: "/vendor/reviews" },
  { label: "Payouts", href: "/vendor/payouts" },
  { label: "Messages", href: "/vendor/messages" },
  { label: "Profile", href: "/vendor/profile" },
];

export const adminNavItems: NavMenuItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Vendor Applications", href: "/admin/vendors" },
  { label: "Disputes", href: "/admin/disputes" },
  { label: "Violations", href: "/admin/violations" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Users", href: "/admin/users" },
];

export const publicNavItems: NavMenuItem[] = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "For Vendors", href: "/for-vendors" },
];
