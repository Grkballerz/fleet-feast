"use client";

import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { SimpleTooltip } from "@/components/ui/Tooltip";

export interface FlaggedWarningProps {
  /**
   * Reason why the message was flagged
   */
  reason?: string;
}

/**
 * FlaggedWarning Component
 *
 * Displays a warning indicator for flagged messages with tooltip explanation.
 * Shows why the message was flagged and links to platform rules.
 *
 * @example
 * ```tsx
 * <FlaggedWarning reason="Potential contact information detected" />
 * <FlaggedWarning />
 * ```
 */
export const FlaggedWarning: React.FC<FlaggedWarningProps> = ({ reason }) => {
  const defaultReason = "Potential contact information detected";

  return (
    <div className="flex items-center gap-1 text-amber-600 text-sm mb-1">
      <AlertTriangle className="w-4 h-4" aria-hidden="true" />
      <span>This message was flagged</span>
      <SimpleTooltip
        content={
          <div className="max-w-xs">
            <p className="font-medium mb-1">Why was this flagged?</p>
            <p className="text-sm mb-2">{reason || defaultReason}</p>
            <p className="text-sm">
              Sharing contact information outside the platform violates our{" "}
              <a
                href="/terms"
                className="underline hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>
              .
            </p>
          </div>
        }
        side="top"
      >
        <Info className="w-4 h-4 cursor-help" aria-label="More information" />
      </SimpleTooltip>
    </div>
  );
};
