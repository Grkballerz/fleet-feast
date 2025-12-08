import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge color variant
   */
  variant?: "success" | "warning" | "error" | "neutral" | "primary";
  /**
   * Badge size
   */
  size?: "sm" | "md";
}

/**
 * Badge Component
 *
 * Status badge component for displaying labels, statuses, and tags.
 * Supports multiple color variants and sizes.
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning">Pending</Badge>
 * <Badge variant="error">Cancelled</Badge>
 * <Badge variant="neutral" size="sm">Draft</Badge>
 * <Badge variant="primary">Featured</Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "neutral",
      size = "md",
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      "inline-flex items-center rounded-neo neo-border-thin font-bold transition-colors";

    // Variant-specific styles
    const variantStyles = {
      success: "bg-success/10 text-success border-success",
      warning: "bg-warning/10 text-warning border-warning",
      error: "bg-error/10 text-error border-error",
      neutral: "bg-secondary text-text-secondary border-gray-300",
      primary: "bg-primary/10 text-primary border-primary",
    };

    // Size-specific styles
    const sizeStyles = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

/**
 * DotBadge Component
 *
 * Badge with a colored dot indicator (useful for statuses).
 *
 * @example
 * ```tsx
 * <DotBadge variant="success">Online</DotBadge>
 * <DotBadge variant="error">Offline</DotBadge>
 * ```
 */
export const DotBadge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", children, ...props }, ref) => {
    // Dot color based on variant
    const dotColorStyles = {
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-error",
      neutral: "bg-gray-400",
      primary: "bg-primary",
    };

    return (
      <Badge ref={ref} variant={variant} className={cn("gap-1.5", className)} {...props}>
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColorStyles[variant])}
          aria-hidden="true"
        />
        {children}
      </Badge>
    );
  }
);

DotBadge.displayName = "DotBadge";
