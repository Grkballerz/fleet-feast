/**
 * Booking Service Layer
 * Handles business logic for booking requests, CRUD, vendor responses, and cancellations
 */

import { prisma } from "@/lib/prisma";
import { BookingStatus, UserRole, VendorStatus } from "@prisma/client";
import type {
  BookingRequestData,
  BookingUpdateData,
  VendorResponseData,
  CancellationData,
  BookingDetails,
  BookingListItem,
  RefundCalculation,
} from "./booking.types";
import {
  checkLoyaltyEligibility,
  calculateLoyaltyPricing,
  STANDARD_COMMISSION,
  LOYALTY_COMMISSION,
} from "@/modules/loyalty/loyalty.service";

/**
 * Constants
 */
export const PLATFORM_COMMISSION = STANDARD_COMMISSION; // 15% platform fee (standard, 10% for loyalty)
export const RESPONSE_WINDOW_HOURS = 48; // 48-hour vendor response window

/**
 * Cancellation policy thresholds (days before event)
 */
export const CANCELLATION_POLICY = {
  FULL_REFUND_DAYS: 7, // 7+ days: full refund
  PARTIAL_REFUND_DAYS: 3, // 3-6 days: 50% refund
  // Under 3 days: no refund
};

/**
 * Valid status transitions
 */
export const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: [BookingStatus.ACCEPTED, BookingStatus.PAYMENT_FAILED, BookingStatus.CANCELLED],
  ACCEPTED: [BookingStatus.CONFIRMED, BookingStatus.PAYMENT_FAILED, BookingStatus.CANCELLED],
  PAYMENT_FAILED: [BookingStatus.PENDING], // Can retry
  CONFIRMED: [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.DISPUTED],
  COMPLETED: [BookingStatus.DISPUTED],
  CANCELLED: [],
  DISPUTED: [BookingStatus.REFUNDED],
  REFUNDED: [],
};

/**
 * Custom error class for booking operations
 */
export class BookingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "BookingError";
  }
}

/**
 * Calculate platform fee and vendor payout
 */
export function calculateBookingAmounts(totalAmount: number): {
  totalAmount: number;
  platformFee: number;
  vendorPayout: number;
} {
  const platformFee = totalAmount * PLATFORM_COMMISSION;
  const vendorPayout = totalAmount - platformFee;

  return {
    totalAmount,
    platformFee,
    vendorPayout,
  };
}

/**
 * Check if booking is within vendor response window
 */
export function isWithinResponseWindow(createdAt: Date): boolean {
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + RESPONSE_WINDOW_HOURS);
  return new Date() < deadline;
}

/**
 * Calculate refund amount based on cancellation policy
 */
