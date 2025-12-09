"use client";

import React, { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { ConversationCard } from "@/components/messages/ConversationCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface Conversation {
  bookingId: string;
  otherParty: {
    name: string;
    avatarUrl?: string;
  };
  booking: {
    eventDate: string;
    status: string;
    vendor: {
      businessName: string;
    };
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
  };
  unreadCount: number;
}

/**
 * Messages Page (Customer)
 *
 * Displays inbox with all conversations.
 * Shows last message, unread count, and booking context.
 */
export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/messages");
        if (!response.ok) {
          throw new Error("Failed to load conversations");
        }

        const data = await response.json();
        setConversations(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load conversations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout title="Messages">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 neo-card-glass rounded-neo p-6">
          <h1 className="text-3xl font-bold text-text-primary neo-heading">Messages</h1>
          <p className="text-text-secondary mt-2">
            Your conversations with food truck vendors
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <Alert variant="error">{error}</Alert>
        )}

        {/* Empty state */}
        {!isLoading && !error && conversations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No conversations yet</p>
            <p className="text-gray-400 text-sm">
              Your messages with vendors will appear here
            </p>
          </div>
        )}

        {/* Conversations list */}
        {!isLoading && !error && conversations.length > 0 && (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation.bookingId}
                bookingId={conversation.bookingId}
                otherParty={conversation.otherParty}
                booking={conversation.booking}
                lastMessage={conversation.lastMessage}
                unreadCount={conversation.unreadCount}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
