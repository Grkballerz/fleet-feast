"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  /**
   * User name for generating initials
   */
  name?: string;
  /**
   * Avatar image URL
   */
  src?: string;
  /**
   * Alt text for image
   */
  alt?: string;
  /**
   * Avatar size
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Avatar Component
 *
 * Displays user avatar with fallback to initials or default icon.
 * Supports multiple sizes and image loading.
 *
 * @example
 * ```tsx
 * <Avatar name="John Doe" src="/avatar.jpg" size="md" />
 * <Avatar name="Jane Smith" size="lg" />
 * ```
 */
export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  alt,
  size = "md",
  className,
}) => {
  const [imageError, setImageError] = React.useState(false);

  // Extract initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Size-specific styles
  const sizeStyles = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const baseStyles =
    "relative inline-flex items-center justify-center rounded-full bg-primary text-white font-semibold overflow-hidden ring-2 ring-white";

  // Show image if available and not errored
  if (src && !imageError) {
    return (
      <div className={cn(baseStyles, sizeStyles[size], className)}>
        <img
          src={src}
          alt={alt || name || "User avatar"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Show initials if name is provided
  if (name) {
    return (
      <div className={cn(baseStyles, sizeStyles[size], className)}>
        <span>{getInitials(name)}</span>
      </div>
    );
  }

  // Default fallback - user icon
  return (
    <div className={cn(baseStyles, sizeStyles[size], className)}>
      <svg
        className="h-3/5 w-3/5 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
};