export function calculateRefund(
  eventDate: Date,
  totalAmount: number
): RefundCalculation {
  const now = new Date();
  const daysBeforeEvent = Math.ceil(
    (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  let refundPercentage = 0;

  if (daysBeforeEvent >= CANCELLATION_POLICY.FULL_REFUND_DAYS) {
    refundPercentage = 1.0; // 100% refund
  } else if (daysBeforeEvent >= CANCELLATION_POLICY.PARTIAL_REFUND_DAYS) {
    refundPercentage = 0.5; // 50% refund
  } else {
    refundPercentage = 0; // No refund
  }

  return {
    refundAmount: totalAmount * refundPercentage,
    refundPercentage,
    daysBeforeEvent,
  };
}

/**
 * Validate status transition
 */
function validateStatusTransition(
  currentStatus: BookingStatus,
  newStatus: BookingStatus
): void {
  const validTransitions = VALID_TRANSITIONS[currentStatus];
  if (!validTransitions.includes(newStatus)) {
    throw new BookingError(
      `Cannot transition from ${currentStatus} to ${newStatus}`,
      "INVALID_STATUS_TRANSITION",
      400
    );
  }
}

/**
 * Create a new booking request
 */
export async function createBooking(
  customerId: string,
  data: BookingRequestData
): Promise<BookingDetails> {
  // Verify customer exists and has CUSTOMER role
  const customer = await prisma.user.findUnique({
    where: { id: customerId, deletedAt: null },
  });

  if (!customer) {
    throw new BookingError("Customer not found", "CUSTOMER_NOT_FOUND", 404);
  }

  if (customer.role !== UserRole.CUSTOMER) {
    throw new BookingError(
      "Only customers can create bookings",
      "INVALID_ROLE",
      403
    );
  }

  // Verify vendor exists and is approved
  const vendor = await prisma.vendor.findUnique({
    where: { id: data.vendorId, deletedAt: null },
    select: {
      id: true,
      userId: true,
      status: true,
      capacityMin: true,
      capacityMax: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!vendor) {
    throw new BookingError("Vendor not found", "VENDOR_NOT_FOUND", 404);
  }

  if (vendor.status !== VendorStatus.APPROVED) {
    throw new BookingError(
      "Vendor is not available for bookings",
      "VENDOR_NOT_APPROVED",
      400
    );
  }

  // Check vendor availability for the event date
  const eventDate = new Date(data.eventDate);
  const availability = await prisma.availability.findUnique({
    where: {
      vendorId_date: {
        vendorId: vendor.id,
        date: eventDate,
      },
    },
  });

  if (!availability || !availability.isAvailable) {
    throw new BookingError(
      "Vendor is not available on the selected date",
      "VENDOR_NOT_AVAILABLE",
      400
    );
  }

  // Check vendor capacity
  if (
    data.guestCount < vendor.capacityMin ||
    data.guestCount > vendor.capacityMax
  ) {
    throw new BookingError(
      `Guest count must be between ${vendor.capacityMin} and ${vendor.capacityMax}`,
      "INVALID_GUEST_COUNT",
      400
    );
  }

  // Check loyalty eligibility
  const loyaltyStatus = await checkLoyaltyEligibility(customerId, vendor.userId);

  // Calculate amounts with loyalty discount
  const pricing = calculateLoyaltyPricing(data.totalAmount, loyaltyStatus);

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      customerId,
      vendorId: vendor.userId,
      eventDate,
      eventTime: data.eventTime,
      eventType: data.eventType,
      location: data.location,
      guestCount: data.guestCount,
      specialRequests: data.specialRequests,
      totalAmount: pricing.totalAmount,
      platformFee: pricing.platformFee,
      vendorPayout: pricing.vendorPayout,
      discountAmount: pricing.discountAmount,
      loyaltyApplied: pricing.loyaltyApplied,
      status: BookingStatus.PENDING,
    },
    include: {
      vendor: {
        select: {
          email: true,
        },
      },
      vendorProfile: {
        select: {
          id: true,
          businessName: true,
          cuisineType: true,
        },
      },
    },
  });

  return {
    id: booking.id,
    customerId: booking.customerId,
    vendorId: booking.vendorId,
    eventDate: booking.eventDate.toISOString().split("T")[0],
    eventTime: booking.eventTime,
    eventType: booking.eventType,
    location: booking.location,
    guestCount: booking.guestCount,
    specialRequests: booking.specialRequests,
    totalAmount: Number(booking.totalAmount),
    platformFee: Number(booking.platformFee),
    vendorPayout: Number(booking.vendorPayout),
    discountAmount: booking.discountAmount ? Number(booking.discountAmount) : 0,
    loyaltyApplied: booking.loyaltyApplied,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    acceptedAt: booking.acceptedAt,
    respondedAt: booking.respondedAt,
    cancelledAt: booking.cancelledAt,
    cancelledBy: booking.cancelledBy,
    cancellationReason: booking.cancellationReason,
    refundAmount: booking.refundAmount ? Number(booking.refundAmount) : null,
    vendor: {
      id: booking.vendorProfile.id,
      businessName: booking.vendorProfile.businessName,
      cuisineType: booking.vendorProfile.cuisineType,
    },
  };
}

/**
 * Get booking details
 */
export async function getBookingDetails(
  bookingId: string,
  userId: string
): Promise<BookingDetails> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: {
        select: {
          id: true,
          email: true,
        },
      },
      vendor: {
        select: {
          id: true,
          email: true,
        },
      },
      vendorProfile: {
        select: {
          id: true,
          businessName: true,
          cuisineType: true,
        },
      },
    },
  });

  if (!booking) {
    throw new BookingError("Booking not found", "BOOKING_NOT_FOUND", 404);
  }

  // Check authorization: only customer or vendor can view
  if (booking.customerId !== userId && booking.vendorId !== userId) {
    throw new BookingError(
      "You don't have permission to view this booking",
      "UNAUTHORIZED",
      403
    );
  }

  return {
    id: booking.id,
    customerId: booking.customerId,
    vendorId: booking.vendorId,
    eventDate: booking.eventDate.toISOString().split("T")[0],
    eventTime: booking.eventTime,
    eventType: booking.eventType,
    location: booking.location,
    guestCount: booking.guestCount,
    specialRequests: booking.specialRequests,
    totalAmount: Number(booking.totalAmount),
    platformFee: Number(booking.platformFee),
    vendorPayout: Number(booking.vendorPayout),
    discountAmount: booking.discountAmount ? Number(booking.discountAmount) : 0,
    loyaltyApplied: booking.loyaltyApplied,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    acceptedAt: booking.acceptedAt,
    respondedAt: booking.respondedAt,
    cancelledAt: booking.cancelledAt,
    cancelledBy: booking.cancelledBy,
    cancellationReason: booking.cancellationReason,
    refundAmount: booking.refundAmount ? Number(booking.refundAmount) : null,
    vendor:
      booking.customerId === userId
        ? {
            id: booking.vendorProfile.id,
            businessName: booking.vendorProfile.businessName,
            cuisineType: booking.vendorProfile.cuisineType,
          }
        : undefined,
    customer:
      booking.vendorId === userId
        ? {
            id: booking.customer.id,
            email: booking.customer.email,
          }
        : undefined,
  };
}

