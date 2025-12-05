"use client";

import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { FlaggedWarning } from "./FlaggedWarning";

export interface MessageBubbleProps {
  /**
   * Message data
   */
  message: {
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
  };
  /**
   * Whether this message is from the current user
   */
  isOwn: boolean;
}

/**
 * MessageBubble Component
 *
 * Displays a single message in a conversation with sender info, timestamp, and flagged indicator.
 * Styled differently for own messages vs other party's messages.
 *
 * @example
 * ```tsx
 * <MessageBubble
 *   message={{
 *     id: "msg_123",
 *     content: "Hello! Is this still available?",
 *     createdAt: new Date(),
 *     flagged: false,
 *     sender: { id: "user_1", name: "John Doe" }
 *   }}
 *   isOwn={false}
 * />
 * ```
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
}) => {
  const createdAt = typeof message.createdAt === "string"
    ? new Date(message.createdAt)
    : message.createdAt;

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[80%] mb-4",
        isOwn ? "ml-auto flex-row-reverse" : ""
      )}
    >
      {/* Avatar - only show for other party */}
      {!isOwn && (
        <Avatar
          size="sm"
          name={message.sender.name}
          src={message.sender.avatarUrl}
        />
      )}

      <div className="flex flex-col gap-1">
        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isOwn
              ? "bg-primary text-white rounded-br-none"
              : "bg-gray-100 text-text-primary rounded-bl-none"
          )}
        >
          {/* Flagged warning */}
          {message.flagged && <FlaggedWarning reason={message.flagReason} />}

          {/* Message content */}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Timestamp */}
        <span
          className={cn(
            "text-xs text-gray-500 px-1",
            isOwn ? "text-right" : "text-left"
          )}
        >
          {format(createdAt, "h:mm a")}
        </span>
      </div>
    </div>
  );
};
