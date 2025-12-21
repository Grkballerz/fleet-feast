"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { MessageThread } from "@/components/messages/MessageThread";
import {
  ProposalCard,
  type Proposal,
  type BookingStatus,
} from "@/components/booking/ProposalCard";

interface ConversationData {
  booking: {
    id: string;
    eventDate: string;
    status: BookingStatus;
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
      name: string;
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
 * Message Thread Page (Customer)
 *
 * Displays full conversation for a specific booking.
 * Shows messages grouped by date with auto-scroll and message composer.
 */
export default function MessageThreadPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch conversation
  const fetchConversation = async () => {
    try {
      setError(null);

      const response = await fetch(`/api/messages/${bookingId}`);
      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }

      const data = await response.json();
      setConversation(data.data);

      // Set current user ID from the conversation data
      if (data.data?.booking?.customer?.id) {
        setCurrentUserId(data.data.booking.customer.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle accept proposal
  const handleAccept = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to accept proposal");
      }

      // Navigate to payment page
      router.push(`/customer/booking/${bookingId}/payment`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept proposal");
      setIsProcessing(false);
    }
  };

  // Handle decline proposal
  const handleDecline = async () => {
    if (!confirm("Are you sure you want to decline this proposal?")) {
      return;
    }

    try {
      setIsProcessing(true);
      const response = await fetch(`/api/bookings/${bookingId}/decline`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to decline proposal");
      }

      // Refresh conversation to show updated status
      await fetchConversation();
      setIsProcessing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline proposal");
      setIsProcessing(false);
    }
  };

  // Check if booking has a proposal
  const hasProposal =
    conversation?.booking &&
    conversation.booking.proposalAmount !== undefined &&
    conversation.booking.proposalAmount !== null &&
    conversation.booking.proposalDetails !== undefined &&
    conversation.booking.proposalDetails !== null &&
    conversation.booking.proposalSentAt !== undefined &&
    conversation.booking.proposalSentAt !== null &&
    conversation.booking.proposalExpiresAt !== undefined &&
    conversation.booking.proposalExpiresAt !== null;

  // Get status banner message
  const getStatusBanner = () => {
    const status = conversation?.booking?.status;

    switch (status) {
      case "INQUIRY":
        return {
          variant: "info" as const,
          message: "Waiting for vendor proposal...",
        };
      case "PROPOSAL_SENT":
        return null; // ProposalCard will be shown
      case "ACCEPTED":
        return {
          variant: "success" as const,
          message: "Proposal accepted! Proceed to payment to confirm your booking.",
        };
      case "DECLINED":
        return {
          variant: "warning" as const,
          message: "You declined this proposal. The vendor may send a revised proposal.",
        };
      default:
        if (hasProposal) {
          const expiresAt = new Date(conversation!.booking.proposalExpiresAt!);
          if (expiresAt < new Date()) {
            return {
              variant: "warning" as const,
              message: "This proposal has expired. Contact the vendor for a new proposal.",
            };
          }
        }
        return null;
    }
  };

  const statusBanner = getStatusBanner();

  useEffect(() => {
    fetchConversation();

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversation, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

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
          onClick={() => router.push("/customer/messages")}
          className="mt-4"
          iconLeft={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="neo-glass-header neo-border-b px-4 py-3 flex items-center gap-4">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/customer/messages")}
          iconLeft={<ArrowLeft className="w-4 h-4" />}
          className="shrink-0"
        >
          Back
        </Button>

        {/* Conversation info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-text-primary truncate">
            {conversation.booking?.vendor?.businessName || "Vendor"}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">
              Event: {conversation.booking?.eventDate ? new Date(conversation.booking.eventDate).toLocaleDateString() : "N/A"}
            </span>
            <Badge
              variant={
                conversation.booking?.status === "CONFIRMED"
                  ? "success"
                  : conversation.booking?.status === "CANCELLED"
                  ? "error"
                  : "warning"
              }
              size="sm"
            >
              {conversation.booking?.status || "Unknown"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {/* Status Banner */}
          {statusBanner && (
            <Alert variant={statusBanner.variant}>
              {statusBanner.message}
            </Alert>
          )}

          {/* Proposal Card */}
          {hasProposal && (
            <ProposalCard
              proposal={{
                amount: conversation!.booking.proposalAmount!,
                details: conversation!.booking.proposalDetails!,
                sentAt: conversation!.booking.proposalSentAt!,
                expiresAt: conversation!.booking.proposalExpiresAt!,
              }}
              status={conversation!.booking.status}
              isCustomer={true}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onProceedToPayment={() => router.push(`/customer/booking/${bookingId}/payment`)}
              isLoading={isProcessing}
            />
          )}

          {/* Messages */}
          <MessageThread
            bookingId={bookingId}
            messages={conversation.messages || []}
            currentUserId={currentUserId}
            bookingStatus={conversation.booking?.status || "PENDING"}
            onRefresh={fetchConversation}
          />
        </div>
      </div>
    </div>
  );
}
