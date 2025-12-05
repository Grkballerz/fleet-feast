/**
 * Unit Tests for Messaging Service
 * Tests anti-circumvention detection, message flagging, and conversation management
 */

import {
  sendMessage,
  getConversation,
  MessagingError,
} from "@/modules/messaging/messaging.service";
import { BookingStatus, MessageSeverity } from "@prisma/client";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    booking: {
      findUnique: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    violation: {
      create: jest.fn(),
    },
  },
}));

jest.mock("@/modules/messaging/anti-circumvention", () => ({
  scanForCircumvention: jest.fn(),
  getHighestSeverity: jest.fn(),
  generateFlagReason: jest.fn(),
  getSanitizedMatches: jest.fn(() => []),
}));

jest.mock("@/modules/violation/violation.service", () => ({
  processCircumventionViolation: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import {
  scanForCircumvention,
  getHighestSeverity,
  generateFlagReason,
} from "@/modules/messaging/anti-circumvention";
import { processCircumventionViolation } from "@/modules/violation/violation.service";

describe("MessagingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendMessage", () => {
    const mockBooking = {
      id: "booking-123",
      customerId: "customer-123",
      vendorId: "vendor-123",
      status: BookingStatus.CONFIRMED,
      customer: { id: "customer-123", email: "customer@example.com" },
      vendor: { id: "vendor-123", email: "vendor@example.com" },
    };

    it("should send message without flagging for clean content", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (scanForCircumvention as jest.Mock).mockReturnValue([]); // No violations
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: "message-123",
        bookingId: "booking-123",
        senderId: "customer-123",
        content: "When will you arrive?",
        flagged: false,
        flagReason: null,
        flagSeverity: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "customer-123",
          email: "customer@example.com",
        },
      });

      const result = await sendMessage("customer-123", {
        bookingId: "booking-123",
        content: "When will you arrive?",
      });

      expect(result.flagged).toBe(false);
      expect(result.flagReason).toBeNull();
      expect(scanForCircumvention).toHaveBeenCalledWith("When will you arrive?");
    });

    it("should flag message containing phone number", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (scanForCircumvention as jest.Mock).mockReturnValue([
        {
          type: "PHONE",
          matches: ["555-1234"],
          severity: MessageSeverity.HIGH,
        },
      ]);
      (getHighestSeverity as jest.Mock).mockReturnValue(MessageSeverity.HIGH);
      (generateFlagReason as jest.Mock).mockReturnValue(
        "Phone number detected"
      );
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: "message-123",
        bookingId: "booking-123",
        senderId: "customer-123",
        content: "Call me at 555-1234",
        flagged: true,
        flagReason: "Phone number detected",
        flagSeverity: MessageSeverity.HIGH,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "customer-123",
          email: "customer@example.com",
        },
      });

      const result = await sendMessage("customer-123", {
        bookingId: "booking-123",
        content: "Call me at 555-1234",
      });

      expect(result.flagged).toBe(true);
      expect(result.flagReason).toBe("Phone number detected");
      expect(result.flagSeverity).toBe(MessageSeverity.HIGH);
      expect(processCircumventionViolation).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "customer-123",
          messageId: "message-123",
          severity: MessageSeverity.HIGH,
        })
      );
    });

    it("should flag message containing email address", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (scanForCircumvention as jest.Mock).mockReturnValue([
        {
          type: "EMAIL",
          matches: ["contact@example.com"],
          severity: MessageSeverity.HIGH,
        },
      ]);
      (getHighestSeverity as jest.Mock).mockReturnValue(MessageSeverity.HIGH);
      (generateFlagReason as jest.Mock).mockReturnValue("Email detected");
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: "message-123",
        bookingId: "booking-123",
        senderId: "customer-123",
        content: "Email me at contact@example.com",
        flagged: true,
        flagReason: "Email detected",
        flagSeverity: MessageSeverity.HIGH,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "customer-123",
          email: "customer@example.com",
        },
      });

      const result = await sendMessage("customer-123", {
        bookingId: "booking-123",
        content: "Email me at contact@example.com",
      });

      expect(result.flagged).toBe(true);
    });

    it("should still deliver flagged messages", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (scanForCircumvention as jest.Mock).mockReturnValue([
        {
          type: "PHONE",
          matches: ["555-1234"],
          severity: MessageSeverity.HIGH,
        },
      ]);
      (getHighestSeverity as jest.Mock).mockReturnValue(MessageSeverity.HIGH);
      (generateFlagReason as jest.Mock).mockReturnValue(
        "Phone number detected"
      );
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: "message-123",
        bookingId: "booking-123",
        senderId: "customer-123",
        content: "Call me at 555-1234",
        flagged: true,
        flagReason: "Phone number detected",
        flagSeverity: MessageSeverity.HIGH,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "customer-123",
          email: "customer@example.com",
        },
      });

      const result = await sendMessage("customer-123", {
        bookingId: "booking-123",
        content: "Call me at 555-1234",
      });

      expect(result).toBeDefined();
      expect(result.id).toBe("message-123");
      expect(prisma.message.create).toHaveBeenCalled();
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        sendMessage("customer-123", {
          bookingId: "nonexistent",
          content: "Test message",
        })
      ).rejects.toThrow(MessagingError);
      await expect(
        sendMessage("customer-123", {
          bookingId: "nonexistent",
          content: "Test message",
        })
      ).rejects.toThrow("Booking not found");
    });

    it("should throw error if sender not authorized", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      await expect(
        sendMessage("unauthorized-user", {
          bookingId: "booking-123",
          content: "Test message",
        })
      ).rejects.toThrow(MessagingError);
      await expect(
        sendMessage("unauthorized-user", {
          bookingId: "booking-123",
          content: "Test message",
        })
      ).rejects.toThrow("You are not authorized to message in this booking");
    });

    it("should throw error if messaging not allowed for booking status", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      await expect(
        sendMessage("customer-123", {
          bookingId: "booking-123",
          content: "Test message",
        })
      ).rejects.toThrow(MessagingError);
      await expect(
        sendMessage("customer-123", {
          bookingId: "booking-123",
          content: "Test message",
        })
      ).rejects.toThrow("Messaging is not allowed for bookings with status");
    });

    it("should allow vendor to send messages", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (scanForCircumvention as jest.Mock).mockReturnValue([]);
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: "message-123",
        bookingId: "booking-123",
        senderId: "vendor-123",
        content: "I'll arrive at 2pm",
        flagged: false,
        flagReason: null,
        flagSeverity: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "vendor-123",
          email: "vendor@example.com",
        },
      });

      const result = await sendMessage("vendor-123", {
        bookingId: "booking-123",
        content: "I'll arrive at 2pm",
      });

      expect(result.senderId).toBe("vendor-123");
    });
  });

  describe("getConversation", () => {
    const mockBooking = {
      id: "booking-123",
      customerId: "customer-123",
      vendorId: "vendor-123",
      customer: { id: "customer-123", email: "customer@example.com" },
      vendor: { id: "vendor-123", email: "vendor@example.com" },
    };

    const mockMessages = [
      {
        id: "msg-1",
        bookingId: "booking-123",
        senderId: "customer-123",
        content: "Hello",
        flagged: false,
        flagReason: null,
        flagSeverity: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: { id: "customer-123", email: "customer@example.com" },
      },
      {
        id: "msg-2",
        bookingId: "booking-123",
        senderId: "vendor-123",
        content: "Hi there",
        flagged: false,
        flagReason: null,
        flagSeverity: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: { id: "vendor-123", email: "vendor@example.com" },
      },
    ];

    it("should return conversation for authorized user", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);
      (prisma.message.count as jest.Mock).mockResolvedValue(0);

      const result = await getConversation("booking-123", "customer-123");

      expect(result.bookingId).toBe("booking-123");
      expect(result.messages).toHaveLength(2);
      expect(result.participants).toEqual({
        customer: { id: "customer-123", email: "customer@example.com" },
        vendor: { id: "vendor-123", email: "vendor@example.com" },
      });
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        getConversation("nonexistent", "customer-123")
      ).rejects.toThrow(MessagingError);
      await expect(
        getConversation("nonexistent", "customer-123")
      ).rejects.toThrow("Booking not found");
    });

    it("should throw error if user not authorized", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      await expect(
        getConversation("booking-123", "unauthorized-user")
      ).rejects.toThrow(MessagingError);
      await expect(
        getConversation("booking-123", "unauthorized-user")
      ).rejects.toThrow("You are not authorized to view this conversation");
    });

    it("should support pagination", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);
      (prisma.message.count as jest.Mock).mockResolvedValue(0);

      await getConversation("booking-123", "customer-123", 2, 10);

      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page 2 - 1) * limit 10
          take: 10,
        })
      );
    });

    it("should exclude deleted messages", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);
      (prisma.message.count as jest.Mock).mockResolvedValue(0);

      await getConversation("booking-123", "customer-123");

      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });
  });
});
