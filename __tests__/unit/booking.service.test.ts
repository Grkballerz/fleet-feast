/**
 * Unit Tests for Booking Service
 * Tests booking creation, status transitions, cancellation policy, and refunds
 */

import {
  createBooking,
  calculateRefund,
  calculateBookingAmounts,
  isWithinResponseWindow,
  acceptBooking,
  cancelBooking,
  BookingError,
  CANCELLATION_POLICY,
  PLATFORM_COMMISSION,
  RESPONSE_WINDOW_HOURS,
} from "@/modules/booking/booking.service";
import { BookingStatus, UserRole, VendorStatus } from "@prisma/client";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    vendor: {
      findUnique: jest.fn(),
    },
    availability: {
      findUnique: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/modules/loyalty/loyalty.service", () => ({
  checkLoyaltyEligibility: jest.fn(),
  calculateLoyaltyPricing: jest.fn((amount) => ({
    totalAmount: amount,
    platformFee: amount * 0.15,
    vendorPayout: amount * 0.85,
    discountAmount: 0,
    loyaltyApplied: false,
  })),
  STANDARD_COMMISSION: 0.15,
  LOYALTY_COMMISSION: 0.10,
}));

import { prisma } from "@/lib/prisma";
import {
  checkLoyaltyEligibility,
  calculateLoyaltyPricing,
} from "@/modules/loyalty/loyalty.service";

