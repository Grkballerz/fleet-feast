/**
 * BookingStatusBadge Component
 * Displays booking status with proper styling and context-aware labels
 *
 * Features:
 * - Different labels for customer vs vendor views
 * - Color-coded badges based on status
 * - Expiration warnings for proposals
 */

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Clock } from "lucide-react";
import { differenceInHours } from "date-fns";

type BookingStatus =
  | "INQUIRY"
  | "PROPOSAL_SENT"
  | "ACCEPTED"
  | "PAID"
  | "CONFIRMED"
  | "COMPLETED"
  | "DECLINED"
  | "EXPIRED"
  | "CANCELLED";

type BadgeVariant = "primary" | "success" | "warning" | "error" | "neutral";

interface BookingStatusBadgeProps {
  status: BookingStatus;
  viewType: "customer" | "vendor";
  proposalExpiresAt?: Date | string | null;
  className?: string;
}

interface StatusConfig {
  customerLabel: string;
  vendorLabel: string;
  variant: BadgeVariant;
}

const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  INQUIRY: {
    customerLabel: "Inquiry Sent",
    vendorLabel: "New Inquiry",
    variant: "primary",
  },
  PROPOSAL_SENT: {
    customerLabel: "Proposal Received",
    vendorLabel: "Proposal Sent",
    variant: "warning",
  },
  ACCEPTED: {
    customerLabel: "Accepted - Pay Now",
    vendorLabel: "Accepted",
    variant: "success",
  },
  PAID: {
    customerLabel: "Payment Complete",
    vendorLabel: "Payment Complete",
    variant: "success",
  },
  CONFIRMED: {
    customerLabel: "Confirmed",
    vendorLabel: "Confirmed",
    variant: "success",
  },
  COMPLETED: {
    customerLabel: "Completed",
    vendorLabel: "Completed",
    variant: "neutral",
  },
  DECLINED: {
    customerLabel: "Declined",
    vendorLabel: "Declined",
    variant: "error",
  },
  EXPIRED: {
    customerLabel: "Expired",
    vendorLabel: "Expired",
    variant: "neutral",
  },
  CANCELLED: {
    customerLabel: "Cancelled",
    vendorLabel: "Cancelled",
    variant: "error",
  },
};

export function BookingStatusBadge({
  status,
  viewType,
  proposalExpiresAt,
  className,
}: BookingStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const label = viewType === "customer" ? config.customerLabel : config.vendorLabel;

  // Check for expiration warning (< 48 hours for PROPOSAL_SENT)
  const showExpirationWarning =
    status === "PROPOSAL_SENT" && proposalExpiresAt;

  let hoursUntilExpiration = 0;
  if (showExpirationWarning) {
    const expiryDate =
      typeof proposalExpiresAt === "string"
        ? new Date(proposalExpiresAt)
        : proposalExpiresAt;
    hoursUntilExpiration = differenceInHours(expiryDate!, new Date());
  }

  const isExpiringSoon = hoursUntilExpiration > 0 && hoursUntilExpiration < 48;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className={className}>
        {label}
      </Badge>
      {isExpiringSoon && (
        <div className="flex items-center gap-1 text-xs text-warning">
          <Clock className="h-3 w-3" />
          <span>{hoursUntilExpiration}h left</span>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to determine if a status should show quick actions
 */
export function getQuickActions(status: BookingStatus, viewType: "customer" | "vendor") {
  if (viewType === "customer") {
    if (status === "PROPOSAL_SENT") return ["view_proposal"];
    if (status === "ACCEPTED") return ["pay_now"];
    return [];
  }

  if (viewType === "vendor") {
    if (status === "INQUIRY") return ["send_proposal"];
    if (status === "PROPOSAL_SENT") return ["view_proposal"];
    return [];
  }

  return [];
}

/**
 * Helper function to determine if proposal amount should be shown
 */
export function shouldShowProposalAmount(status: BookingStatus): boolean {
  return ["PROPOSAL_SENT", "ACCEPTED", "PAID", "CONFIRMED"].includes(status);
}
