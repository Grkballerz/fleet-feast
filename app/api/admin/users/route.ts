/**
 * Admin Users API Route
 * GET /api/admin/users - List users with search, role/status filters
 */

import { NextResponse } from "next/server";
import { requireAdmin, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import prisma from "@/lib/prisma";
import { Prisma, UserRole, UserStatus } from "@prisma/client";

async function handleGET(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") as UserRole | null;
    const status = searchParams.get("status") as UserStatus | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookingsAsCustomer: true,
            violations: true,
          },
        },
      },
    });

    // Map to the shape the frontend expects
    const mappedUsers = users.map((user) => ({
      id: user.id,
      name: user.email.split("@")[0], // Use email prefix as display name
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.updatedAt.toISOString(), // Use updatedAt as proxy for last login
      bookingsCount: user._count.bookingsAsCustomer,
      violationsCount: user._count.violations,
    }));

    return NextResponse.json({
      users: mappedUsers,
    });
  } catch (error) {
    console.error("[GET /api/admin/users] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGET);
