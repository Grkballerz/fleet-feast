/**
 * Cron Endpoint: Check Expiring Proposals
 * POST /api/cron/check-expiring-proposals
 *
 * Scheduled to run every 6 hours
 * Finds proposals expiring within 24-48 hours and sends notifications
 *
 * Should be called by cron service (e.g., Vercel Cron, GitHub Actions)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyProposalExpiring, notifyProposalExpired } from "@/modules/notification/notification.service";

/**
 * POST /api/cron/check-expiring-proposals
 * Check for expiring proposals and send notifications
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret (if configured)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[Cron: Check Expiring Proposals] Starting...");

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Find proposals that expire within 24-48 hours
    // Note: We check if notification was already sent in the Notification table
    const expiringProposals = await prisma.booking.findMany({
      where: {
        status: "PROPOSAL_SENT",
        proposalExpiresAt: {
          gte: in24Hours,
          lte: in48Hours,
        },
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
            businessName: true,
          },
        },
      },
    });

    // Send expiring notifications
    let expiringNotificationsSent = 0;
    for (const booking of expiringProposals) {
      if (!booking.proposalExpiresAt || !booking.proposalAmount) continue;

      // Check if we already sent expiring notification for this booking
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: booking.customerId,
          type: "PROPOSAL_EXPIRING",
          metadata: {
            path: ["bookingId"],
            equals: booking.id,
          },
        },
      });

      if (existingNotification) {
        // Already notified, skip
        continue;
      }

      const timeLeft = getTimeLeft(booking.proposalExpiresAt);

      await notifyProposalExpiring({
        customerId: booking.customerId,
        bookingId: booking.id,
        businessName: booking.vendorProfile.businessName,
        eventType: booking.eventType || "Event",
        eventDate: booking.eventDate.toLocaleDateString(),
        proposalAmount: booking.proposalAmount.toString(),
        timeLeft,
        expiresAt: booking.proposalExpiresAt.toLocaleString(),
      });

      expiringNotificationsSent++;
    }

    // Find expired proposals that haven't been marked as expired
    const expiredProposals = await prisma.booking.findMany({
      where: {
        status: "PROPOSAL_SENT",
        proposalExpiresAt: {
          lt: now,
        },
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
            businessName: true,
          },
        },
      },
    });

    // Process expired proposals
    let proposalsExpired = 0;
    for (const booking of expiredProposals) {
      // Update booking status to EXPIRED
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "EXPIRED" },
      });

      // Get customer name for vendor notification
      const customer = await prisma.user.findUnique({
        where: { id: booking.customerId },
        select: { email: true },
      });

      // Notify customer
      await notifyProposalExpired({
        userId: booking.customerId,
        bookingId: booking.id,
        eventType: booking.eventType || "Event",
        eventDate: booking.eventDate.toLocaleDateString(),
        businessName: booking.vendorProfile.businessName,
      });

      // Notify vendor
      await notifyProposalExpired({
        userId: booking.vendorId,
        bookingId: booking.id,
        eventType: booking.eventType || "Event",
        eventDate: booking.eventDate.toLocaleDateString(),
        customerName: customer?.email?.split('@')[0] || "Customer",
      });

      proposalsExpired++;
    }

    console.log("[Cron: Check Expiring Proposals] Completed:", {
      expiringNotificationsSent,
      proposalsExpired,
    });

    return NextResponse.json({
      success: true,
      message: "Expiring proposals checked successfully",
      data: {
        expiringNotificationsSent,
        proposalsExpired,
      },
    });
  } catch (error) {
    console.error("[Cron: Check Expiring Proposals] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to check expiring proposals",
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate human-readable time left until expiry
 */
function getTimeLeft(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
}
