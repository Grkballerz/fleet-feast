"use client";

import React, { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export interface RatingProps {
  /**
   * Current rating value (1-5)
   */
  value: number;
  /**
   * Callback when rating changes (input mode only)
   */
  onChange?: (value: number) => void;
  /**
   * Maximum rating (default: 5)
   */
  max?: number;
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether rating is read-only (display mode)
   */
  readOnly?: boolean;
  /**
   * Whether to show half stars
   */
  allowHalf?: boolean;
  /**
   * Optional className for container
   */
  className?: string;
  /**
   * Show rating count next to stars
   */
  showCount?: boolean;
  /**
   * Number of ratings (for display)
   */
  count?: number;
}

/**
 * Rating Component
 *
 * Star rating component with display and input modes.
 * Supports full and half-star ratings, keyboard navigation, and accessibility.
 *
 * @example
 * ```tsx
 * // Display mode (read-only)
 * <Rating value={4.5} readOnly showCount count={124} />
 *
 * // Input mode (interactive)
 * <Rating value={rating} onChange={setRating} />
 *
 * // Large size with half-star support
 * <Rating value={rating} onChange={setRating} size="lg" allowHalf />
 * ```
 */
export const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      onChange,
      max = 5,
      size = "md",
      readOnly = false,
      allowHalf = true,
      className,
      showCount = false,
      count,
    },
    ref
  ) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    // Size-specific styles
    const sizeStyles = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    const iconSize = sizeStyles[size];

    // Handle click on star
    const handleClick = (starIndex: number, isHalf: boolean) => {
      if (readOnly || !onChange) return;
      const newValue = isHalf ? starIndex - 0.5 : starIndex;
      onChange(newValue);
    };

    // Handle mouse move over star (for hover effect)
    const handleMouseMove = (starIndex: number, event: React.MouseEvent<HTMLButtonElement>) => {
      if (readOnly || !onChange) return;

      if (allowHalf) {
        const rect = event.currentTarget.getBoundingClientRect();
        const isLeftHalf = event.clientX - rect.left < rect.width / 2;
        setHoverValue(isLeftHalf ? starIndex - 0.5 : starIndex);
      } else {
        setHoverValue(starIndex);
      }
    };

    const handleMouseLeave = () => {
      setHoverValue(null);
    };

    // Determine if a star should be filled, half-filled, or empty
    const getStarFill = (starIndex: number): "full" | "half" | "empty" => {
      const displayValue = hoverValue ?? value;

      if (displayValue >= starIndex) {
        return "full";
      } else if (allowHalf && displayValue >= starIndex - 0.5) {
        return "half";
      } else {
        return "empty";
      }
    };

    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center gap-1", className)}
        role={readOnly ? "img" : "radiogroup"}
        aria-label={`Rating: ${value} out of ${max} stars`}
      >
        <div className="flex items-center gap-0.5">
          {Array.from({ length: max }, (_, i) => {
            const starIndex = i + 1;
            const fill = getStarFill(starIndex);

            return (
              <button
                key={starIndex}
                type="button"
                onClick={(e) => {
                  if (!allowHalf || readOnly || !onChange) {
                    handleClick(starIndex, false);
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
                    handleClick(starIndex, isLeftHalf);
                  }
                }}
                onMouseMove={(e) => handleMouseMove(starIndex, e)}
                onMouseLeave={handleMouseLeave}
                disabled={readOnly}
                className={cn(
                  "relative transition-transform drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]",
                  !readOnly && "hover:scale-110 cursor-pointer",
                  readOnly && "cursor-default"
                )}
                aria-label={`Rate ${starIndex} stars`}
                role={readOnly ? "presentation" : "radio"}
                aria-checked={!readOnly && value === starIndex}
              >
                {/* Background star (empty) */}
                <Star
                  className={cn(iconSize, "text-gray-300")}
                  aria-hidden="true"
                />

                {/* Filled star overlay */}
                {fill !== "empty" && (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      width: fill === "half" ? "50%" : "100%",
                    }}
                  >
                    <Star
                      className={cn(iconSize, "text-warning fill-warning")}
                      aria-hidden="true"
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Rating count */}
        {showCount && count !== undefined && (
          <span className="ml-2 text-sm text-text-secondary">
            ({count.toLocaleString()})
          </span>
        )}
      </div>
    );
  }
);

Rating.displayName = "Rating";
