/**
 * Unit Tests for Dispute Service
 * Tests dispute creation, resolution, and eligibility checking
 */

import {
  createDispute,
  canCreateDispute,
  resolveDispute,
  DisputeError,
  DISPUTE_WINDOW_DAYS,
} from "@/modules/dispute/dispute.service";
import { BookingStatus, DisputeStatus, PaymentStatus } from "@prisma/client";
import { DisputeType, ResolutionOutcome } from "@/modules/dispute/dispute.types";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    dispute: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    payment: {
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback({
      booking: { update: jest.fn() },
      payment: { update: jest.fn() },
      dispute: {
        create: jest.fn().mockResolvedValue({ id: "dispute-123" }),
        update: jest.fn(),
      },
    })),
  },
}));

jest.mock("@/modules/payment/payment.service", () => ({
  processRefund: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import { processRefund } from "@/modules/payment/payment.service";

describe("DisputeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("canCreateDispute", () => {
    it("should allow dispute for COMPLETED booking within 7 days", () => {
      const completedAt = new Date();
      completedAt.setDate(completedAt.getDate() - 3); // 3 days ago
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() - 3);

      const result = canCreateDispute(
        BookingStatus.COMPLETED,
        eventDate,
        completedAt
      );

      expect(result.eligible).toBe(true);
    });

    it("should reject dispute for non-COMPLETED booking", () => {
      const result = canCreateDispute(
        BookingStatus.CONFIRMED,
        new Date(),
        new Date()
      );

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain("Only COMPLETED bookings can be disputed");
    });

    it("should reject dispute after 7-day window", () => {
      const completedAt = new Date();
      completedAt.setDate(completedAt.getDate() - 10); // 10 days ago
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() - 10);

      const result = canCreateDispute(
        BookingStatus.COMPLETED,
        eventDate,
        completedAt
      );

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain("Dispute window expired");
    });

    it("should use eventDate if completedAt is null", () => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() - 2); // 2 days ago

      const result = canCreateDispute(
        BookingStatus.COMPLETED,
        eventDate,
        null
      );

      expect(result.eligible).toBe(true);
    });
  });

  describe("createDispute", () => {
    const mockBooking = {
      id: "booking-123",
      customerId: "customer-123",
      vendorId: "vendor-123",
      status: BookingStatus.COMPLETED,
      eventDate: new Date(),
      totalAmount: 2000,
      updatedAt: new Date(),
      payment: {
        id: "payment-123",
        status: PaymentStatus.CAPTURED,
      },
      dispute: null,
      customer: { email: "customer@example.com" },
      vendorProfile: { businessName: "Test Truck" },
    };

    it("should create dispute successfully", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.dispute.findUnique as jest.Mock).mockResolvedValue({
        id: "dispute-123",
        bookingId: "booking-123",
        initiatorId: "customer-123",
        reason: JSON.stringify({
          type: DisputeType.SERVICE_QUALITY,
          description: "Food was cold",
        }),
        evidence: null,
        status: DisputeStatus.OPEN,
        resolution: null,
        resolvedAt: null,
        resolvedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        booking: {
          id: "booking-123",
          eventDate: new Date(),
          eventType: "Wedding",
          totalAmount: 2000,
          status: BookingStatus.DISPUTED,
          customer: { email: "customer@example.com" },
          vendorProfile: { businessName: "Test Truck" },
        },
      });

      const result = await createDispute({
        bookingId: "booking-123",
        userId: "customer-123",
        description: "Food was cold",
      });

      expect(result.bookingId).toBe("booking-123");
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        createDispute({
          bookingId: "nonexistent",
          userId: "customer-123",
          description: "Test dispute",
        })
      ).rejects.toThrow(DisputeError);
      await expect(
        createDispute({
          bookingId: "nonexistent",
          userId: "customer-123",
          description: "Test dispute",
        })
      ).rejects.toThrow("Booking not found");
    });

    it("should throw error if dispute already exists", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        dispute: { id: "existing-dispute" },
      });

      await expect(
        createDispute({
          bookingId: "booking-123",
          userId: "customer-123",
          description: "Test dispute",
        })
      ).rejects.toThrow(DisputeError);
      await expect(
        createDispute({
          bookingId: "booking-123",
          userId: "customer-123",
          description: "Test dispute",
        })
      ).rejects.toThrow("Dispute already exists for this booking");
    });

    it("should throw error if user not authorized", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      await expect(
        createDispute({
          bookingId: "booking-123",
          userId: "unauthorized-user",
          description: "Test dispute",
        })
      ).rejects.toThrow(DisputeError);
      await expect(
        createDispute({
          bookingId: "booking-123",
          userId: "unauthorized-user",
          description: "Test dispute",
        })
      ).rejects.toThrow("You don't have permission to dispute this booking");
    });

    it("should throw error if booking not eligible", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      });

      await expect(
        createDispute({
          bookingId: "booking-123",
          userId: "customer-123",
          description: "Test dispute",
        })
      ).rejects.toThrow(DisputeError);
    });
  });

  describe("resolveDispute", () => {
    const mockDispute = {
      id: "dispute-123",
      bookingId: "booking-123",
      initiatorId: "customer-123",
      reason: "Service quality issues",
      status: DisputeStatus.OPEN,
      booking: {
        id: "booking-123",
        totalAmount: 2000,
        payment: {
          id: "payment-123",
          stripePaymentIntentId: "pi_test123",
        },
      },
    };

    it("should resolve with full refund", async () => {
      (prisma.dispute.findUnique as jest.Mock).mockResolvedValue(mockDispute);
      (processRefund as jest.Mock).mockResolvedValue({});
      (prisma.dispute.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockDispute)
        .mockResolvedValueOnce({
          ...mockDispute,
          status: DisputeStatus.RESOLVED_REFUND,
          resolution: JSON.stringify({
            outcome: ResolutionOutcome.FULL_REFUND,
            notes: "Resolved",
          }),
          booking: {
            ...mockDispute.booking,
            eventDate: new Date(),
            eventType: "Wedding",
            status: BookingStatus.REFUNDED,
            customer: { email: "customer@example.com" },
            vendorProfile: { businessName: "Test Truck" },
          },
        });

      const result = await resolveDispute("dispute-123", {
        outcome: ResolutionOutcome.FULL_REFUND,
        adminId: "admin-123",
        notes: "Resolved",
      });

      expect(processRefund).toHaveBeenCalledWith("payment-123", {
        amount: 2000,
        reason: expect.any(String),
      });
    });

    it("should resolve with partial refund", async () => {
      (prisma.dispute.findUnique as jest.Mock).mockResolvedValue(mockDispute);
      (processRefund as jest.Mock).mockResolvedValue({});
      (prisma.dispute.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockDispute)
        .mockResolvedValueOnce({
          ...mockDispute,
          status: DisputeStatus.RESOLVED_REFUND,
          booking: {
            ...mockDispute.booking,
            eventDate: new Date(),
            eventType: "Wedding",
            status: BookingStatus.REFUNDED,
            customer: { email: "customer@example.com" },
            vendorProfile: { businessName: "Test Truck" },
          },
        });

      await resolveDispute("dispute-123", {
        outcome: ResolutionOutcome.PARTIAL_REFUND,
        refundPercent: 50,
        adminId: "admin-123",
        notes: "Half refund",
      });

      expect(processRefund).toHaveBeenCalledWith("payment-123", {
        amount: 1000, // 50% of 2000
        reason: expect.any(String),
      });
    });

    it("should release funds with no refund", async () => {
      (prisma.dispute.findUnique as jest.Mock).mockResolvedValue(mockDispute);
      (prisma.dispute.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockDispute)
        .mockResolvedValueOnce({
          ...mockDispute,
          status: DisputeStatus.RESOLVED_RELEASE,
          booking: {
            ...mockDispute.booking,
            eventDate: new Date(),
            eventType: "Wedding",
            status: BookingStatus.COMPLETED,
            customer: { email: "customer@example.com" },
            vendorProfile: { businessName: "Test Truck" },
          },
        });

      await resolveDispute("dispute-123", {
        outcome: ResolutionOutcome.NO_REFUND,
        adminId: "admin-123",
        notes: "No refund warranted",
      });

      expect(processRefund).not.toHaveBeenCalled();
    });

    it("should throw error if dispute not found", async () => {
      (prisma.dispute.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        resolveDispute("nonexistent", {
          outcome: ResolutionOutcome.FULL_REFUND,
          adminId: "admin-123",
        })
      ).rejects.toThrow(DisputeError);
    });

    it("should throw error if already resolved", async () => {
      (prisma.dispute.findUnique as jest.Mock).mockResolvedValue({
        ...mockDispute,
        status: DisputeStatus.RESOLVED_REFUND,
      });

      await expect(
        resolveDispute("dispute-123", {
          outcome: ResolutionOutcome.FULL_REFUND,
          adminId: "admin-123",
        })
      ).rejects.toThrow(DisputeError);
      await expect(
        resolveDispute("dispute-123", {
          outcome: ResolutionOutcome.FULL_REFUND,
          adminId: "admin-123",
        })
      ).rejects.toThrow("Dispute is already resolved");
    });

    it("should throw error if refund percent missing for partial refund", async () => {
      (prisma.dispute.findUnique as jest.Mock).mockResolvedValue(mockDispute);

      await expect(
        resolveDispute("dispute-123", {
          outcome: ResolutionOutcome.PARTIAL_REFUND,
          adminId: "admin-123",
        })
      ).rejects.toThrow(DisputeError);
      await expect(
        resolveDispute("dispute-123", {
          outcome: ResolutionOutcome.PARTIAL_REFUND,
          adminId: "admin-123",
        })
      ).rejects.toThrow("Refund percentage required for partial refunds");
    });
  });
});
