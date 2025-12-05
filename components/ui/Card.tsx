import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card visual variant
   */
  variant?: "default" | "interactive";
  /**
   * Optional header content
   */
  header?: React.ReactNode;
  /**
   * Optional footer content
   */
  footer?: React.ReactNode;
}

/**
 * Card Component
 *
 * Container component for content cards with optional header/footer.
 * Interactive variant adds hover effects and cursor pointer for clickable cards.
 *
 * @example
 * ```tsx
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * <Card variant="interactive" onClick={handleClick}>
 *   <h3>Clickable Card</h3>
 * </Card>
 *
 * <Card
 *   header={<h3>Header</h3>}
 *   footer={<Button>Action</Button>}
 * >
 *   Body content
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = "default", header, footer, children, onClick, ...props },
    ref
  ) => {
    // Base styles
    const baseStyles =
      "rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow duration-normal";

    // Variant-specific styles
    const variantStyles = {
      default: "hover:shadow-md",
      interactive:
        "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    };

    // Keyboard handler for interactive cards - WCAG 2.1.1
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (variant === "interactive" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick?.(e as any);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        tabIndex={variant === "interactive" ? 0 : undefined}
        role={variant === "interactive" ? "button" : undefined}
        onClick={variant === "interactive" ? onClick : undefined}
        onKeyDown={variant === "interactive" ? handleKeyDown : undefined}
        {...props}
      >
        {header && <div className="mb-4 border-b border-border pb-4">{header}</div>}
        <div>{children}</div>
        {footer && <div className="mt-4 border-t border-border pt-4">{footer}</div>}
      </div>
    );
  }
);

Card.displayName = "Card";

/**
 * CardHeader Component
 *
 * Semantic header section for cards.
 */
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-4 border-b border-border pb-4", className)}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

/**
 * CardBody Component
 *
 * Semantic body section for cards.
 */
export const CardBody = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));

CardBody.displayName = "CardBody";

/**
 * CardFooter Component
 *
 * Semantic footer section for cards.
 */
export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-4 border-t border-border pt-4", className)}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";
