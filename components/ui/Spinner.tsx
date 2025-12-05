import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Spinner size
   */
  size?: "sm" | "md" | "lg";
  /**
   * Optional label text (shown below spinner)
   */
  label?: string;
  /**
   * Color variant
   */
  variant?: "primary" | "white" | "current";
}

/**
 * Spinner Component
 *
 * Loading spinner with multiple sizes and color variants.
 * Includes proper accessibility attributes for screen readers.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" label="Loading..." />
 * <Spinner variant="white" />
 * ```
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size = "md",
      label,
      variant = "primary",
      ...props
    },
    ref
  ) => {
    // Size-specific dimensions
    const sizeStyles = {
      sm: "h-4 w-4 border-2",
      md: "h-8 w-8 border-2",
      lg: "h-12 w-12 border-3",
    };

    // Color variants
    const variantStyles = {
      primary: "border-primary/20 border-t-primary",
      white: "border-white/20 border-t-white",
      current: "border-current/20 border-t-current",
    };

    return (
      <div
        ref={ref}
        className={cn("inline-flex flex-col items-center justify-center gap-3", className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
        {...props}
      >
        <div
          className={cn(
            "animate-spin rounded-full",
            sizeStyles[size],
            variantStyles[variant]
          )}
          aria-hidden="true"
        />
        {label && (
          <span className="text-sm text-text-secondary">{label}</span>
        )}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

/**
 * FullPageSpinner Component
 *
 * Centered full-page loading spinner.
 * Typically used for page-level loading states.
 *
 * @example
 * ```tsx
 * <FullPageSpinner label="Loading page..." />
 * ```
 */
export const FullPageSpinner = forwardRef<HTMLDivElement, Omit<SpinnerProps, "size">>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50",
        className
      )}
    >
      <Spinner ref={ref} size="lg" {...props} />
    </div>
  )
);

FullPageSpinner.displayName = "FullPageSpinner";
