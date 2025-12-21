"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, differenceInHours } from "date-fns";

export interface ProposalLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ProposalDetails {
  lineItems: ProposalLineItem[];
  inclusions: string[];
  terms?: string;
}

export interface Proposal {
  amount: number;
  details: ProposalDetails;
  sentAt: string;
  expiresAt: string;
}

export type BookingStatus =
  | "PENDING"
  | "PROPOSAL_SENT"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED"
  | "COMPLETED"
  | "DISPUTED";

export interface ProposalCardProps {
  /**
   * The proposal data
   */
  proposal: Proposal;
  /**
   * Current booking status
   */
  status: BookingStatus;
  /**
   * Whether the current user is a customer (shows accept/decline actions)
   */
  isCustomer: boolean;
  /**
   * Callback when proposal is accepted
   */
  onAccept?: () => void;
  /**
   * Callback when proposal is declined
   */
  onDecline?: () => void;
  /**
   * Whether an action is currently loading
   */
  isLoading?: boolean;
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * ProposalCard Component
 *
 * Displays vendor proposals in booking message threads with:
 * - Clear pricing breakdown with line items
 * - Inclusions list with checkmarks
 * - Optional collapsible terms section
 * - Expiration countdown
 * - Accept/Decline actions for customers
 * - Status badges for vendors
 *
 * @example
 * ```tsx
 * <ProposalCard
 *   proposal={{
 *     amount: 1500,
 *     details: {
 *       lineItems: [
 *         { name: "Base Service", quantity: 1, unitPrice: 1000, total: 1000 },
 *         { name: "Extra Hour", quantity: 2, unitPrice: 250, total: 500 }
 *       ],
 *       inclusions: ["Setup & cleanup", "Serving supplies", "Staff"],
 *       terms: "50% deposit required..."
 *     },
 *     sentAt: "2024-01-15T10:00:00Z",
 *     expiresAt: "2024-01-22T10:00:00Z"
 *   }}
 *   status="PROPOSAL_SENT"
 *   isCustomer={true}
 *   onAccept={handleAccept}
 *   onDecline={handleDecline}
 * />
 * ```
 */
export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  status,
  isCustomer,
  onAccept,
  onDecline,
  isLoading = false,
  className,
}) => {
  const [termsExpanded, setTermsExpanded] = useState(false);

  // Calculate expiration status
  const expiresAt = new Date(proposal.expiresAt);
  const now = new Date();
  const isExpired = expiresAt < now;
  const hoursUntilExpiry = differenceInHours(expiresAt, now);
  const isExpiringSoon = hoursUntilExpiry < 48 && !isExpired;

  // Determine card styling based on status
  const getBorderStyle = () => {
    switch (status) {
      case "ACCEPTED":
        return "border-success border-2";
      case "DECLINED":
        return "border-error border-2";
      case "PROPOSAL_SENT":
        return isExpired
          ? "border-gray-300 border-2"
          : "border-primary border-2";
      default:
        return "border-gray-300";
    }
  };

  // Status badge configuration
  const getStatusBadge = () => {
    if (isExpired && status === "PROPOSAL_SENT") {
      return (
        <Badge variant="neutral" className="bg-gray-400 text-white">
          Expired
        </Badge>
      );
    }

    switch (status) {
      case "ACCEPTED":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        );
      case "DECLINED":
        return (
          <Badge variant="error" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Declined
          </Badge>
        );
      case "PROPOSAL_SENT":
        return (
          <Badge variant="primary" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Proposal Sent
          </Badge>
        );
      default:
        return null;
    }
  };

  // Expiration warning
  const getExpirationWarning = () => {
    if (isExpired || status !== "PROPOSAL_SENT") return null;

    if (isExpiringSoon) {
      return (
        <div className="flex items-center gap-2 text-warning text-sm">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">
            Expires in {formatDistanceToNow(expiresAt)}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-text-secondary text-sm">
        <Clock className="h-4 w-4" />
        <span>Expires {formatDistanceToNow(expiresAt, { addSuffix: true })}</span>
      </div>
    );
  };

  // Should show accept/decline buttons
  const showActions =
    isCustomer && status === "PROPOSAL_SENT" && !isExpired;

  return (
    <Card
      className={cn(
        "neo-card-glass rounded-neo p-6 transition-all duration-normal",
        getBorderStyle(),
        className
      )}
    >
      <CardHeader className="mb-4 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="heading-3 mb-2">Vendor Proposal</h3>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              {getExpirationWarning()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-text-secondary mb-1">Total Amount</div>
            <div className="text-2xl font-bold text-primary">
              ${proposal.amount.toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* Line Items Table */}
        {proposal.details.lineItems.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-text-secondary mb-3 uppercase tracking-wide">
              Price Breakdown
            </h4>
            <div className="neo-card-glass rounded-neo overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-text-secondary">
                      Item
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-text-secondary">
                      Qty
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-text-secondary">
                      Unit Price
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-text-secondary">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {proposal.details.lineItems.map((item, index) => (
                    <tr key={index} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-center text-text-secondary">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inclusions List */}
        {proposal.details.inclusions.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-text-secondary mb-3 uppercase tracking-wide">
              Included Services
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {proposal.details.inclusions.map((inclusion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span className="text-sm text-text-primary">{inclusion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms Section (Collapsible) */}
        {proposal.details.terms && (
          <div>
            <button
              onClick={() => setTermsExpanded(!termsExpanded)}
              className="flex items-center justify-between w-full text-left font-semibold text-sm text-text-secondary mb-2 uppercase tracking-wide hover:text-primary transition-colors"
              aria-expanded={termsExpanded}
              aria-controls="proposal-terms"
            >
              <span>Terms & Conditions</span>
              {termsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {termsExpanded && (
              <div
                id="proposal-terms"
                className="neo-card-glass rounded-neo p-4 text-sm text-text-secondary whitespace-pre-line"
              >
                {proposal.details.terms}
              </div>
            )}
          </div>
        )}

        {/* Status-specific messages */}
        {status === "ACCEPTED" && (
          <div className="neo-card-glass bg-success/10 border-success rounded-neo p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-success mb-1">Proposal Accepted</p>
                <p className="text-sm text-text-secondary">
                  {isCustomer
                    ? "You've accepted this proposal. Proceed to payment to confirm your booking."
                    : "The customer has accepted your proposal. Awaiting payment."}
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "DECLINED" && (
          <div className="neo-card-glass bg-error/10 border-error rounded-neo p-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-error mb-1">Proposal Declined</p>
                <p className="text-sm text-text-secondary">
                  {isCustomer
                    ? "You've declined this proposal. The vendor may send a revised proposal."
                    : "The customer has declined this proposal. Consider sending a revised offer."}
                </p>
              </div>
            </div>
          </div>
        )}

        {isExpired && status === "PROPOSAL_SENT" && (
          <div className="neo-card-glass bg-gray-100 border-gray-300 rounded-neo p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-600 mb-1">Proposal Expired</p>
                <p className="text-sm text-text-secondary">
                  {isCustomer
                    ? "This proposal has expired. Contact the vendor for a new proposal."
                    : "This proposal has expired. Send a new proposal to continue."}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardBody>

      {/* Action Buttons for Customer */}
      {showActions && (
        <CardFooter className="mt-6 pt-6 border-t border-border">
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={onDecline}
              disabled={isLoading}
              className="flex-1"
              iconLeft={<XCircle className="h-4 w-4" />}
            >
              Decline
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onAccept}
              loading={isLoading}
              disabled={isLoading}
              className="flex-1"
              iconLeft={<CheckCircle className="h-4 w-4" />}
            >
              Accept & Proceed to Payment
            </Button>
          </div>
        </CardFooter>
      )}

      {/* Link to Payment for Accepted Proposals */}
      {status === "ACCEPTED" && isCustomer && (
        <CardFooter className="mt-6 pt-6 border-t border-border">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            iconLeft={<DollarSign className="h-4 w-4" />}
          >
            Proceed to Payment
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

ProposalCard.displayName = "ProposalCard";
