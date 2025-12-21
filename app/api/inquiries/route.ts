/**
 * Inquiries API - Submit Customer Inquiry
 * POST /api/inquiries - Create new inquiry (booking with INQUIRY status)
 *
 * Requires authentication (CUSTOMER role only)
 */

import { NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  getUser,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { inquiryRequestSchema } from "@/modules/booking/booking.validation";
import { prisma } from "@/lib/prisma";
import { UserRole, BookingStatus, NotificationType, VendorStatus } from "@prisma/client";

/**
 * Handle POST request - Create new inquiry
 */
async function handlePOST(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    // Only customers can submit inquiries
    if (user.role !== UserRole.CUSTOMER) {
      return ApiResponses.forbidden("Only customers can submit inquiries");
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = inquiryRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validationResult.data;

    // Verify vendor exists and is approved
    const vendor = await prisma.vendor.findUnique({
      where: { id: data.vendorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!vendor) {
      return ApiResponses.notFound("Vendor");
    }

    if (vendor.status !== VendorStatus.APPROVED) {
      return ApiResponses.badRequest(
        "This vendor is not currently accepting bookings"
      );
    }

    // Optional: Check vendor availability for the requested date
    const availabilityCheck = await prisma.availability.findUnique({
      where: {
        vendorId_date: {
          vendorId: data.vendorId,
          date: new Date(data.eventDate),
        },
      },
    });

    // Note: We don't block the inquiry if vendor is unavailable,
    // just log it for potential warning to customer
    const isVendorUnavailable =
      availabilityCheck && !availabilityCheck.isAvailable;

    // Create booking with INQUIRY status
    const booking = await prisma.booking.create({
      data: {
        customerId: userId,
        vendorId: vendor.userId, // Use the vendor's user ID
        eventDate: new Date(data.eventDate),
        eventTime: data.eventTime,
        eventType: data.eventType,
        location: data.location,
        guestCount: data.guestCount,
        specialRequests: data.specialRequests,
        status: BookingStatus.INQUIRY,
        // Initially set amounts to 0 (will be set by proposal)
        totalAmount: 0,
        platformFee: 0,
        vendorPayout: 0,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        eventDate: true,
        eventType: true,
      },
    });

    // Create notification for vendor
    await prisma.notification.create({
      data: {
        userId: vendor.userId,
        type: NotificationType.INQUIRY_RECEIVED,
        title: "New Inquiry from Customer",
        message: `You have a new inquiry for ${data.eventType} on ${data.eventDate}`,
        link: `/vendor/bookings/${booking.id}`,
        metadata: {
          bookingId: booking.id,
          eventType: data.eventType,
          eventDate: data.eventDate,
          guestCount: data.guestCount,
        },
      },
    });

    return ApiResponses.created({
      id: booking.id,
      status: booking.status,
      createdAt: booking.createdAt,
      message: isVendorUnavailable
        ? "Inquiry submitted successfully. Note: The vendor has marked this date as unavailable."
        : "Inquiry submitted successfully. The vendor will respond with a proposal soon.",
    });
  } catch (error) {
    console.error("[Inquiries Create] Error:", error);

    // Handle Prisma-specific errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; meta?: Record<string, unknown> };

      // Handle foreign key constraint violations
      if (prismaError.code === "P2003") {
        return ApiResponses.notFound("Vendor");
      }

      // Handle unique constraint violations
      if (prismaError.code === "P2002") {
        return ApiResponses.conflict(
          "A booking for this event already exists"
        );
      }
    }

    // Handle unexpected errors
    return ApiResponses.internalError("Failed to submit inquiry");
  }
}

// Export with authentication middleware
export const POST = requireAuth(handlePOST);
