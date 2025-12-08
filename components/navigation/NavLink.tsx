"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavLinkProps {
  /**
   * Link destination
   */
  href: string;
  /**
   * Link label
   */
  label: string;
  /**
   * Icon element
   */
  icon?: React.ReactNode;
  /**
   * Mobile-specific styles
   */
  mobile?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Click handler
   */
  onClick?: () => void;
}

/**
 * NavLink Component
 *
 * Navigation link with active state detection.
 * Highlights when the current path matches the link href.
 *
 * @example
 * ```tsx
 * <NavLink href="/dashboard" label="Dashboard" icon={<HomeIcon />} />
 * ```
 */
export const NavLink: React.FC<NavLinkProps> = ({
  href,
  label,
  icon,
  mobile = false,
  className,
  onClick,
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const baseStyles = mobile
    ? "flex items-center gap-3 px-4 py-3 text-base font-bold rounded-neo transition-all"
    : "flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-neo transition-all";

  const activeStyles = isActive
    ? "bg-primary text-white neo-border neo-shadow hover:neo-shadow-lg hover:-translate-y-0.5"
    : "text-text-primary hover:bg-secondary hover:text-primary hover:neo-shadow active:translate-x-0.5 active:translate-y-0.5";

  return (
    <Link
      href={href}
      className={cn(baseStyles, activeStyles, className)}
      onClick={onClick}
    >
      {icon && <span className="inline-flex shrink-0 h-5 w-5">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
};
