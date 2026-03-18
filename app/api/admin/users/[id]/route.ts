/**
 * Admin User Detail API Route
 * GET /api/admin/users/[id] - Get user detail with bookings, reviews, violations
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

    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            status: true,
            cuisineType: true,
            priceRange: true,
          },
        },
        bookingsAsCustomer: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            totalAmount: true,
            eventDate: true,
            createdAt: true,
            vendorProfile: {
              select: { businessName: true },
            },
          },
        },
        reviewsGiven: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            content: true,
            createdAt: true,
          },
        },
        violations: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            type: true,
            severity: true,
            description: true,
            resolvedAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            bookingsAsCustomer: true,
            reviewsGiven: true,
            violations: true,
            disputesInitiated: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: user.id,
        name: user.email.split("@")[0],
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.updatedAt.toISOString(),
        vendor: user.vendor,
        bookings: user.bookingsAsCustomer.map((b) => ({
          id: b.id,
          status: b.status,
          totalAmount: Number(b.totalAmount),
          eventDate: b.eventDate.toISOString(),
          createdAt: b.createdAt.toISOString(),
          vendorName: b.vendorProfile.businessName,
        })),
        reviews: user.reviewsGiven.map((r) => ({
          id: r.id,
          rating: r.rating,
          content: r.content,
          createdAt: r.createdAt.toISOString(),
        })),
        violations: user.violations.map((v) => ({
          id: v.id,
          type: v.type,
          severity: v.severity,
          description: v.description,
          resolved: !!v.resolvedAt,
          createdAt: v.createdAt.toISOString(),
        })),
        counts: user._count,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/users/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGET);
