"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { MessageThread } from "@/components/messages/MessageThread";

interface ConversationData {
  booking: {
    id: string;
    eventDate: string;
    status: string;
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
      <div className="border-b bg-white px-4 py-3 flex items-center gap-4">
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
            {conversation.booking.vendor.businessName}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">
              Event: {new Date(conversation.booking.eventDate).toLocaleDateString()}
            </span>
            <Badge
              variant={
                conversation.booking.status === "CONFIRMED"
                  ? "success"
                  : conversation.booking.status === "CANCELLED"
                  ? "error"
                  : "warning"
              }
              size="sm"
            >
              {conversation.booking.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-hidden">
        <MessageThread
          bookingId={bookingId}
          messages={conversation.messages}
          currentUserId={currentUserId}
          bookingStatus={conversation.booking.status}
          onRefresh={fetchConversation}
        />
      </div>
    </div>
  );
}