/**
 * List user's bookings (customer or vendor)
 */
export async function listUserBookings(
  userId: string,
  role: UserRole
): Promise<BookingListItem[]> {
  const whereClause =
    role === UserRole.CUSTOMER
      ? { customerId: userId }
      : { vendorId: userId };

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      customer: {
        select: {
          email: true,
        },
      },
      vendorProfile: {
        select: {
          businessName: true,
        },
      },
    },
    orderBy: {
      eventDate: "desc",
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    eventDate: booking.eventDate.toISOString().split("T")[0],
    eventTime: booking.eventTime,
    eventType: booking.eventType,
    location: booking.location,
    guestCount: booking.guestCount,
    totalAmount: Number(booking.totalAmount),
    status: booking.status,
    createdAt: booking.createdAt,
    vendorBusinessName:
      role === UserRole.CUSTOMER
        ? booking.vendorProfile.businessName
        : undefined,
    customerEmail:
      role === UserRole.VENDOR ? booking.customer.email : undefined,
  }));
}

/**
 * Update booking (limited fields, only in PENDING status)
 */
export async function updateBooking(
  bookingId: string,
  userId: string,
  data: BookingUpdateData
): Promise<BookingDetails> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new BookingError("Booking not found", "BOOKING_NOT_FOUND", 404);
  }

  // Only customer can update booking
  if (booking.customerId !== userId) {
    throw new BookingError(
      "Only the customer can update booking details",
      "UNAUTHORIZED",
      403
    );
  }

  // Only allow updates in PENDING status
  if (booking.status !== BookingStatus.PENDING) {
    throw new BookingError(
      "Booking can only be updated in PENDING status",
      "INVALID_STATUS",
      400
    );
  }

  // Prepare update data
  const updateData: any = {};

  if (data.eventDate) {
    updateData.eventDate = new Date(data.eventDate);
  }
  if (data.eventTime) {
    updateData.eventTime = data.eventTime;
  }
  if (data.location) {
    updateData.location = data.location;
  }
  if (data.guestCount !== undefined) {
    // Verify capacity if guest count changed
    const vendor = await prisma.vendor.findUnique({
      where: { userId: booking.vendorId },
    });

    if (vendor) {
      if (
        data.guestCount < vendor.capacityMin ||
        data.guestCount > vendor.capacityMax
      ) {
        throw new BookingError(
          `Guest count must be between ${vendor.capacityMin} and ${vendor.capacityMax}`,
          "INVALID_GUEST_COUNT",
          400
        );
      }
    }

    updateData.guestCount = data.guestCount;
  }
  if (data.specialRequests !== undefined) {
    updateData.specialRequests = data.specialRequests;
  }

  // Update booking
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: updateData,
    include: {
      vendorProfile: {
        select: {
          id: true,
          businessName: true,
          cuisineType: true,
        },
      },
    },
  });

  return {
    id: updatedBooking.id,
    customerId: updatedBooking.customerId,
    vendorId: updatedBooking.vendorId,
    eventDate: updatedBooking.eventDate.toISOString().split("T")[0],
    eventTime: updatedBooking.eventTime,
    eventType: updatedBooking.eventType,
    location: updatedBooking.location,
    guestCount: updatedBooking.guestCount,
    specialRequests: updatedBooking.specialRequests,
    totalAmount: Number(updatedBooking.totalAmount),
    platformFee: Number(updatedBooking.platformFee),
    vendorPayout: Number(updatedBooking.vendorPayout),
    discountAmount: updatedBooking.discountAmount ? Number(updatedBooking.discountAmount) : 0,
    loyaltyApplied: updatedBooking.loyaltyApplied,
    status: updatedBooking.status,
    createdAt: updatedBooking.createdAt,
    updatedAt: updatedBooking.updatedAt,
    acceptedAt: updatedBooking.acceptedAt,
    respondedAt: updatedBooking.respondedAt,
    cancelledAt: updatedBooking.cancelledAt,
    cancelledBy: updatedBooking.cancelledBy,
    cancellationReason: updatedBooking.cancellationReason,
    refundAmount: updatedBooking.refundAmount
      ? Number(updatedBooking.refundAmount)
      : null,
    vendor: {
      id: updatedBooking.vendorProfile.id,
      businessName: updatedBooking.vendorProfile.businessName,
      cuisineType: updatedBooking.vendorProfile.cuisineType,
    },
  };
}

