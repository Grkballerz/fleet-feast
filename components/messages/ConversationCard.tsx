"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export interface ConversationCardProps {
  /**
   * Booking ID for the conversation
   */
  bookingId: string;
  /**
   * Other party in the conversation
   */
  otherParty: {
    name: string;
    avatarUrl?: string;
  };
  /**
   * Booking details for context
   */
  booking: {
    eventDate: Date | string;
    status: string;
    vendor: {
      businessName: string;
    };
  };
  /**
   * Last message in the conversation
   */
  lastMessage: {
    content: string;
    createdAt: Date | string;
    isFromMe: boolean;
  };
  /**
   * Number of unread messages
   */
  unreadCount: number;
}

/**
 * ConversationCard Component
 *
 * Displays a conversation preview in the inbox list.
 * Shows other party, last message, booking context, and unread count.
 *
 * @example
 * ```tsx
 * <ConversationCard
 *   bookingId="booking_123"
 *   otherParty={{ name: "John Doe", avatarUrl: "/avatar.jpg" }}
 *   booking={{
 *     eventDate: new Date(),
 *     status: "CONFIRMED",
 *     vendor: { businessName: "Taco Truck" }
 *   }}
 *   lastMessage={{
 *     content: "See you tomorrow!",
 *     createdAt: new Date(),
 *     isFromMe: false
 *   }}
 *   unreadCount={2}
 * />
 * ```
 */
export const ConversationCard: React.FC<ConversationCardProps> = ({
  bookingId,
  otherParty,
  booking,
  lastMessage,
  unreadCount,
}) => {
  const eventDate = typeof booking.eventDate === "string"
    ? new Date(booking.eventDate)
    : booking.eventDate;

  const messageDate = typeof lastMessage.createdAt === "string"
    ? new Date(lastMessage.createdAt)
    : lastMessage.createdAt;

  // Safely access otherParty properties with fallbacks
  const partyName = otherParty?.name || "Unknown";
  const partyAvatar = otherParty?.avatarUrl;

  return (
    <Link href={`/messages/${bookingId}`} className="block">
      <div
        className={cn(
          "neo-card-glass rounded-neo p-4 transition-all hover:neo-shadow-hover",
          unreadCount > 0 && "neo-border-primary"
        )}
      >
        <div className="flex gap-4 p-4">
          {/* Avatar */}
          <Avatar
            src={partyAvatar}
            name={partyName}
            size="md"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header row - name and timestamp */}
            <div className="flex justify-between items-start gap-2 mb-1">
              <h4 className="font-medium text-text-primary truncate">
                {partyName}
              </h4>
              <span className="text-sm text-gray-500 shrink-0">
                {formatRelativeTime(messageDate)}
              </span>
            </div>

            {/* Last message preview */}
            <p className="text-sm text-gray-600 truncate mb-2">
              {lastMessage.isFromMe && <span className="font-medium">You: </span>}
              {lastMessage.content}
            </p>

            {/* Booking context */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="neutral" size="sm">
                {booking.vendor.businessName}
              </Badge>
              <span className="text-xs text-gray-500">
                {format(eventDate, "MMM d, yyyy")}
              </span>
              {booking.status && (
                <Badge
                  variant={
                    booking.status === "CONFIRMED"
                      ? "success"
                      : booking.status === "CANCELLED"
                      ? "error"
                      : "warning"
                  }
                  size="sm"
                >
                  {booking.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <Badge variant="primary" className="self-center shrink-0">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
};
