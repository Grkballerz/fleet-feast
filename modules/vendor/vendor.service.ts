/**
 * Vendor Service Layer
 * Handles business logic for vendor application, approval, and profile management
 */

import { prisma } from "@/lib/prisma";
import { VendorStatus, UserRole, DocumentType } from "@prisma/client";
import type {
  VendorApplicationData,
  VendorProfileUpdateData,
  VendorDocumentData,
  VendorApprovalData,
  VendorRejectionData,
  PublicVendorProfile,
  VendorProfile,
  PendingVendorApplication,
} from "./vendor.types";

/**
 * Custom error classes for vendor operations
 */
export class VendorError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "VendorError";
  }
}

/**
 * Submit vendor application
 * Creates a new vendor record with PENDING status
 */
export async function submitVendorApplication(
  userId: string,
  data: VendorApplicationData
): Promise<{ vendorId: string; status: VendorStatus }> {
  // Check if user exists and has VENDOR role
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    include: { vendor: true },
  });

  if (!user) {
    throw new VendorError("User not found", "USER_NOT_FOUND", 404);
  }

  if (user.role !== UserRole.VENDOR) {
    throw new VendorError(
      "User must have VENDOR role to submit application",
      "INVALID_ROLE",
      403
    );
  }

  // Check if vendor application already exists
  if (user.vendor) {
    throw new VendorError(
      "Vendor application already exists for this user",
      "APPLICATION_EXISTS",
      409
    );
  }

  // Create vendor record
  const vendor = await prisma.vendor.create({
    data: {
      userId,
      businessName: data.businessName,
      cuisineType: data.cuisineType,
      description: data.description,
      priceRange: data.priceRange,
      capacityMin: data.capacityMin,
      capacityMax: data.capacityMax,
      serviceArea: data.serviceArea,
      location: data.location,
      status: VendorStatus.PENDING,
    },
  });

  return {
    vendorId: vendor.id,
    status: vendor.status,
  };
}

/**
 * Upload vendor document
 * Links a document to a vendor record
 */
export async function uploadVendorDocument(
  userId: string,
  data: VendorDocumentData
): Promise<{ documentId: string; type: DocumentType }> {
  // Find vendor by user ID
  const vendor = await prisma.vendor.findUnique({
    where: { userId, deletedAt: null },
  });

  if (!vendor) {
    throw new VendorError(
      "Vendor application not found. Please submit an application first.",
      "VENDOR_NOT_FOUND",
      404
    );
  }

  // Check for duplicate document type
  const existingDocument = await prisma.vendorDocument.findFirst({
    where: {
      vendorId: vendor.id,
      type: data.type,
      deletedAt: null,
    },
  });

  if (existingDocument) {
    throw new VendorError(
      `Document of type ${data.type} already exists. Please delete the existing document first.`,
      "DUPLICATE_DOCUMENT",
      409
    );
  }

  // Create document record
  const document = await prisma.vendorDocument.create({
    data: {
      vendorId: vendor.id,
      type: data.type,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
    },
  });

  return {
    documentId: document.id,
    type: document.type,
  };
}

/**
 * Get pending vendor applications (Admin only)
 */
export async function getPendingApplications(): Promise<PendingVendorApplication[]> {
  const vendors = await prisma.vendor.findMany({
    where: {
      status: VendorStatus.PENDING,
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      documents: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          type: true,
          fileName: true,
          verified: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return vendors as PendingVendorApplication[];
}

/**
 * Approve vendor application (Admin only)
 */
export async function approveVendor(
  vendorId: string,
  data: VendorApprovalData
): Promise<{ vendorId: string; status: VendorStatus }> {
  // Check if vendor exists
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId, deletedAt: null },
  });

  if (!vendor) {
    throw new VendorError("Vendor not found", "VENDOR_NOT_FOUND", 404);
  }

  // Check if already approved or rejected
  if (vendor.status === VendorStatus.APPROVED) {
    throw new VendorError(
      "Vendor application already approved",
      "ALREADY_APPROVED",
      409
    );
  }

  if (vendor.status === VendorStatus.REJECTED) {
    throw new VendorError(
      "Cannot approve a rejected application. Vendor must submit a new application.",
      "ALREADY_REJECTED",
      409
    );
  }

  // Update vendor status
  const updatedVendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      status: VendorStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: data.approvedBy,
      rejectionReason: null, // Clear any previous rejection reason
    },
  });

  return {
    vendorId: updatedVendor.id,
    status: updatedVendor.status,
  };
}

