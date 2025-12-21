/**
 * Vendor Proposal API
 * POST /api/bookings/:id/proposal - Vendor sends proposal on customer inquiry
 *
 * Requires authentication (vendor only)
 */

import { NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { proposalSchema } from "@/modules/booking/booking.validation";
import { prisma } from "@/lib/prisma";
import { BookingStatus, NotificationType } from "@prisma/client";
import { NotificationService } from "@/modules/notification/notification.service";

const notificationService = new NotificationService();

/**
 * Custom error for booking operations
 */
class BookingError extends Error {
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
 * Handle POST request - Vendor sends proposal
 */
async function handlePOST(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);
    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return ApiResponses.badRequest("Invalid booking ID format");
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = proposalSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { proposalAmount, proposalDetails, expiresInDays = 7 } = validationResult.data;

    // Fetch booking with vendor profile
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            email: true,
          },
        },
        vendorProfile: {
          select: {
            userId: true,
            businessName: true,
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new BookingError("Booking not found", "BOOKING_NOT_FOUND", 404);
    }

    // Verify authenticated user is the vendor for this booking
    if (booking.vendorId !== userId) {
      throw new BookingError(
        "Only the assigned vendor can send a proposal for this booking",
        "UNAUTHORIZED",
        403
      );
    }

    // Verify booking status is INQUIRY
    if (booking.status !== BookingStatus.INQUIRY) {
      throw new BookingError(
        `Cannot send proposal. Booking status must be INQUIRY, but is currently ${booking.status}`,
        "INVALID_STATUS",
        400
      );
    }

    // Calculate platform fees (5% customer + 5% vendor = 10% total)
    const platformFeeRate = 0.10;
    const customerFeeRate = 0.05;
    const vendorFeeRate = 0.05;

    const platformFeeCustomer = Math.round(proposalAmount * customerFeeRate * 100) / 100;
    const platformFeeVendor = Math.round(proposalAmount * vendorFeeRate * 100) / 100;
    const platformFee = Math.round(proposalAmount * platformFeeRate * 100) / 100;
    const vendorPayout = Math.round((proposalAmount - platformFeeVendor) * 100) / 100;
    const totalAmount = Math.round((proposalAmount + platformFeeCustomer) * 100) / 100;

    // Calculate expiry date
    const now = new Date();
    const proposalExpiresAt = new Date(now);
    proposalExpiresAt.setDate(proposalExpiresAt.getDate() + expiresInDays);

    // Update booking with proposal
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.PROPOSAL_SENT,
        proposalAmount,
        proposalDetails,
        proposalSentAt: now,
        proposalExpiresAt,
        platformFeeCustomer,
        platformFeeVendor,
        platformFee,
        vendorPayout,
        totalAmount,
      },
    });

    // Create notification for customer
    const businessName = booking.vendorProfile.businessName;
    await notificationService.createNotification({
      userId: booking.customerId,
      type: NotificationType.PROPOSAL_SENT,
      title: `New Proposal from ${businessName}`,
      message: `${businessName} has sent you a proposal for your ${booking.eventType.toLowerCase()} event on ${new Date(booking.eventDate).toLocaleDateString()}.`,
      link: `/customer/bookings/${id}`,
      metadata: {
        bookingId: id,
        vendorName: businessName,
        proposalAmount: proposalAmount.toString(),
        totalAmount: totalAmount.toString(),
        expiresAt: proposalExpiresAt.toISOString(),
      },
    });

    return ApiResponses.ok({
      id: updatedBooking.id,
      status: updatedBooking.status,
      proposalAmount: Number(updatedBooking.proposalAmount),
      proposalExpiresAt: updatedBooking.proposalExpiresAt,
      platformFeeCustomer: Number(updatedBooking.platformFeeCustomer),
      platformFeeVendor: Number(updatedBooking.platformFeeVendor),
      totalAmount: Number(updatedBooking.totalAmount),
      vendorPayout: Number(updatedBooking.vendorPayout),
    }, "Proposal sent successfully");
  } catch (error) {
    console.error("[Proposal Send] Error:", error);

    // Handle custom booking errors
    if (error instanceof BookingError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
    return ApiResponses.internalError("Failed to send proposal");
  }
}

// Export with authentication middleware
export const POST = requireAuth(handlePOST);
