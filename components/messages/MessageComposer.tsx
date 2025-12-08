"use client";

import React, { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";

export interface MessageComposerProps {
  /**
   * Booking ID for the conversation
   */
  bookingId: string;
  /**
   * Callback when message is sent
   */
  onSend?: () => void;
  /**
   * Whether the composer is disabled (e.g., booking cancelled)
   */
  disabled?: boolean;
}

/**
 * MessageComposer Component
 *
 * Text input component for composing and sending messages.
 * Includes client-side validation for flagged content, character limit, and pre-send warnings.
 *
 * @example
 * ```tsx
 * <MessageComposer
 *   bookingId="booking_123"
 *   onSend={() => mutate()}
 *   disabled={booking.status === 'CANCELLED'}
 * />
 * ```
 */
export const MessageComposer: React.FC<MessageComposerProps> = ({
  bookingId,
  onSend,
  disabled = false,
}) => {
  const [content, setContent] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_LENGTH = 1000;

  /**
   * Client-side pattern check (mirrors backend)
   * Detects potential contact information sharing
   */
  const checkForFlags = (text: string): string | null => {
    const patterns = [
      { regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, type: "phone number" },
      { regex: /\b[\w.-]+@[\w.-]+\.\w{2,}\b/i, type: "email address" },
      { regex: /@\w{3,}/g, type: "social media handle" },
    ];

    for (const { regex, type } of patterns) {
      if (regex.test(text)) {
        return `Your message appears to contain a ${type}. Sharing contact information is against our policies and may result in account suspension.`;
      }
    }
    return null;
  };

  /**
   * Handle textarea value change
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    setWarning(checkForFlags(value));
    setError(null);
  };

  /**
   * Send message
   */
  const handleSend = async () => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, content: content.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to send message");
      }

      // Success - clear form
      setContent("");
      setWarning(null);
      onSend?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle Enter key to send (Shift+Enter for new line)
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Disabled state UI
  if (disabled) {
    return (
      <div className="neo-border-t p-4 neo-glass text-center text-gray-500">
        <p>Messaging is disabled for this booking</p>
      </div>
    );
  }

  return (
    <div className="neo-border-t p-4 neo-glass-card">
      {/* Warning alert for flagged content */}
      {warning && (
        <Alert variant="warning" className="mb-3">
          {warning}
        </Alert>
      )}

      {/* Error alert */}
      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}

      <div className="flex gap-2 items-end">
        {/* Message textarea */}
        <Textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          maxLength={MAX_LENGTH}
          showCharCount
          rows={2}
          className="flex-1 neo-input"
          disabled={isSending}
        />

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          loading={isSending}
          iconLeft={<Send className="w-5 h-5" />}
          className="mb-6 neo-btn-primary"
          aria-label="Send message"
        >
          Send
        </Button>
      </div>
    </div>
  );
};
