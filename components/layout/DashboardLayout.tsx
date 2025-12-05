"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Breadcrumbs } from "./Breadcrumbs";
import { UserMenu } from "@/components/navigation/UserMenu";
import {
  customerNavItems,
  vendorNavItems,
  adminNavItems,
} from "@/components/navigation/NavMenu";
import { UserRole } from "@/types";

export interface DashboardLayoutProps {
  /**
   * Page content
   */
  children: React.ReactNode;
  /**
   * Page title
   */
  title?: string;
  /**
   * Show breadcrumbs (default: true)
   */
  showBreadcrumbs?: boolean;
  /**
   * Additional CSS classes for main content
   */
  className?: string;
}

/**
 * DashboardLayout Component
 *
 * Layout for authenticated dashboard pages.
 * Includes sidebar (desktop), mobile nav, breadcrumbs, and page title.
 *
 * @example
 * ```tsx
 * <DashboardLayout title="My Bookings">
 *   <BookingsList />
 * </DashboardLayout>
 * ```
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  showBreadcrumbs = true,
  className,
}) => {
  const { data: session } = useSession();

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!session) return customerNavItems;

    switch (session.user.role) {
      case UserRole.CUSTOMER:
        return customerNavItems;
      case UserRole.VENDOR:
        return vendorNavItems;
      case UserRole.ADMIN:
        return adminNavItems;
      default:
        return customerNavItems;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (Desktop) */}
      <Sidebar items={navItems} userRole={session?.user.role} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar (Mobile & Desktop) */}
        <header className="sticky top-0 z-20 bg-white border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            {/* Page Title */}
            {title && (
              <h1 className="text-xl font-semibold text-text-primary">
                {title}
              </h1>
            )}

            {/* User Menu (Desktop) */}
            <div className="hidden lg:block ml-auto">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="px-4 sm:px-6 lg:px-8 border-b border-border bg-white">
            <Breadcrumbs />
          </div>
        )}

        {/* Page Content */}
        <main className={`flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6 ${className}`}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav items={navItems} />
    </div>
  );
};