/**
 * Reject vendor application (Admin only)
 */
export async function rejectVendor(
  vendorId: string,
  data: VendorRejectionData
): Promise<{ vendorId: string; status: VendorStatus }> {
  // Check if vendor exists
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId, deletedAt: null },
  });

  if (!vendor) {
    throw new VendorError("Vendor not found", "VENDOR_NOT_FOUND", 404);
  }

  // Check if already approved
  if (vendor.status === VendorStatus.APPROVED) {
    throw new VendorError(
      "Cannot reject an approved vendor. Use suspension instead.",
      "ALREADY_APPROVED",
      409
    );
  }

  // Update vendor status
  const updatedVendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      status: VendorStatus.REJECTED,
      rejectionReason: data.rejectionReason,
      approvedAt: null,
      approvedBy: null,
    },
  });

  return {
    vendorId: updatedVendor.id,
    status: updatedVendor.status,
  };
}

/**
 * Get vendor profile (for vendor owner)
 */
export async function getVendorProfile(userId: string): Promise<VendorProfile> {
  const vendor = await prisma.vendor.findUnique({
    where: { userId, deletedAt: null },
  });

  if (!vendor) {
    throw new VendorError(
      "Vendor profile not found. Please submit an application first.",
      "VENDOR_NOT_FOUND",
      404
    );
  }

  return vendor as VendorProfile;
}

/**
 * Update vendor profile (for vendor owner)
 */
export async function updateVendorProfile(
  userId: string,
  data: VendorProfileUpdateData
): Promise<VendorProfile> {
  // Find vendor
  const vendor = await prisma.vendor.findUnique({
    where: { userId, deletedAt: null },
  });

  if (!vendor) {
    throw new VendorError(
      "Vendor profile not found. Please submit an application first.",
      "VENDOR_NOT_FOUND",
      404
    );
  }

  // Don't allow updates to rejected vendors
  if (vendor.status === VendorStatus.REJECTED) {
    throw new VendorError(
      "Cannot update rejected vendor profile. Please submit a new application.",
      "VENDOR_REJECTED",
      403
    );
  }

  // Update vendor profile
  const updatedVendor = await prisma.vendor.update({
    where: { id: vendor.id },
    data,
  });

  return updatedVendor as VendorProfile;
}

/**
 * Get public vendor profile (for customers)
 */
export async function getPublicVendorProfile(vendorId: string): Promise<PublicVendorProfile> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId, deletedAt: null },
    select: {
      id: true,
      businessName: true,
      cuisineType: true,
      description: true,
      priceRange: true,
      capacityMin: true,
      capacityMax: true,
      serviceArea: true,
      status: true,
      approvedAt: true,
      createdAt: true,
    },
  });

  if (!vendor) {
    throw new VendorError("Vendor not found", "VENDOR_NOT_FOUND", 404);
  }

  // Only show approved vendors publicly
  if (vendor.status !== VendorStatus.APPROVED) {
    throw new VendorError("Vendor profile not available", "VENDOR_NOT_AVAILABLE", 404);
  }

  return vendor as PublicVendorProfile;
}

/**
 * Get vendor documents (for vendor owner or admin)
 */
export async function getVendorDocuments(vendorId: string) {
  const documents = await prisma.vendorDocument.findMany({
    where: {
      vendorId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return documents;
}
