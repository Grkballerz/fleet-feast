/**
 * Admin Activity API Route
 * GET /api/admin/activity - Recent platform activity for admin dashboard
 */

import { NextResponse } from "next/server";
import { requireAdmin, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import prisma from "@/lib/prisma";

interface ActivityItem {
  id: string;
  type: "vendor_application" | "dispute" | "violation" | "booking";
  description: string;
  timestamp: Date;
  actionUrl?: string;
}

async function handleGET(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Fetch recent items from multiple sources in parallel
    const [recentBookings, recentApplications, recentDisputes, recentViolations] =
      await Promise.all([
        // Recent bookings
        prisma.booking.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            createdAt: true,
            status: true,
            customer: { select: { email: true } },
            vendorProfile: { select: { businessName: true } },
          },
        }),

        // Recent vendor applications
        prisma.vendor.findMany({
          take: limit,
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            createdAt: true,
            businessName: true,
            user: { select: { email: true } },
          },
        }),

        // Recent disputes
        prisma.dispute.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            createdAt: true,
            status: true,
            reason: true,
            initiator: { select: { email: true } },
          },
        }),

        // Recent violations
        prisma.violation.findMany({
          take: limit,
          where: { resolvedAt: null },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            createdAt: true,
            type: true,
            severity: true,
            user: { select: { email: true } },
          },
        }),
      ]);

    // Transform into unified activity items
    const activities: ActivityItem[] = [];

    for (const booking of recentBookings) {
      activities.push({
        id: `booking-${booking.id}`,
        type: "booking",
        description: `New booking from ${booking.customer.email} with ${booking.vendorProfile.businessName} (${booking.status})`,
        timestamp: booking.createdAt,
        actionUrl: `/admin/disputes`, // Bookings reviewed through disputes if needed
      });
    }

    for (const app of recentApplications) {
      activities.push({
        id: `vendor-${app.id}`,
        type: "vendor_application",
        description: `New vendor application: ${app.businessName} (${app.user.email})`,
        timestamp: app.createdAt,
        actionUrl: `/admin/vendors/${app.id}`,
      });
    }

    for (const dispute of recentDisputes) {
      activities.push({
        id: `dispute-${dispute.id}`,
        type: "dispute",
        description: `Dispute ${dispute.status}: ${dispute.reason.slice(0, 80)}${dispute.reason.length > 80 ? "..." : ""}`,
        timestamp: dispute.createdAt,
        actionUrl: `/admin/disputes/${dispute.id}`,
      });
    }

    for (const violation of recentViolations) {
      activities.push({
        id: `violation-${violation.id}`,
        type: "violation",
        description: `${violation.severity} ${violation.type.replace(/_/g, " ")} violation by ${violation.user.email}`,
        timestamp: violation.createdAt,
        actionUrl: `/admin/violations`,
      });
    }

    // Sort all activities by timestamp descending and limit
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      data: activities.slice(0, limit),
    });
  } catch (error) {
    console.error("[GET /api/admin/activity] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGET);
