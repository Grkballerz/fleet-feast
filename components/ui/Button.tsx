"use client";

import React, { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button visual variant
   */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  /**
   * Button size
   */
  size?: "sm" | "md" | "lg";
  /**
   * Loading state - shows spinner and disables button
   */
  loading?: boolean;
  /**
   * Icon to display on the left side
   */
  iconLeft?: React.ReactNode;
  /**
   * Icon to display on the right side
   */
  iconRight?: React.ReactNode;
}

/**
 * Button Component
 *
 * Flexible button component with multiple variants, sizes, loading states, and icon support.
 * Built with accessibility in mind - proper ARIA labels, keyboard navigation, and focus indicators.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 *
 * <Button variant="outline" loading={isLoading}>
 *   Save Changes
 * </Button>
 *
 * <Button variant="primary" iconLeft={<SearchIcon />}>
 *   Search
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      iconLeft,
      iconRight,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles shared across all variants
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";

    // Variant-specific styles
    const variantStyles = {
      primary:
        "rounded-lg bg-primary text-white hover:bg-primary-hover hover:shadow-md disabled:hover:bg-primary",
      secondary:
        "rounded-lg border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white hover:shadow-md disabled:hover:bg-transparent disabled:hover:text-primary",
      outline:
        "rounded-lg border-2 border-border bg-transparent text-text-primary hover:bg-secondary hover:border-gray-300 disabled:hover:bg-transparent",
      ghost:
        "rounded-lg bg-transparent text-text-primary hover:bg-secondary hover:shadow-sm disabled:hover:bg-transparent",
      destructive:
        "rounded-lg bg-error text-white hover:bg-error/90 hover:shadow-md disabled:hover:bg-error",
    };

    // Size-specific styles
    const sizeStyles = {
      sm: "px-4 py-2 text-sm gap-2",
      md: "px-6 py-3 text-base gap-2",
      lg: "px-8 py-4 text-lg gap-3",
    };

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-label={loading ? "Loading" : props["aria-label"]}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {iconLeft && <span className="inline-flex shrink-0">{iconLeft}</span>}
            {children}
            {iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
