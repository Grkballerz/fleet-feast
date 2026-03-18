/**
 * Admin - Pending Vendor Applications API
 * GET /api/admin/vendors/pending
 *
 * Returns list of pending vendor applications for admin review
 * Requires ADMIN role
 */

import { NextResponse } from "next/server";
import { requireAdmin, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import { getPendingApplications } from "@/modules/vendor/vendor.service";

/**
 * Handle GET request to fetch pending vendor applications
 */
async function handleGET(req: AuthenticatedRequest) {
  try {
    // Get pending applications
    const applications = await getPendingApplications();

    return NextResponse.json({
      applications: applications.map((app) => ({
        id: app.id,
        userId: app.userId,
        userEmail: app.user.email,
        businessName: app.businessName,
        cuisineType: [app.cuisineType], // Frontend expects array
        description: app.description,
        priceRange: app.priceRange,
        capacityMin: app.capacityMin,
        capacityMax: app.capacityMax,
        serviceArea: app.serviceArea,
        status: app.status,
        createdAt: app.createdAt,
        documents: app.documents.map((doc) => ({
          id: doc.id,
          type: doc.type,
          fileName: doc.fileName,
          verified: doc.verified,
        })),
      })),
      total: applications.length,
    });
  } catch (error) {
    console.error("[Admin Pending Vendors] Error:", error);

    // Handle unexpected errors
    return NextResponse.json(
      { error: "Failed to fetch pending applications" },
      { status: 500 }
    );
  }
}

// Export with authentication middleware (requires ADMIN role)
export const GET = requireAdmin(handleGET);