/**
 * Vendor accepts booking
 */
export async function acceptBooking(
  bookingId: string,
  vendorId: string
): Promise<BookingDetails> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new BookingError("Booking not found", "BOOKING_NOT_FOUND", 404);
  }

  // Verify vendor owns this booking
  if (booking.vendorId !== vendorId) {
    throw new BookingError(
      "You don't have permission to accept this booking",
      "UNAUTHORIZED",
      403
    );
  }

  // Check status
  if (booking.status !== BookingStatus.PENDING) {
    throw new BookingError(
      "Only PENDING bookings can be accepted",
      "INVALID_STATUS",
      400
    );
  }

  // Check response window
  if (!isWithinResponseWindow(booking.createdAt)) {
    throw new BookingError(
      "Response window has expired (48 hours)",
      "RESPONSE_WINDOW_EXPIRED",
      400
    );
  }

  // Update booking status
  const now = new Date();
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.ACCEPTED,
      acceptedAt: now,
      respondedAt: now,
    },
    include: {
      customer: {
        select: {
          id: true,
          email: true,
        },
      },
      vendorProfile: {
        select: {
          id: true,
          businessName: true,
          cuisineType: true,
        },
      },
    },
  });

  return {
    id: updatedBooking.id,
    customerId: updatedBooking.customerId,
    vendorId: updatedBooking.vendorId,
    eventDate: updatedBooking.eventDate.toISOString().split("T")[0],
    eventTime: updatedBooking.eventTime,
    eventType: updatedBooking.eventType,
    location: updatedBooking.location,
    guestCount: updatedBooking.guestCount,
    specialRequests: updatedBooking.specialRequests,
    totalAmount: Number(updatedBooking.totalAmount),
    platformFee: Number(updatedBooking.platformFee),
    vendorPayout: Number(updatedBooking.vendorPayout),
    discountAmount: updatedBooking.discountAmount ? Number(updatedBooking.discountAmount) : 0,
    loyaltyApplied: updatedBooking.loyaltyApplied,
    status: updatedBooking.status,
    createdAt: updatedBooking.createdAt,
    updatedAt: updatedBooking.updatedAt,
    acceptedAt: updatedBooking.acceptedAt,
    respondedAt: updatedBooking.respondedAt,
    cancelledAt: updatedBooking.cancelledAt,
    cancelledBy: updatedBooking.cancelledBy,
    cancellationReason: updatedBooking.cancellationReason,
    refundAmount: updatedBooking.refundAmount
      ? Number(updatedBooking.refundAmount)
      : null,
    customer: {
      id: updatedBooking.customer.id,
      email: updatedBooking.customer.email,
    },
  };
}

/**
 * Vendor declines booking
 */
export async function declineBooking(
  bookingId: string,
  vendorId: string,
  data: VendorResponseData
): Promise<BookingDetails> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new BookingError("Booking not found", "BOOKING_NOT_FOUND", 404);
  }

  // Verify vendor owns this booking
  if (booking.vendorId !== vendorId) {
    throw new BookingError(
      "You don't have permission to decline this booking",
      "UNAUTHORIZED",
      403
    );
  }

  // Check status
  if (booking.status !== BookingStatus.PENDING) {
    throw new BookingError(
      "Only PENDING bookings can be declined",
      "INVALID_STATUS",
      400
    );
  }

  // Check response window
  if (!isWithinResponseWindow(booking.createdAt)) {
    throw new BookingError(
      "Response window has expired (48 hours)",
      "RESPONSE_WINDOW_EXPIRED",
      400
    );
  }

  // Update booking status
  const now = new Date();
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
      respondedAt: now,
      cancelledAt: now,
      cancelledBy: vendorId,
      cancellationReason: data.reason || "Declined by vendor",
    },
    include: {
      customer: {
        select: {
          id: true,
          email: true,
        },
      },
      vendorProfile: {
        select: {
          id: true,
          businessName: true,
          cuisineType: true,
        },
      },
    },
  });

  return {
    id: updatedBooking.id,
    customerId: updatedBooking.customerId,
    vendorId: updatedBooking.vendorId,
    eventDate: updatedBooking.eventDate.toISOString().split("T")[0],
    eventTime: updatedBooking.eventTime,
    eventType: updatedBooking.eventType,
    location: updatedBooking.location,
    guestCount: updatedBooking.guestCount,
    specialRequests: updatedBooking.specialRequests,
    totalAmount: Number(updatedBooking.totalAmount),
    platformFee: Number(updatedBooking.platformFee),
    vendorPayout: Number(updatedBooking.vendorPayout),
    discountAmount: updatedBooking.discountAmount ? Number(updatedBooking.discountAmount) : 0,
    loyaltyApplied: updatedBooking.loyaltyApplied,
    status: updatedBooking.status,
    createdAt: updatedBooking.createdAt,
    updatedAt: updatedBooking.updatedAt,
    acceptedAt: updatedBooking.acceptedAt,
    respondedAt: updatedBooking.respondedAt,
    cancelledAt: updatedBooking.cancelledAt,
    cancelledBy: updatedBooking.cancelledBy,
    cancellationReason: updatedBooking.cancellationReason,
    refundAmount: updatedBooking.refundAmount
      ? Number(updatedBooking.refundAmount)
      : null,
    customer: {
      id: updatedBooking.customer.id,
      email: updatedBooking.customer.email,
    },
  };
}