describe("BookingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateBookingAmounts", () => {
    it("should calculate platform fee and vendor payout correctly", () => {
      const result = calculateBookingAmounts(1000);

      expect(result).toEqual({
        totalAmount: 1000,
        platformFee: 150, // 15%
        vendorPayout: 850, // 85%
      });
    });

    it("should use correct commission rate", () => {
      const result = calculateBookingAmounts(500);

      expect(result.platformFee).toBe(500 * PLATFORM_COMMISSION);
    });
  });

  describe("calculateRefund", () => {
    it("should calculate 100% refund for 7+ days before event", () => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 10); // 10 days from now

      const result = calculateRefund(eventDate, 1000);

      expect(result).toEqual({
        refundAmount: 1000,
        refundPercentage: 1.0,
        daysBeforeEvent: expect.any(Number),
      });
      expect(result.daysBeforeEvent).toBeGreaterThanOrEqual(7);
    });

    it("should calculate 50% refund for 3-6 days before event", () => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 5); // 5 days from now

      const result = calculateRefund(eventDate, 1000);

      expect(result).toEqual({
        refundAmount: 500,
        refundPercentage: 0.5,
        daysBeforeEvent: expect.any(Number),
      });
      expect(result.daysBeforeEvent).toBeGreaterThanOrEqual(3);
      expect(result.daysBeforeEvent).toBeLessThan(7);
    });

    it("should calculate 0% refund for less than 3 days before event", () => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 2); // 2 days from now

      const result = calculateRefund(eventDate, 1000);

      expect(result).toEqual({
        refundAmount: 0,
        refundPercentage: 0,
        daysBeforeEvent: expect.any(Number),
      });
      expect(result.daysBeforeEvent).toBeLessThan(3);
    });

    it("should calculate exact boundary at 7 days", () => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 7);
      eventDate.setHours(23, 59, 59); // End of 7th day

      const result = calculateRefund(eventDate, 1000);

      expect(result.refundAmount).toBe(1000); // Full refund
    });
  });

  describe("isWithinResponseWindow", () => {
    it("should return true within 48-hour window", () => {
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - 24); // 24 hours ago

      const result = isWithinResponseWindow(createdAt);

      expect(result).toBe(true);
    });

    it("should return false after 48-hour window", () => {
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - (RESPONSE_WINDOW_HOURS + 1));

      const result = isWithinResponseWindow(createdAt);

      expect(result).toBe(false);
    });

    it("should return true exactly at 48 hours", () => {
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - RESPONSE_WINDOW_HOURS);
      createdAt.setSeconds(createdAt.getSeconds() + 1); // Just within

      const result = isWithinResponseWindow(createdAt);

      expect(result).toBe(true);
    });
  });

  describe("createBooking", () => {
    const mockCustomer = {
      id: "customer-123",
      email: "customer@example.com",
      role: UserRole.CUSTOMER,
      deletedAt: null,
    };

    const mockVendor = {
      id: "vendor-123",
      userId: "vendor-user-123",
      businessName: "Test Food Truck",
      cuisineType: "Mexican",
      capacityMin: 50,
      capacityMax: 500,
      status: VendorStatus.APPROVED,
      deletedAt: null,
      user: {
        id: "vendor-user-123",
        email: "vendor@example.com",
      },
    };

    const mockAvailability = {
      id: "availability-123",
      vendorId: "vendor-123",
      date: new Date("2025-12-15"),
      isAvailable: true,
    };

    const validBookingData = {
      vendorId: "vendor-123",
      eventDate: "2025-12-15",
      eventTime: "18:00",
      eventType: "Wedding",
      location: "123 Event St, City, State",
      guestCount: 100,
      specialRequests: "Vegetarian options",
      totalAmount: 2000,
    };

    it("should create booking successfully with correct amounts", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.vendor.findUnique as jest.Mock).mockResolvedValue(mockVendor);
      (prisma.availability.findUnique as jest.Mock).mockResolvedValue(
        mockAvailability
      );
      (checkLoyaltyEligibility as jest.Mock).mockResolvedValue({
        isEligible: false,
      });
      (prisma.booking.create as jest.Mock).mockResolvedValue({
        id: "booking-123",
        customerId: "customer-123",
        vendorId: "vendor-user-123",
        eventDate: new Date("2025-12-15"),
        eventTime: "18:00",
        eventType: "Wedding",
        location: "123 Event St, City, State",
        guestCount: 100,
        specialRequests: "Vegetarian options",
        totalAmount: 2000,
        platformFee: 300,
        vendorPayout: 1700,
        discountAmount: 0,
        loyaltyApplied: false,
        status: BookingStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        acceptedAt: null,
        respondedAt: null,
        cancelledAt: null,
        cancelledBy: null,
        cancellationReason: null,
        refundAmount: null,
        vendorProfile: mockVendor,
        vendor: mockVendor.user,
      });

      const result = await createBooking("customer-123", validBookingData);

      expect(result.totalAmount).toBe(2000);
      expect(result.platformFee).toBe(300);
      expect(result.vendorPayout).toBe(1700);
      expect(result.status).toBe(BookingStatus.PENDING);
    });

    it("should throw error if customer not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        createBooking("nonexistent-customer", validBookingData)
      ).rejects.toThrow(BookingError);
      await expect(
        createBooking("nonexistent-customer", validBookingData)
      ).rejects.toThrow("Customer not found");
    });

    it("should throw error if user is not a customer", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockCustomer,
        role: UserRole.VENDOR,
      });

      await expect(
        createBooking("vendor-user", validBookingData)
      ).rejects.toThrow(BookingError);
      await expect(
        createBooking("vendor-user", validBookingData)
      ).rejects.toThrow("Only customers can create bookings");
    });

    it("should throw error if vendor not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.vendor.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        createBooking("customer-123", validBookingData)
      ).rejects.toThrow(BookingError);
      await expect(
        createBooking("customer-123", validBookingData)
      ).rejects.toThrow("Vendor not found");
    });

    it("should throw error if vendor not approved", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.vendor.findUnique as jest.Mock).mockResolvedValue({
        ...mockVendor,
        status: VendorStatus.PENDING,
      });

      await expect(
        createBooking("customer-123", validBookingData)
      ).rejects.toThrow(BookingError);
      await expect(
        createBooking("customer-123", validBookingData)
      ).rejects.toThrow("Vendor is not available for bookings");
    });

    it("should throw error if vendor not available on date", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.vendor.findUnique as jest.Mock).mockResolvedValue(mockVendor);
      (prisma.availability.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        createBooking("customer-123", validBookingData)
      ).rejects.toThrow(BookingError);
      await expect(
        createBooking("customer-123", validBookingData)
      ).rejects.toThrow("Vendor is not available on the selected date");
    });

    it("should throw error if guest count below minimum", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.vendor.findUnique as jest.Mock).mockResolvedValue(mockVendor);
      (prisma.availability.findUnique as jest.Mock).mockResolvedValue(
        mockAvailability
      );

      await expect(
        createBooking("customer-123", {
          ...validBookingData,
          guestCount: 25, // Below min of 50
        })
      ).rejects.toThrow(BookingError);
      await expect(
        createBooking("customer-123", {
          ...validBookingData,
          guestCount: 25,
        })
      ).rejects.toThrow("Guest count must be between");
    });

    it("should throw error if guest count above maximum", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.vendor.findUnique as jest.Mock).mockResolvedValue(mockVendor);
      (prisma.availability.findUnique as jest.Mock).mockResolvedValue(
        mockAvailability
      );

      await expect(
        createBooking("customer-123", {
          ...validBookingData,
          guestCount: 600, // Above max of 500
        })
      ).rejects.toThrow(BookingError);
    });

    it("should apply loyalty discount when eligible", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.vendor.findUnique as jest.Mock).mockResolvedValue(mockVendor);
      (prisma.availability.findUnique as jest.Mock).mockResolvedValue(
        mockAvailability
      );
      (checkLoyaltyEligibility as jest.Mock).mockResolvedValue({
        isEligible: true,
        repeatCount: 3,
      });
      (calculateLoyaltyPricing as jest.Mock).mockReturnValue({
        totalAmount: 1900, // 5% discount
        platformFee: 190, // 10% commission
        vendorPayout: 1710,
        discountAmount: 100,
        loyaltyApplied: true,
      });
      (prisma.booking.create as jest.Mock).mockResolvedValue({
        id: "booking-123",
        customerId: "customer-123",
        vendorId: "vendor-user-123",
        totalAmount: 1900,
        platformFee: 190,
        vendorPayout: 1710,
        discountAmount: 100,
        loyaltyApplied: true,
        status: BookingStatus.PENDING,
        eventDate: new Date("2025-12-15"),
        eventTime: "18:00",
        eventType: "Wedding",
        location: "123 Event St",
        guestCount: 100,
        specialRequests: "Vegetarian options",
        createdAt: new Date(),
        updatedAt: new Date(),
        vendorProfile: mockVendor,
        vendor: mockVendor.user,
      });

      const result = await createBooking("customer-123", validBookingData);

      expect(result.loyaltyApplied).toBe(true);
      expect(result.discountAmount).toBe(100);
    });
  });

  describe("acceptBooking", () => {
    const mockBooking = {
      id: "booking-123",
      customerId: "customer-123",
      vendorId: "vendor-user-123",
      status: BookingStatus.PENDING,
      createdAt: new Date(),
      eventDate: new Date("2025-12-15"),
      eventTime: "18:00",
      eventType: "Wedding",
      location: "123 Event St",
      guestCount: 100,
      specialRequests: null,
      totalAmount: 2000,
      platformFee: 300,
      vendorPayout: 1700,
      discountAmount: 0,
      loyaltyApplied: false,
    };

    it("should accept booking successfully", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.ACCEPTED,
        acceptedAt: new Date(),
        respondedAt: new Date(),
        customer: { id: "customer-123", email: "customer@example.com" },
        vendorProfile: {
          id: "vendor-123",
          businessName: "Test Truck",
          cuisineType: "Mexican",
        },
      });

      const result = await acceptBooking("booking-123", "vendor-user-123");

      expect(result.status).toBe(BookingStatus.ACCEPTED);
      expect(prisma.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "booking-123" },
          data: expect.objectContaining({
            status: BookingStatus.ACCEPTED,
            acceptedAt: expect.any(Date),
            respondedAt: expect.any(Date),
          }),
        })
      );
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        acceptBooking("nonexistent-booking", "vendor-user-123")
      ).rejects.toThrow(BookingError);
      await expect(
        acceptBooking("nonexistent-booking", "vendor-user-123")
      ).rejects.toThrow("Booking not found");
    });

    it("should throw error if vendor doesn't own booking", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      await expect(
        acceptBooking("booking-123", "different-vendor")
      ).rejects.toThrow(BookingError);
      await expect(
        acceptBooking("booking-123", "different-vendor")
      ).rejects.toThrow("You don't have permission to accept this booking");
    });

    it("should throw error if booking not in PENDING status", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      });

      await expect(
        acceptBooking("booking-123", "vendor-user-123")
      ).rejects.toThrow(BookingError);
      await expect(
        acceptBooking("booking-123", "vendor-user-123")
      ).rejects.toThrow("Only PENDING bookings can be accepted");
    });

    it("should throw error if response window expired", async () => {
      const oldCreatedAt = new Date();
      oldCreatedAt.setHours(
        oldCreatedAt.getHours() - (RESPONSE_WINDOW_HOURS + 1)
      );

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        createdAt: oldCreatedAt,
      });

      await expect(
        acceptBooking("booking-123", "vendor-user-123")
      ).rejects.toThrow(BookingError);
      await expect(
        acceptBooking("booking-123", "vendor-user-123")
      ).rejects.toThrow("Response window has expired");
    });
  });

  describe("cancelBooking", () => {
    const mockBooking = {
      id: "booking-123",
      customerId: "customer-123",
      vendorId: "vendor-user-123",
      status: BookingStatus.CONFIRMED,
      eventDate: new Date("2025-12-20"),
      totalAmount: 2000,
      platformFee: 300,
      vendorPayout: 1700,
      discountAmount: 0,
      loyaltyApplied: false,
      eventTime: "18:00",
      eventType: "Wedding",
      location: "123 Event St",
      guestCount: 100,
      specialRequests: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: { id: "customer-123", email: "customer@example.com" },
      vendorProfile: {
        id: "vendor-123",
        businessName: "Test Truck",
        cuisineType: "Mexican",
      },
    };

    it("should cancel booking and calculate refund", async () => {
      const futureEventDate = new Date();
      futureEventDate.setDate(futureEventDate.getDate() + 10); // 10 days from now

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        eventDate: futureEventDate,
      });
      (prisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        eventDate: futureEventDate,
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: "customer-123",
        cancellationReason: "Test cancellation",
        refundAmount: 2000, // Full refund for 10 days before
      });

      const result = await cancelBooking("booking-123", "customer-123", {
        reason: "Test cancellation",
      });

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(result.refundAmount).toBe(2000); // Full refund
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        cancelBooking("nonexistent-booking", "customer-123", {})
      ).rejects.toThrow(BookingError);
    });

    it("should throw error if user is not customer or vendor", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      await expect(
        cancelBooking("booking-123", "unauthorized-user", {})
      ).rejects.toThrow(BookingError);
      await expect(
        cancelBooking("booking-123", "unauthorized-user", {})
      ).rejects.toThrow("You don't have permission to cancel this booking");
    });

    it("should throw error if booking already cancelled", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      await expect(
        cancelBooking("booking-123", "customer-123", {})
      ).rejects.toThrow(BookingError);
      await expect(
        cancelBooking("booking-123", "customer-123", {})
      ).rejects.toThrow("Cannot cancel booking with status");
    });
  });
});
