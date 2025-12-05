/**
 * Dispute System Type Definitions
 * Defines types for dispute creation, resolution, and management
 */

import { DisputeStatus } from "@prisma/client";

/**
 * Dispute type categories
 */
export enum DisputeType {
  NO_SHOW = "NO_SHOW",
  LATE_ARRIVAL = "LATE_ARRIVAL",
  SERVICE_QUALITY = "SERVICE_QUALITY",
  WRONG_ORDER = "WRONG_ORDER",
  FOOD_QUALITY = "FOOD_QUALITY",
  OTHER = "OTHER",
}

/**
 * Resolution outcomes
 */
export enum ResolutionOutcome {
  FULL_REFUND = "FULL_REFUND",
  PARTIAL_REFUND = "PARTIAL_REFUND",
  NO_REFUND = "NO_REFUND",
  CANCELLED = "CANCELLED",
}

/**
 * Input data for creating a dispute
 */
export interface CreateDisputeData {
  bookingId: string;
  userId: string;
  type: DisputeType;
  description: string;
  evidence?: string[]; // URLs to uploaded evidence files
  metadata?: Record<string, any>; // e.g., { lateMinutes: 45 }
}

/**
 * Input data for resolving a dispute (admin)
 */
export interface ResolveDisputeData {
  outcome: ResolutionOutcome;
  refundPercent?: number; // For PARTIAL_REFUND (0-100)
  notes: string;
  adminId: string;
}

/**
 * Input data for updating dispute status
 */
export interface UpdateDisputeData {
  status?: DisputeStatus;
  notes?: string;
}

/**
 * Auto-resolution suggestion
 */
export interface ResolutionSuggestion {
  outcome: ResolutionOutcome | null;
  refundPercent: number | null;
  requiresManualReview: boolean;
  reason: string;
  autoApplicable: boolean;
}

/**
 * Dispute details response
 */
export interface DisputeDetails {
  id: string;
  bookingId: string;
  initiatorId: string;
  type: DisputeType;
  description: string;
  evidence: string[] | null;
  metadata: Record<string, any> | null;
  status: DisputeStatus;
  outcome: ResolutionOutcome | null;
  refundPercent: number | null;
  resolutionNotes: string | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  booking?: {
    id: string;
    eventDate: string;
    eventType: string;
    totalAmount: number;
    status: string;
    customerEmail?: string;
    vendorBusinessName?: string;
  };
}

/**
 * Dispute list item
 */
export interface DisputeListItem {
  id: string;
  bookingId: string;
  type: DisputeType;
  status: DisputeStatus;
  createdAt: Date;
  eventDate: string;
  totalAmount: number;
}

/**
 * Error class for dispute operations
 */
export class DisputeError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "DisputeError";
  }
}

/**
 * Dispute statistics
 */
export interface DisputeStatistics {
  totalDisputes: number;
  openDisputes: number;
  resolvedDisputes: number;
  byType: Record<DisputeType, number>;
  byOutcome: Record<ResolutionOutcome, number>;
  avgResolutionTimeHours: number;
}
