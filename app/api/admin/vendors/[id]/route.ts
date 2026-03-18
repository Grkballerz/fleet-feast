/**
 * Admin Vendor Detail API Route
 * GET /api/admin/vendors/[id] - Get vendor detail with documents, bookings, reviews
 */

import { NextResponse } from "next/server";
import { requireAdmin, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import prisma from "@/lib/prisma";

async function handleGET(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
        documents: {
          where: { deletedAt: null },
          select: {
            id: true,
            type: true,
            fileName: true,
            fileUrl: true,
            fileSize: true,
            verified: true,
            verifiedAt: true,
            rejectionReason: true,
            createdAt: true,
          },
        },
        bookings: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            totalAmount: true,
            platformFee: true,
            eventDate: true,
            guestCount: true,
            createdAt: true,
            customer: { select: { email: true } },
            review: {
              select: { rating: true, content: true },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
            documents: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Calculate vendor stats
    const totalRevenue = vendor.bookings.reduce(
      (sum, b) => sum + Number(b.totalAmount),
      0
    );
    const avgRating =
      vendor.bookings.filter((b) => b.review).length > 0
        ? vendor.bookings
            .filter((b) => b.review)
            .reduce((sum, b) => sum + (b.review?.rating || 0), 0) /
          vendor.bookings.filter((b) => b.review).length
        : 0;

    return NextResponse.json({
      data: {
        id: vendor.id,
        userId: vendor.userId,
        userEmail: vendor.user.email,
        businessName: vendor.businessName,
        cuisineType: vendor.cuisineType,
        description: vendor.description,
        priceRange: vendor.priceRange,
        capacityMin: vendor.capacityMin,
        capacityMax: vendor.capacityMax,
        serviceArea: vendor.serviceArea,
        status: vendor.status,
        approvedAt: vendor.approvedAt?.toISOString() || null,
        rejectionReason: vendor.rejectionReason,
        createdAt: vendor.createdAt.toISOString(),
        documents: vendor.documents.map((doc) => ({
          ...doc,
          verifiedAt: doc.verifiedAt?.toISOString() || null,
          createdAt: doc.createdAt.toISOString(),
        })),
        bookings: vendor.bookings.map((b) => ({
          id: b.id,
          status: b.status,
          totalAmount: Number(b.totalAmount),
          platformFee: Number(b.platformFee),
          eventDate: b.eventDate.toISOString(),
          guestCount: b.guestCount,
          customerEmail: b.customer.email,
          review: b.review,
          createdAt: b.createdAt.toISOString(),
        })),
        stats: {
          totalBookings: vendor._count.bookings,
          totalDocuments: vendor._count.documents,
          totalRevenue,
          avgRating: Math.round(avgRating * 10) / 10,
        },
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/vendors/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor details" },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGET);