/**
 * Cancel booking (customer or vendor)
 */
export async function cancelBooking(
  bookingId: string,
  userId: string,
  data: CancellationData
): Promise<BookingDetails> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: {
        select: {
          id: true,
          email: true,
        },
      },
      vendorProfile: {
        select: {
          id: true,
          businessName: true,
          cuisineType: true,
        },
      },
    },
  });

  if (!booking) {
    throw new BookingError("Booking not found", "BOOKING_NOT_FOUND", 404);
  }

  // Verify user is customer or vendor
  if (booking.customerId !== userId && booking.vendorId !== userId) {
    throw new BookingError(
      "You don't have permission to cancel this booking",
      "UNAUTHORIZED",
      403
    );
  }

  // Check if booking can be cancelled
  if (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.COMPLETED ||
    booking.status === BookingStatus.REFUNDED
  ) {
    throw new BookingError(
      `Cannot cancel booking with status ${booking.status}`,
      "INVALID_STATUS",
      400
    );
  }

  // Calculate refund
  const refundCalc = calculateRefund(
    booking.eventDate,
    Number(booking.totalAmount)
  );

  // Update booking
  const now = new Date();
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
      cancelledAt: now,
      cancelledBy: userId,
      cancellationReason:
        data.reason ||
        (booking.customerId === userId
          ? "Cancelled by customer"
          : "Cancelled by vendor"),
      refundAmount: refundCalc.refundAmount,
    },
    include: {
      customer: {
        select: {
          id: true,
          email: true,
        },
      },
      vendorProfile: {
        select: {
          id: true,
          businessName: true,
          cuisineType: true,
        },
      },
    },
  });

  return {
    id: updatedBooking.id,
    customerId: updatedBooking.customerId,
    vendorId: updatedBooking.vendorId,
    eventDate: updatedBooking.eventDate.toISOString().split("T")[0],
    eventTime: updatedBooking.eventTime,
    eventType: updatedBooking.eventType,
    location: updatedBooking.location,
    guestCount: updatedBooking.guestCount,
    specialRequests: updatedBooking.specialRequests,
    totalAmount: Number(updatedBooking.totalAmount),
    platformFee: Number(updatedBooking.platformFee),
    vendorPayout: Number(updatedBooking.vendorPayout),
    discountAmount: updatedBooking.discountAmount ? Number(updatedBooking.discountAmount) : 0,
    loyaltyApplied: updatedBooking.loyaltyApplied,
    status: updatedBooking.status,
    createdAt: updatedBooking.createdAt,
    updatedAt: updatedBooking.updatedAt,
    acceptedAt: updatedBooking.acceptedAt,
    respondedAt: updatedBooking.respondedAt,
    cancelledAt: updatedBooking.cancelledAt,
    cancelledBy: updatedBooking.cancelledBy,
    cancellationReason: updatedBooking.cancellationReason,
    refundAmount: updatedBooking.refundAmount
      ? Number(updatedBooking.refundAmount)
      : null,
    vendor:
      booking.customerId === userId
        ? {
            id: updatedBooking.vendorProfile.id,
            businessName: updatedBooking.vendorProfile.businessName,
            cuisineType: updatedBooking.vendorProfile.cuisineType,
          }
        : undefined,
    customer:
      booking.vendorId === userId
        ? {
            id: updatedBooking.customer.id,
            email: updatedBooking.customer.email,
          }
        : undefined,
  };
}
