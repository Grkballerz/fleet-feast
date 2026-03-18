/**
 * Admin Vendors API Route
 * GET /api/admin/vendors - List ALL vendor applications (not just pending)
 */

import { NextResponse } from "next/server";
import { requireAdmin, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import prisma from "@/lib/prisma";

async function handleGET(req: AuthenticatedRequest) {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { email: true },
        },
        documents: {
          where: { deletedAt: null },
          select: {
            id: true,
            type: true,
            fileName: true,
            verified: true,
          },
        },
      },
    });

    // Map to the shape the frontend expects
    const applications = vendors.map((vendor) => ({
      id: vendor.id,
      userId: vendor.userId,
      userEmail: vendor.user.email,
      businessName: vendor.businessName,
      cuisineType: [vendor.cuisineType], // Frontend expects array
      description: vendor.description || "",
      priceRange: vendor.priceRange,
      capacityMin: vendor.capacityMin,
      capacityMax: vendor.capacityMax,
      serviceArea: vendor.serviceArea || "",
      status: vendor.status,
      createdAt: vendor.createdAt.toISOString(),
      documents: vendor.documents,
    }));

    return NextResponse.json({
      applications,
    });
  } catch (error) {
    console.error("[GET /api/admin/vendors] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGET);
