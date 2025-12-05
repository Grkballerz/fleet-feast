/**
 * Vendor Module TypeScript Types
 * Shared types for vendor-related operations
 */

import { CuisineType, PriceRange, VendorStatus, DocumentType } from "@prisma/client";

/**
 * Vendor application data
 */
export interface VendorApplicationData {
  businessName: string;
  cuisineType: CuisineType;
  description?: string;
  priceRange: PriceRange;
  capacityMin: number;
  capacityMax: number;
  serviceArea?: string;
  location?: string; // "lat,lng" format
}

/**
 * Vendor profile update data
 */
export interface VendorProfileUpdateData {
  businessName?: string;
  cuisineType?: CuisineType;
  description?: string;
  priceRange?: PriceRange;
  capacityMin?: number;
  capacityMax?: number;
  serviceArea?: string;
  location?: string;
}

/**
 * Document upload data
 */
export interface VendorDocumentData {
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
}

/**
 * Admin approval/rejection data
 */
export interface VendorApprovalData {
  approvedBy: string; // Admin user ID
}

export interface VendorRejectionData {
  rejectedBy: string; // Admin user ID
  rejectionReason: string;
}

/**
 * Public vendor profile (excludes sensitive data)
 */
export interface PublicVendorProfile {
  id: string;
  businessName: string;
  cuisineType: CuisineType;
  description: string | null;
  priceRange: PriceRange;
  capacityMin: number;
  capacityMax: number;
  serviceArea: string | null;
  status: VendorStatus;
  approvedAt: Date | null;
  createdAt: Date;
}

/**
 * Full vendor profile (for vendor owner)
 */
export interface VendorProfile extends PublicVendorProfile {
  userId: string;
  location: string | null;
  stripeAccountId: string | null;
  stripeConnected: boolean;
  rejectionReason: string | null;
  updatedAt: Date;
}

/**
 * Pending vendor application (for admin)
 */
export interface PendingVendorApplication {
  id: string;
  userId: string;
  businessName: string;
  cuisineType: CuisineType;
  description: string | null;
  priceRange: PriceRange;
  capacityMin: number;
  capacityMax: number;
  serviceArea: string | null;
  status: VendorStatus;
  createdAt: Date;
  user: {
    email: string;
  };
  documents: {
    id: string;
    type: DocumentType;
    fileName: string;
    verified: boolean;
  }[];
}
