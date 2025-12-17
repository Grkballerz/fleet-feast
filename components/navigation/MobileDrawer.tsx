"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface MobileDrawerProps {
  /**
   * Unique ID for accessibility
   */
  id?: string;
  /**
   * Whether the drawer is open
   */
  isOpen: boolean;
  /**
   * Callback to close the drawer
   */
  onClose: () => void;
  /**
   * Drawer content
   */
  children: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * MobileDrawer Component
 *
 * Slide-out drawer for mobile navigation.
 * Includes overlay, escape key handling, and body scroll lock.
 *
 * @example
 * ```tsx
 * <MobileDrawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <NavMenu items={items} mobile />
 * </MobileDrawer>
 * ```
 */
export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  id,
  isOpen,
  onClose,
  children,
  className,
}) => {
  const [mounted, setMounted] = React.useState(false);

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const drawerContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer - Slides in from RIGHT */}
      <div
        id={id}
        className={cn(
          "fixed top-0 right-0 bottom-0 w-[280px] neo-glass-brutal z-[9999] lg:hidden border-l-3 border-black",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-3 border-black">
          <h2 className="neo-heading text-lg text-text-primary">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-neo hover:bg-secondary transition-all hover:neo-shadow active:translate-x-0.5 active:translate-y-0.5"
            aria-label="Close menu"
          >
            <svg
              className="h-6 w-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-73px)] p-4">
          {children}
        </div>
      </div>
    </>
  );

  // Render drawer using Portal to escape Header's stacking context
  return createPortal(drawerContent, document.body);
};
