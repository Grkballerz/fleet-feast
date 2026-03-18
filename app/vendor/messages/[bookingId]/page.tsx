"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { MessageThread } from "@/components/messages/MessageThread";
import { ProposalBuilder } from "@/components/booking/ProposalBuilder";
import { ProposalCard } from "@/components/booking/ProposalCard";
import type { EventType } from "@prisma/client";

interface ConversationData {
  booking: {
    id: string;
    eventDate: string;
    eventTime: string;
    eventType: EventType;
    location: string;
    guestCount: number;
    specialRequests?: string;
    status: string;
    proposalAmount?: number;
    proposalDetails?: {
      lineItems: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>;
      inclusions: string[];
      terms?: string;
    };
    proposalSentAt?: string;
    proposalExpiresAt?: string;
    vendor: {
      id: string;
      businessName: string;
      avatarUrl?: string;
    };
    customer: {
      id: string;
      name?: string;
      email?: string;
    };
  };
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    flagged: boolean;
    flagReason?: string;
    sender: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
  }>;
}

/**
 * Message Thread Page (Vendor)
 *
 * Displays full conversation for a specific booking with proposal management.
 * - Shows messages grouped by date with auto-scroll and message composer
 * - Allows sending proposals on INQUIRY status bookings
 * - Displays sent proposals with status indicators
 */
export default function MessageThreadPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProposalBuilder, setShowProposalBuilder] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Fetch conversation
  const fetchConversation = async () => {
    try {
      setError(null);

      const response = await fetch(`/api/messages/${bookingId}`);
      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }

      const data = await response.json();
      const convoData = data.data || data;
      setConversation(convoData);

      // Set current user ID from the conversation data (vendor in this case)
      if (convoData?.booking?.vendor?.id) {
        setCurrentUserId(convoData.booking.vendor.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversation, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  // Handle proposal submission
  const handleSendProposal = async (proposalData: any) => {
    setIsSending(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/proposal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalAmount: proposalData.subtotal,
          proposalDetails: {
            lineItems: proposalData.lineItems,
            inclusions: proposalData.inclusions,
            terms: proposalData.terms,
          },
          expiresInDays: proposalData.expirationDays,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to send proposal");
      }

      // Success - close modal and refresh
      setShowProposalBuilder(false);
      await fetchConversation();
      router.refresh();
    } catch (err) {
      console.error("Error sending proposal:", err);
      setError(err instanceof Error ? err.message : "Failed to send proposal");
    } finally {
      setIsSending(false);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "ACCEPTED":
        return "success";
      case "CANCELLED":
      case "DECLINED":
        return "error";
      case "INQUIRY":
        return "primary";
      case "PROPOSAL_SENT":
        return "warning";
      default:
        return "neutral";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  // Error state
  if (error || !conversation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="error">
          {error || "Conversation not found"}
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push("/vendor/messages")}
          className="mt-4"
          iconLeft={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Messages
        </Button>
      </div>
    );
  }

  const { booking } = conversation;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="neo-glass-header neo-border-b px-4 py-3 flex items-center gap-4">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/vendor/messages")}
          iconLeft={<ArrowLeft className="w-4 h-4" />}
          className="shrink-0"
        >
          Back
        </Button>

        {/* Conversation info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-text-primary truncate">
            {booking?.customer?.name || booking?.customer?.email || "Customer"}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">
              Event: {booking?.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "N/A"}
            </span>
            <Badge
              variant={getStatusBadgeVariant(booking?.status)}
              size="sm"
            >
              {booking?.status || "Unknown"}
            </Badge>
          </div>
        </div>

        {/* Send Proposal Button - Show only for INQUIRY status */}
        {booking?.status === "INQUIRY" && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowProposalBuilder(true)}
            iconLeft={<Send className="w-4 h-4" />}
            className="shrink-0"
          >
            Send Proposal
          </Button>
        )}
      </div>

      {/* Status-specific banner */}
      {booking?.status === "INQUIRY" && (
        <div className="px-4 py-3 bg-primary/10 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <p className="text-sm text-text-primary">
              <strong>Customer Inquiry:</strong> Review the event details and send a proposal to proceed.
            </p>
          </div>
        </div>
      )}

      {booking?.status === "PROPOSAL_SENT" && (
        <div className="px-4 py-3 bg-warning/10 border-b border-warning/20">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-warning" />
            <p className="text-sm text-text-primary">
              <strong>Proposal Sent:</strong> Awaiting customer response.
            </p>
          </div>
        </div>
      )}

      {booking?.status === "ACCEPTED" && (
        <div className="px-4 py-3 bg-success/10 border-b border-success/20">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-success" />
            <p className="text-sm text-text-primary">
              <strong>Proposal Accepted:</strong> Awaiting customer payment to confirm booking.
            </p>
          </div>
        </div>
      )}

      {booking?.status === "DECLINED" && (
        <div className="px-4 py-3 bg-error/10 border-b border-error/20">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-error" />
            <p className="text-sm text-text-primary">
              <strong>Proposal Declined:</strong> The customer has declined your proposal. You may send a revised proposal.
            </p>
          </div>
        </div>
      )}

      {/* Proposal Card - Show for PROPOSAL_SENT, ACCEPTED, DECLINED statuses */}
      {(booking?.status === "PROPOSAL_SENT" ||
        booking?.status === "ACCEPTED" ||
        booking?.status === "DECLINED") &&
        booking?.proposalAmount &&
        booking?.proposalDetails &&
        booking?.proposalSentAt &&
        booking?.proposalExpiresAt && (
        <div className="px-4 py-4 border-b border-border">
          <ProposalCard
            proposal={{
              amount: booking.proposalAmount,
              details: booking.proposalDetails,
              sentAt: booking.proposalSentAt,
              expiresAt: booking.proposalExpiresAt,
            }}
            status={booking.status as any}
            isCustomer={false}
          />
        </div>
      )}

      {/* Message thread */}
      <div className="flex-1 overflow-hidden">
        <MessageThread
          bookingId={bookingId}
          messages={conversation.messages || []}
          currentUserId={currentUserId}
          bookingStatus={booking?.status || "PENDING"}
          onRefresh={fetchConversation}
        />
      </div>

      {/* Proposal Builder Modal */}
      {showProposalBuilder && (
        <Modal
          open={showProposalBuilder}
          onClose={() => setShowProposalBuilder(false)}
          title="Create Proposal"
          size="xl"
        >
          <ProposalBuilder
            inquiry={{
              eventDate: booking.eventDate,
              eventTime: booking.eventTime,
              guestCount: booking.guestCount,
              eventType: booking.eventType,
              location: booking.location,
              specialRequests: booking.specialRequests,
            }}
            onSubmit={handleSendProposal}
            isLoading={isSending}
          />
        </Modal>
      )}
    </div>
  );
}
