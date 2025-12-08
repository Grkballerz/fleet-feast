"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Breadcrumbs } from "./Breadcrumbs";
import { UserMenu } from "@/components/navigation/UserMenu";
import { adminNavItems } from "@/components/navigation/NavMenu";
import { UserRole } from "@/types";
import { Badge } from "@/components/ui/Badge";

export interface AdminLayoutProps {
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
   * Show admin badge in header
   */
  showAdminBadge?: boolean;
  /**
   * Additional CSS classes for main content
   */
  className?: string;
}

/**
 * AdminLayout Component
 *
 * Layout for admin-only pages.
 * Requires Admin role, redirects non-admins to home.
 * Includes admin-specific sidebar and styling.
 *
 * @example
 * ```tsx
 * <AdminLayout title="Pending Vendors">
 *   <PendingVendorsList />
 * </AdminLayout>
 * ```
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  showBreadcrumbs = true,
  showAdminBadge = true,
  className,
}) => {
  const { data: session, status } = useSession();

  // Redirect non-admins
  React.useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== UserRole.ADMIN) {
      redirect("/");
    }
  }, [session, status]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not admin
  if (!session || session.user.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Navigation Link - WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:border-3 focus:border-black focus:shadow-brutal focus:text-black focus:font-bold"
      >
        Skip to main content
      </a>

      {/* Sidebar (Desktop) */}
      <Sidebar items={adminNavItems} userRole={UserRole.ADMIN} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 neo-glass-header border-b-3 border-black">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            {/* Page Title */}
            <div className="flex items-center gap-3">
              {title && (
                <h1 className="neo-heading text-xl text-text-primary">
                  {title}
                </h1>
              )}
              {showAdminBadge && (
                <Badge variant="error" size="sm">
                  Admin
                </Badge>
              )}
            </div>

            {/* User Menu (Desktop) */}
            <div className="hidden lg:block ml-auto">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="px-4 sm:px-6 lg:px-8 border-b-3 border-black neo-glass-header">
            <Breadcrumbs />
          </div>
        )}

        {/* Page Content - WCAG 4.1.2 */}
        <main id="main-content" className={`flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6 ${className}`}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav items={adminNavItems} />
    </div>
  );
};
