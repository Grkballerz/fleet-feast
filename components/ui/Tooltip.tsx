"use client";

import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  /**
   * Tooltip content (text or React node)
   */
  content: React.ReactNode;
  /**
   * Element that triggers the tooltip
   */
  children: React.ReactNode;
  /**
   * Tooltip side position
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Delay before showing tooltip (ms)
   */
  delayDuration?: number;
  /**
   * Additional className for tooltip content
   */
  className?: string;
}

/**
 * TooltipProvider Component
 *
 * Wrap your app or specific sections with this provider to enable tooltips.
 * Usually placed in the root layout or app providers.
 */
export const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Tooltip Component
 *
 * Displays additional information on hover or focus.
 * Built on Radix UI with full accessibility support.
 *
 * @example
 * ```tsx
 * <Tooltip content="Click to copy">
 *   <Button>Copy</Button>
 * </Tooltip>
 *
 * <Tooltip
 *   content="This action cannot be undone"
 *   side="right"
 * >
 *   <Button variant="destructive">Delete</Button>
 * </Tooltip>
 *
 * <Tooltip
 *   content={
 *     <div>
 *       <p className="font-medium">Warning</p>
 *       <p className="text-sm">This will affect all users</p>
 *     </div>
 *   }
 * >
 *   <AlertIcon />
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = "top",
  delayDuration = 200,
  className,
}) => {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={5}
          className={cn(
            "z-50 overflow-hidden neo-glass-brutal rounded-neo bg-gray-900/90 px-3 py-2 text-sm text-white neo-shadow animate-in fade-in-0 zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "max-w-xs",
            className
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-gray-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};

/**
 * Simple Tooltip Wrapper
 *
 * Convenience component that includes the TooltipProvider.
 * Use this for one-off tooltips without managing providers.
 *
 * @example
 * ```tsx
 * <SimpleTooltip content="Helpful info">
 *   <InfoIcon />
 * </SimpleTooltip>
 * ```
 */
export const SimpleTooltip: React.FC<TooltipProps> = (props) => {
  return (
    <TooltipProvider>
      <Tooltip {...props} />
    </TooltipProvider>
  );
};
