"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface BreadcrumbsProps {
  /**
   * Breadcrumb items (if not provided, auto-generated from pathname)
   */
  items?: BreadcrumbItem[];
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Breadcrumbs Component
 *
 * Shows navigation breadcrumbs based on current path.
 * Auto-generates breadcrumbs from URL if items not provided.
 *
 * @example
 * ```tsx
 * <Breadcrumbs />
 * <Breadcrumbs items={[
 *   { label: "Dashboard", href: "/dashboard" },
 *   { label: "Bookings", href: "/dashboard/bookings" },
 *   { label: "Booking #123", href: "/dashboard/bookings/123" },
 * ]} />
 * ```
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
}) => {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbs = items || generateBreadcrumbs(pathname);

  // Don't show breadcrumbs on home page or if only one item
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("py-3", className)}>
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-2">
              {/* Breadcrumb Item */}
              {isLast ? (
                <span className="text-text-primary font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                  {/* Separator */}
                  <svg
                    className="h-4 w-4 text-text-secondary shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

/**
 * Generate breadcrumbs from pathname
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Always start with Home
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  // Skip if on home page
  if (pathname === "/") {
    return breadcrumbs;
  }

  // Split pathname into segments
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumbs
  let currentPath = "";
  segments.forEach((segment) => {
    currentPath += `/${segment}`;

    // Format label (capitalize, replace hyphens with spaces)
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  return breadcrumbs;
}
