/**
 * Admin Stats API Route
 * GET /api/admin/stats - Platform-wide statistics for admin dashboard
 */

import { NextResponse } from "next/server";
import { requireAdmin, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import prisma from "@/lib/prisma";

async function handleGET(req: AuthenticatedRequest) {
  try {
    // Run all queries in parallel for performance
    const [
      activeUsers,
      activeVendors,
      pendingApplications,
      openDisputes,
      pendingViolations,
      revenueResult,
      gmvResult,
    ] = await Promise.all([
      // Active users (non-admin, non-deleted)
      prisma.user.count({
        where: {
          status: "ACTIVE",
          deletedAt: null,
          role: { not: "ADMIN" },
        },
      }),

      // Active vendors (approved)
      prisma.vendor.count({
        where: {
          status: "APPROVED",
          deletedAt: null,
        },
      }),

      // Pending vendor applications
      prisma.vendor.count({
        where: {
          status: "PENDING",
          deletedAt: null,
        },
      }),

      // Open disputes
      prisma.dispute.count({
        where: {
          status: { in: ["OPEN", "INVESTIGATING", "ESCALATED"] },
        },
      }),

      // Pending violations (unresolved)
      prisma.violation.count({
        where: {
          resolvedAt: null,
        },
      }),

      // Platform revenue (sum of platformFee from all bookings with payments)
      prisma.booking.aggregate({
        _sum: {
          platformFee: true,
        },
        where: {
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
      }),

      // GMV (total booking amounts)
      prisma.booking.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
      }),
    ]);

    const revenue = revenueResult._sum.platformFee
      ? Number(revenueResult._sum.platformFee)
      : 0;
    const gmv = gmvResult._sum.totalAmount
      ? Number(gmvResult._sum.totalAmount)
      : 0;

    return NextResponse.json({
      data: {
        gmv,
        revenue,
        activeUsers,
        activeVendors,
        pendingApplications,
        openDisputes,
        pendingViolations,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform stats" },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGET);
