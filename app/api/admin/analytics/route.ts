/**
 * Admin Analytics API Route
 * GET /api/admin/analytics - Platform analytics with timeframe filter
 */

import { NextResponse } from "next/server";
import { requireAdmin, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import prisma from "@/lib/prisma";

function getDateRange(timeframe: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (timeframe) {
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
    case "30d":
    default:
      start.setDate(start.getDate() - 30);
      break;
  }

  return { start, end };
}

function getLastPeriodRange(timeframe: string): { start: Date; end: Date } {
  const { start: currentStart } = getDateRange(timeframe);
  const end = new Date(currentStart);
  const start = new Date(currentStart);

  switch (timeframe) {
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
    case "30d":
    default:
      start.setDate(start.getDate() - 30);
      break;
  }

  return { start, end };
}

function calcGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

async function handleGET(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "30d";

    const { start: thisStart, end: thisEnd } = getDateRange(timeframe);
    const { start: lastStart, end: lastEnd } = getLastPeriodRange(timeframe);

    // Get first day of current month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Get first day of last month
    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(monthStart);

    const [
      // GMV
      gmvTotal,
      gmvThisMonth,
      gmvLastMonth,

      // Revenue
      revenueTotal,
      revenueThisMonth,
      revenueLastMonth,

      // Users
      usersTotal,
      usersActive,
      usersNewThisMonth,
      usersNewLastMonth,

      // Vendors
      vendorsTotal,
      vendorsActive,
      vendorsNewThisMonth,
      vendorsNewLastMonth,

      // Bookings
      bookingsTotal,
      bookingsThisMonth,
      bookingsLastMonth,

      // Top vendors
      topVendors,

      // Recent bookings
      recentBookings,
    ] = await Promise.all([
      // GMV totals
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      }),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ["CONFIRMED", "COMPLETED"] },
          createdAt: { gte: monthStart },
        },
      }),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ["CONFIRMED", "COMPLETED"] },
          createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
        },
      }),

      // Revenue totals
      prisma.booking.aggregate({
        _sum: { platformFee: true },
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      }),
      prisma.booking.aggregate({
        _sum: { platformFee: true },
        where: {
          status: { in: ["CONFIRMED", "COMPLETED"] },
          createdAt: { gte: monthStart },
        },
      }),
      prisma.booking.aggregate({
        _sum: { platformFee: true },
        where: {
          status: { in: ["CONFIRMED", "COMPLETED"] },
          createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
        },
      }),

      // Users
      prisma.user.count({ where: { deletedAt: null, role: { not: "ADMIN" } } }),
      prisma.user.count({
        where: { status: "ACTIVE", deletedAt: null, role: { not: "ADMIN" } },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: monthStart },
          deletedAt: null,
          role: { not: "ADMIN" },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
          deletedAt: null,
          role: { not: "ADMIN" },
        },
      }),

      // Vendors
      prisma.vendor.count({ where: { deletedAt: null } }),
      prisma.vendor.count({ where: { status: "APPROVED", deletedAt: null } }),
      prisma.vendor.count({
        where: {
          createdAt: { gte: monthStart },
          deletedAt: null,
        },
      }),
      prisma.vendor.count({
        where: {
          createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
          deletedAt: null,
        },
      }),

      // Bookings
      prisma.booking.count(),
      prisma.booking.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.booking.count({
        where: { createdAt: { gte: lastMonthStart, lt: lastMonthEnd } },
      }),

      // Top vendors by revenue (bookings with CONFIRMED/COMPLETED status)
      prisma.booking.groupBy({
        by: ["vendorId"],
        _sum: { totalAmount: true },
        _count: { id: true },
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
        orderBy: { _sum: { totalAmount: "desc" } },
        take: 5,
      }),

      // Recent bookings
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          customer: { select: { email: true } },
          vendorProfile: { select: { businessName: true } },
        },
      }),
    ]);

    // Resolve vendor names for top vendors
    const vendorIds = topVendors.map((v) => v.vendorId);
    const vendorProfiles = vendorIds.length > 0
      ? await prisma.vendor.findMany({
          where: { userId: { in: vendorIds } },
          select: { userId: true, businessName: true },
        })
      : [];
    const vendorNameMap = new Map(
      vendorProfiles.map((v) => [v.userId, v.businessName])
    );

    const gmvThisVal = Number(gmvThisMonth._sum.totalAmount || 0);
    const gmvLastVal = Number(gmvLastMonth._sum.totalAmount || 0);
    const revThisVal = Number(revenueThisMonth._sum.platformFee || 0);
    const revLastVal = Number(revenueLastMonth._sum.platformFee || 0);

    return NextResponse.json({
      data: {
        gmv: {
          total: Number(gmvTotal._sum.totalAmount || 0),
          thisMonth: gmvThisVal,
          lastMonth: gmvLastVal,
          growth: calcGrowth(gmvThisVal, gmvLastVal),
        },
        revenue: {
          total: Number(revenueTotal._sum.platformFee || 0),
          thisMonth: revThisVal,
          lastMonth: revLastVal,
          growth: calcGrowth(revThisVal, revLastVal),
        },
        users: {
          total: usersTotal,
          active: usersActive,
          newThisMonth: usersNewThisMonth,
          growth: calcGrowth(usersNewThisMonth, usersNewLastMonth),
        },
        vendors: {
          total: vendorsTotal,
          active: vendorsActive,
          newThisMonth: vendorsNewThisMonth,
          growth: calcGrowth(vendorsNewThisMonth, vendorsNewLastMonth),
        },
        bookings: {
          total: bookingsTotal,
          thisMonth: bookingsThisMonth,
          lastMonth: bookingsLastMonth,
          growth: calcGrowth(bookingsThisMonth, bookingsLastMonth),
        },
        topVendors: topVendors.map((v) => ({
          id: v.vendorId,
          name: vendorNameMap.get(v.vendorId) || "Unknown Vendor",
          bookings: v._count.id,
          revenue: Number(v._sum.totalAmount || 0),
        })),
        recentBookings: recentBookings.map((b) => ({
          id: b.id,
          vendorName: b.vendorProfile.businessName,
          customerName: b.customer.email,
          amount: Number(b.totalAmount),
          date: b.createdAt.toISOString(),
          status: b.status,
        })),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGET);
