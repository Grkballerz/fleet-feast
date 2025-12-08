"use client";

import React, { useEffect, useRef } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";

export interface MessageThreadProps {
  /**
   * Booking ID for the conversation
   */
  bookingId: string;
  /**
   * Messages in the thread
   */
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date | string;
    flagged: boolean;
    flagReason?: string;
    sender: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
  }>;
  /**
   * Current user ID to determine message ownership
   */
  currentUserId: string;
  /**
   * Booking status (to disable composer if cancelled)
   */
  bookingStatus?: string;
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  /**
   * Error state
   */
  error?: string;
  /**
   * Callback to refresh messages
   */
  onRefresh?: () => void;
}

/**
 * Group messages by date
 */
function groupMessagesByDate(
  messages: MessageThreadProps["messages"]
): Map<string, MessageThreadProps["messages"]> {
  const grouped = new Map<string, MessageThreadProps["messages"]>();

  messages.forEach((message) => {
    const date = typeof message.createdAt === "string"
      ? new Date(message.createdAt)
      : message.createdAt;

    let dateLabel: string;
    if (isToday(date)) {
      dateLabel = "Today";
    } else if (isYesterday(date)) {
      dateLabel = "Yesterday";
    } else {
      dateLabel = format(date, "MMMM d, yyyy");
    }

    const existing = grouped.get(dateLabel) || [];
    existing.push(message);
    grouped.set(dateLabel, existing);
  });

  return grouped;
}

/**
 * MessageThread Component
 *
 * Displays a full conversation thread with messages grouped by date.
 * Includes auto-scroll to latest message and message composer.
 *
 * @example
 * ```tsx
 * <MessageThread
 *   bookingId="booking_123"
 *   messages={messages}
 *   currentUserId="user_123"
 *   bookingStatus="CONFIRMED"
 *   onRefresh={() => mutate()}
 * />
 * ```
 */
export const MessageThread: React.FC<MessageThreadProps> = ({
  bookingId,
  messages,
  currentUserId,
  bookingStatus,
  isLoading,
  error,
  onRefresh,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Mark messages as read when viewing thread
  useEffect(() => {
    const markAsRead = async () => {
      try {
        await fetch(`/api/messages/${bookingId}/read`, { method: "PUT" });
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    };

    markAsRead();
  }, [bookingId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="error">
          {error}
        </Alert>
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        </div>
        <MessageComposer
          bookingId={bookingId}
          onSend={onRefresh}
          disabled={bookingStatus === "CANCELLED"}
        />
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full neo-glass">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.from(groupedMessages.entries()).map(([dateLabel, dateMessages]) => (
          <div key={dateLabel}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="neo-glass-card neo-border rounded-neo text-gray-600 text-xs font-medium px-3 py-1">
                {dateLabel}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender.id === currentUserId}
              />
            ))}
          </div>
        ))}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message composer */}
      <MessageComposer
        bookingId={bookingId}
        onSend={onRefresh}
        disabled={bookingStatus === "CANCELLED"}
      />
    </div>
  );
};
