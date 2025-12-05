/**
 * Quote Service Layer
 * Handles business logic for quote requests and quote submissions
 */

import { prisma } from "@/lib/prisma";
import { UserRole, VendorStatus, QuoteRequestStatus, QuoteStatus } from "@prisma/client";
import type {
  CreateQuoteRequestData,
  SubmitQuoteData,
  AcceptQuoteData,
  QuoteRequestDetails,
  QuoteDetails,
  QuoteRequestListItem,
  QuoteListItem,
  QuoteComparison,
} from "./quote.types";

/**
 * Custom error class for quote operations
 */
export class QuoteError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "QuoteError";
  }
}

/**
 * Default quote expiry (7 days from creation)
 */
export const DEFAULT_QUOTE_EXPIRY_DAYS = 7;

/**
 * Default quote validity (14 days from submission)
 */
export const DEFAULT_QUOTE_VALIDITY_DAYS = 14;

/**
 * Create a new quote request
 */
export async function createQuoteRequest(
  customerId: string,
  data: CreateQuoteRequestData
): Promise<QuoteRequestDetails> {
  // Verify customer exists and has CUSTOMER role
  const customer = await prisma.user.findUnique({
    where: { id: customerId, deletedAt: null },
  });

  if (!customer) {
    throw new QuoteError("Customer not found", "CUSTOMER_NOT_FOUND", 404);
  }

  if (customer.role !== UserRole.CUSTOMER) {
    throw new QuoteError(
      "Only customers can create quote requests",
      "INVALID_ROLE",
      403
    );
  }

  // Verify all vendors exist and are approved
  const vendors = await prisma.vendor.findMany({
    where: {
      id: { in: data.vendorIds },
      deletedAt: null,
    },
    include: { user: true },
  });

  if (vendors.length !== data.vendorIds.length) {
    throw new QuoteError(
      "One or more vendors not found",
      "VENDOR_NOT_FOUND",
      404
    );
  }

  const notApprovedVendors = vendors.filter((v) => v.status !== VendorStatus.APPROVED);
  if (notApprovedVendors.length > 0) {
    throw new QuoteError(
      `Vendor(s) ${notApprovedVendors.map((v) => v.businessName).join(", ")} are not available for bookings`,
      "VENDOR_NOT_APPROVED",
      400
    );
  }

  // Calculate expiry date (default 7 days from now)
  const expiresAt = data.expiresAt
    ? new Date(data.expiresAt)
    : new Date(Date.now() + DEFAULT_QUOTE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  // Create quote request
  const quoteRequest = await prisma.quoteRequest.create({
    data: {
      customerId,
      eventDate: new Date(data.eventDate),
      eventType: data.eventType,
      guestCount: data.guestCount,
      location: data.location,
      requirements: data.requirements,
      budget: data.budget,
      expiresAt,
      status: QuoteRequestStatus.OPEN,
    },
    include: {
      customer: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  // Create pending quotes for each selected vendor
  await prisma.quote.createMany({
    data: data.vendorIds.map((vendorId) => ({
      requestId: quoteRequest.id,
      vendorId: vendors.find((v) => v.id === vendorId)!.userId,
      status: QuoteStatus.PENDING,
      pricing: { total: 0 }, // Placeholder until vendor submits
      inclusions: [],
      validUntil: expiresAt,
    })),
  });

  // TODO: Send notifications to vendors about new RFQ

  return {
    id: quoteRequest.id,
    customerId: quoteRequest.customerId,
    eventDate: quoteRequest.eventDate.toISOString().split("T")[0],
    eventType: quoteRequest.eventType,
    guestCount: quoteRequest.guestCount,
    location: quoteRequest.location,
    requirements: quoteRequest.requirements,
    budget: quoteRequest.budget ? Number(quoteRequest.budget) : null,
    status: quoteRequest.status,
    expiresAt: quoteRequest.expiresAt,
    createdAt: quoteRequest.createdAt,
    updatedAt: quoteRequest.updatedAt,
    customer: {
      id: quoteRequest.customer.id,
      email: quoteRequest.customer.email,
    },
  };
}

/**
 * Submit a quote for a quote request (vendor)
 */
export async function submitQuote(
  requestId: string,
  vendorId: string,
  data: SubmitQuoteData
): Promise<QuoteDetails> {
  // Verify vendor exists and has VENDOR role
  const vendor = await prisma.vendor.findUnique({
    where: { userId: vendorId, deletedAt: null },
    include: { user: true },
  });

  if (!vendor || vendor.user.role !== UserRole.VENDOR) {
    throw new QuoteError("Vendor not found", "VENDOR_NOT_FOUND", 404);
  }

  // Get quote request
  const quoteRequest = await prisma.quoteRequest.findUnique({
    where: { id: requestId },
  });

  if (!quoteRequest) {
    throw new QuoteError("Quote request not found", "QUOTE_REQUEST_NOT_FOUND", 404);
  }

  // Check if request is still open
  if (quoteRequest.status !== QuoteRequestStatus.OPEN) {
    throw new QuoteError(
      "Quote request is no longer accepting quotes",
      "QUOTE_REQUEST_CLOSED",
      400
    );
  }

  // Check if request has expired
  if (new Date() > quoteRequest.expiresAt) {
    throw new QuoteError(
      "Quote request has expired",
      "QUOTE_REQUEST_EXPIRED",
      400
    );
  }

  // Find the pending quote for this vendor
  const existingQuote = await prisma.quote.findUnique({
    where: {
      requestId_vendorId: {
        requestId,
        vendorId,
      },
    },
  });

  if (!existingQuote) {
    throw new QuoteError(
      "You were not invited to quote on this request",
      "QUOTE_NOT_FOUND",
      404
    );
  }

  if (existingQuote.status !== QuoteStatus.PENDING) {
    throw new QuoteError(
      "Quote has already been submitted",
      "QUOTE_ALREADY_SUBMITTED",
      400
    );
  }

  // Update quote with submission data
  const updatedQuote = await prisma.quote.update({
    where: { id: existingQuote.id },
    data: {
      pricing: data.pricing,
      inclusions: data.inclusions,
      terms: data.terms,
      validUntil: new Date(data.validUntil),
      status: QuoteStatus.SUBMITTED,
    },
    include: {
      request: {
        select: {
          id: true,
          eventDate: true,
          eventType: true,
          guestCount: true,
          location: true,
          requirements: true,
          budget: true,
        },
      },
      vendor: {
        select: {
          id: true,
          email: true,
          vendor: {
            select: {
              id: true,
              businessName: true,
              cuisineType: true,
            },
          },
        },
      },
    },
  });

  // TODO: Send notification to customer about new quote

  return {
    id: updatedQuote.id,
    requestId: updatedQuote.requestId,
    vendorId: updatedQuote.vendorId,
    pricing: updatedQuote.pricing as any,
    inclusions: updatedQuote.inclusions,
    terms: updatedQuote.terms,
    validUntil: updatedQuote.validUntil,
    status: updatedQuote.status,
    bookingId: updatedQuote.bookingId,
    createdAt: updatedQuote.createdAt,
    updatedAt: updatedQuote.updatedAt,
    vendor: {
      id: updatedQuote.vendor.vendor!.id,
      businessName: updatedQuote.vendor.vendor!.businessName,
      cuisineType: updatedQuote.vendor.vendor!.cuisineType,
      email: updatedQuote.vendor.email,
    },
    request: {
      id: updatedQuote.request.id,
      eventDate: updatedQuote.request.eventDate.toISOString().split("T")[0],
      eventType: updatedQuote.request.eventType,
      guestCount: updatedQuote.request.guestCount,
      location: updatedQuote.request.location,
      requirements: updatedQuote.request.requirements,
      budget: updatedQuote.request.budget ? Number(updatedQuote.request.budget) : null,
    },
  };
}

/**
 * Get customer's quote requests
 */
export async function getCustomerQuoteRequests(
  customerId: string
): Promise<QuoteRequestListItem[]> {
  const requests = await prisma.quoteRequest.findMany({
    where: { customerId },
    include: {
      quotes: {
        where: { status: QuoteStatus.SUBMITTED },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((req) => ({
    id: req.id,
    eventDate: req.eventDate.toISOString().split("T")[0],
    eventType: req.eventType,
    guestCount: req.guestCount,
    location: req.location,
    status: req.status,
    quotesReceived: req.quotes.length,
    createdAt: req.createdAt,
    expiresAt: req.expiresAt,
  }));
}

/**
 * Get vendor's received quote requests
 */
export async function getVendorQuoteRequests(
  vendorId: string
): Promise<QuoteListItem[]> {
  const quotes = await prisma.quote.findMany({
    where: { vendorId },
    include: {
      request: {
        select: {
          eventDate: true,
          eventType: true,
          guestCount: true,
          location: true,
          customer: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return quotes.map((quote) => ({
    id: quote.id,
    requestId: quote.requestId,
    status: quote.status,
    pricing: quote.pricing as any,
    validUntil: quote.validUntil,
    createdAt: quote.createdAt,
    request: {
      eventDate: quote.request.eventDate.toISOString().split("T")[0],
      eventType: quote.request.eventType,
      guestCount: quote.request.guestCount,
      location: quote.request.location,
      customerEmail: quote.request.customer.email,
    },
  }));
}

/**
 * Get quote request details with all quotes
 */
export async function getQuoteRequestDetails(
  requestId: string,
  userId: string
): Promise<QuoteRequestDetails> {
  const request = await prisma.quoteRequest.findUnique({
    where: { id: requestId },
    include: {
      customer: {
        select: {
          id: true,
          email: true,
        },
      },
      quotes: {
        where: { status: { not: QuoteStatus.PENDING } },
        include: {
          vendor: {
            select: {
              id: true,
              email: true,
              vendor: {
                select: {
                  id: true,
                  businessName: true,
                  cuisineType: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!request) {
    throw new QuoteError("Quote request not found", "QUOTE_REQUEST_NOT_FOUND", 404);
  }

  // Authorization: only customer can view
  if (request.customerId !== userId) {
    throw new QuoteError(
      "You don't have permission to view this quote request",
      "UNAUTHORIZED",
      403
    );
  }

  // Get vendor ratings
  const vendorIds = request.quotes.map((q) => q.vendor.vendor!.id);
  const vendorRatings = await prisma.review.groupBy({
    by: ["revieweeId"],
    where: {
      revieweeId: { in: request.quotes.map((q) => q.vendorId) },
      hidden: false,
      deletedAt: null,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  const ratingMap = new Map(
    vendorRatings.map((r) => [r.revieweeId, { avg: r._avg.rating, count: r._count.id }])
  );

  return {
    id: request.id,
    customerId: request.customerId,
    eventDate: request.eventDate.toISOString().split("T")[0],
    eventType: request.eventType,
    guestCount: request.guestCount,
    location: request.location,
    requirements: request.requirements,
    budget: request.budget ? Number(request.budget) : null,
    status: request.status,
    expiresAt: request.expiresAt,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    customer: {
      id: request.customer.id,
      email: request.customer.email,
    },
    quotes: request.quotes.map((quote) => {
      const rating = ratingMap.get(quote.vendorId);
      return {
        id: quote.id,
        requestId: quote.requestId,
        vendorId: quote.vendorId,
        pricing: quote.pricing as any,
        inclusions: quote.inclusions,
        terms: quote.terms,
        validUntil: quote.validUntil,
        status: quote.status,
        bookingId: quote.bookingId,
        createdAt: quote.createdAt,
        updatedAt: quote.updatedAt,
        vendor: {
          id: quote.vendor.vendor!.id,
          businessName: quote.vendor.vendor!.businessName,
          cuisineType: quote.vendor.vendor!.cuisineType,
          email: quote.vendor.email,
          avgRating: rating?.avg || undefined,
          totalReviews: rating?.count || 0,
        },
      };
    }),
  };
}

/**
 * Accept a quote and create booking
 */
export async function acceptQuote(
  quoteId: string,
  customerId: string,
  data: AcceptQuoteData
): Promise<{ booking: any; quote: QuoteDetails }> {
  // Get quote with request details
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      request: true,
      vendor: {
        select: {
          id: true,
          vendor: {
            select: {
              id: true,
              businessName: true,
              cuisineType: true,
            },
          },
        },
      },
    },
  });

  if (!quote) {
    throw new QuoteError("Quote not found", "QUOTE_NOT_FOUND", 404);
  }

  // Verify authorization
  if (quote.request.customerId !== customerId) {
    throw new QuoteError(
      "You don't have permission to accept this quote",
      "UNAUTHORIZED",
      403
    );
  }

  // Check quote status
  if (quote.status !== QuoteStatus.SUBMITTED) {
    throw new QuoteError(
      "Quote is not available for acceptance",
      "QUOTE_NOT_AVAILABLE",
      400
    );
  }

  // Check if quote has expired
  if (new Date() > quote.validUntil) {
    throw new QuoteError("Quote has expired", "QUOTE_EXPIRED", 400);
  }

  // Check if request is still open
  if (quote.request.status !== QuoteRequestStatus.OPEN) {
    throw new QuoteError(
      "Quote request is no longer accepting quotes",
      "QUOTE_REQUEST_CLOSED",
      400
    );
  }

  const pricing = quote.pricing as any;
  const totalAmount = pricing.total;

  // Calculate platform fee (15%)
  const platformFee = totalAmount * 0.15;
  const vendorPayout = totalAmount - platformFee;

  // Create booking from quote
  const booking = await prisma.$transaction(async (tx) => {
    // Create booking
    const newBooking = await tx.booking.create({
      data: {
        customerId,
        vendorId: quote.vendorId,
        eventDate: quote.request.eventDate,
        eventTime: data.eventTime,
        eventType: quote.request.eventType,
        location: quote.request.location,
        guestCount: quote.request.guestCount,
        specialRequests: data.specialRequests,
        totalAmount,
        platformFee,
        vendorPayout,
        status: "PENDING",
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

    // Update quote status and link to booking
    await tx.quote.update({
      where: { id: quoteId },
      data: {
        status: QuoteStatus.ACCEPTED,
        bookingId: newBooking.id,
      },
    });

    // Update quote request status
    await tx.quoteRequest.update({
      where: { id: quote.requestId },
      data: {
        status: QuoteRequestStatus.ACCEPTED,
      },
    });

    // Reject other quotes for this request
    await tx.quote.updateMany({
      where: {
        requestId: quote.requestId,
        id: { not: quoteId },
        status: QuoteStatus.SUBMITTED,
      },
      data: {
        status: QuoteStatus.REJECTED,
      },
    });

    return newBooking;
  });

  // TODO: Send notifications to vendor and rejected vendors

  return {
    booking: {
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
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      vendor: {
        id: booking.vendorProfile.id,
        businessName: booking.vendorProfile.businessName,
        cuisineType: booking.vendorProfile.cuisineType,
      },
    },
    quote: {
      id: quote.id,
      requestId: quote.requestId,
      vendorId: quote.vendorId,
      pricing: quote.pricing as any,
      inclusions: quote.inclusions,
      terms: quote.terms,
      validUntil: quote.validUntil,
      status: QuoteStatus.ACCEPTED,
      bookingId: booking.id,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    },
  };
}
