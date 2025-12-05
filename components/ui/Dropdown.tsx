"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  divider?: boolean;
  destructive?: boolean;
}

export interface DropdownProps {
  /**
   * Trigger element (usually a button or avatar)
   */
  trigger: React.ReactNode;
  /**
   * Dropdown menu items
   */
  items: DropdownItem[];
  /**
   * Alignment of dropdown relative to trigger
   */
  align?: "left" | "right";
  /**
   * Additional CSS classes for dropdown container
   */
  className?: string;
}

/**
 * Dropdown Component
 *
 * Accessible dropdown menu with keyboard navigation.
 * Closes on outside click, escape key, or item selection.
 *
 * @example
 * ```tsx
 * <Dropdown
 *   trigger={<Button>Menu</Button>}
 *   items={[
 *     { label: "Profile", href: "/profile", icon: <UserIcon /> },
 *     { label: "Settings", href: "/settings" },
 *     { label: "Logout", onClick: handleLogout, destructive: true },
 *   ]}
 *   align="right"
 * />
 * ```
 */
export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = "left",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Get valid (non-divider) items
  const validItems = items.filter(item => !item.divider);

  // Focus management when dropdown opens
  useEffect(() => {
    if (isOpen && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  // Arrow key navigation handler - WCAG 2.1.1
  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % validItems.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + validItems.length) % validItems.length);
        break;
      case "Home":
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusedIndex(validItems.length - 1);
        break;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[200px] rounded-lg border border-border bg-white shadow-lg",
            align === "right" ? "right-0" : "left-0",
            className
          )}
          role="menu"
          onKeyDown={handleMenuKeyDown}
        >
          <div className="py-1">
            {items.map((item, index) => {
              // Divider
              if (item.divider) {
                return (
                  <div
                    key={`divider-${index}`}
                    className="my-1 border-t border-border"
                  />
                );
              }

              // Get valid item index for ref array
              const validItemIndex = validItems.findIndex(vi => vi.label === item.label);

              // Menu item
              const itemClasses = cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                "hover:bg-secondary focus:bg-secondary focus:outline-none",
                item.destructive
                  ? "text-error hover:bg-error/10 focus:bg-error/10"
                  : "text-text-primary"
              );

              if (item.href) {
                return (
                  <a
                    key={index}
                    ref={(el) => (itemRefs.current[validItemIndex] = el)}
                    href={item.href}
                    className={itemClasses}
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && (
                      <span className="inline-flex shrink-0 h-5 w-5">
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </a>
                );
              }

              return (
                <button
                  key={index}
                  ref={(el) => (itemRefs.current[validItemIndex] = el)}
                  className={cn(itemClasses, "w-full text-left")}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => handleItemClick(item)}
                >
                  {item.icon && (
                    <span className="inline-flex shrink-0 h-5 w-5">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
