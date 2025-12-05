"use client";

import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Alert variant (determines color and icon)
   */
  variant?: "success" | "warning" | "error" | "info";
  /**
   * Alert title (optional)
   */
  title?: string;
  /**
   * Whether the alert can be dismissed
   */
  dismissible?: boolean;
  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void;
}

/**
 * Alert Component
 *
 * Notification/alert component with multiple variants and optional dismiss button.
 * Can be used for inline alerts or as toast notifications.
 *
 * @example
 * ```tsx
 * <Alert variant="success" title="Success!">
 *   Your booking has been confirmed.
 * </Alert>
 *
 * <Alert variant="error" dismissible onDismiss={() => setError(null)}>
 *   An error occurred. Please try again.
 * </Alert>
 *
 * <Alert variant="info" title="Pro Tip">
 *   Book early to secure the best food trucks!
 * </Alert>
 * ```
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "info",
      title,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    // Variant-specific styles and icons
    const variantConfig = {
      success: {
        containerStyles: "bg-success/10 border-success/20 text-success",
        iconStyles: "text-success",
        Icon: CheckCircle,
      },
      warning: {
        containerStyles: "bg-warning/10 border-warning/20 text-warning",
        iconStyles: "text-warning",
        Icon: AlertTriangle,
      },
      error: {
        containerStyles: "bg-error/10 border-error/20 text-error",
        iconStyles: "text-error",
        Icon: XCircle,
      },
      info: {
        containerStyles: "bg-primary/10 border-primary/20 text-primary",
        iconStyles: "text-primary",
        Icon: Info,
      },
    };

    const config = variantConfig[variant];
    const IconComponent = config.Icon;

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg border p-4 animate-slideIn",
          config.containerStyles,
          dismissible && "pr-12",
          className
        )}
        role="alert"
        aria-live="polite"
        {...props}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="shrink-0 mt-0.5">
            <IconComponent
              className={cn("h-5 w-5", config.iconStyles)}
              aria-hidden="true"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-semibold mb-1 text-text-primary">{title}</h4>
            )}
            <div className="text-sm text-text-primary">{children}</div>
          </div>
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-3 top-3 rounded-lg p-1 text-text-secondary hover:text-text-primary hover:bg-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

/**
 * Toast Component
 *
 * Toast notification variant with slide-in animation.
 * Typically used with a toast manager/portal.
 *
 * @example
 * ```tsx
 * <Toast variant="success" dismissible onDismiss={handleDismiss}>
 *   Item added to cart
 * </Toast>
 * ```
 */
export const Toast = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, ...props }, ref) => (
    <Alert
      ref={ref}
      className={cn(
        "shadow-lg min-w-[300px] max-w-md animate-slideIn",
        className
      )}
      {...props}
    />
  )
);

Toast.displayName = "Toast";
