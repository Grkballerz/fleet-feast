/**
 * Booking Module TypeScript Types
 * Shared types for booking-related operations
 */

import { BookingStatus, EventType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Booking request data (customer creates booking)
 */
export interface BookingRequestData {
  vendorId: string;
  eventDate: string; // YYYY-MM-DD format
  eventTime: string; // HH:MM format
  eventType: EventType;
  location: string;
  guestCount: number;
  specialRequests?: string;
  totalAmount: number; // Calculated by frontend or recalculated by backend
}

/**
 * Inquiry request data (customer requests proposal)
 */
export interface InquiryRequestData {
  vendorId: string;
  eventDate: string; // YYYY-MM-DD format
  eventTime: string; // HH:MM format
  eventType: EventType;
  location: string;
  guestCount: number;
  specialRequests?: string;
}

/**
 * Line item in a proposal
 */
export interface LineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Proposal details stored as JSON
 */
export interface ProposalDetails {
  lineItems: LineItem[];
  inclusions: string[];
  terms?: string;
}

/**
 * Proposal data (vendor sends proposal)
 */
export interface ProposalData {
  proposalAmount: number;
  proposalDetails: ProposalDetails;
  expiresInDays?: number; // default: 7
}

/**
 * Proposal acceptance data (customer accepts)
 */
export interface ProposalAcceptData {
  acceptTerms: boolean;
}

/**
 * Booking update data (limited fields)
 */
export interface BookingUpdateData {
  eventDate?: string;
  eventTime?: string;
  location?: string;
  guestCount?: number;
  specialRequests?: string;
}

/**
 * Vendor response data
 */
export interface VendorResponseData {
  reason?: string; // For decline only
}

/**
 * Cancellation data
 */
export interface CancellationData {
  reason?: string;
}

/**
 * Full booking details
 */
export interface BookingDetails {
  id: string;
  customerId: string;
  vendorId: string;

  // Event details
  eventDate: string;
  eventTime: string;
  eventType: EventType;
  location: string;
  guestCount: number;
  specialRequests: string | null;

  // Financial
  totalAmount: number;
  platformFee: number;
  vendorPayout: number;
  discountAmount?: number;
  loyaltyApplied?: boolean;

  // Proposal fields
  proposalAmount: number | null;
  proposalDetails: ProposalDetails | null;
  proposalSentAt: Date | null;
  proposalExpiresAt: Date | null;
  platformFeeCustomer: number | null;
  platformFeeVendor: number | null;

  // Status
  status: BookingStatus;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  acceptedAt: Date | null;
  respondedAt: Date | null;
  cancelledAt: Date | null;

  // Cancellation
  cancelledBy: string | null;
  cancellationReason: string | null;
  refundAmount: number | null;

  // Vendor info (for customer)
  vendor?: {
    id: string;
    businessName: string;
    cuisineType: string;
  };

  // Customer info (for vendor)
  customer?: {
    id: string;
    email: string;
  };
}

/**
 * Booking list item (summary)
 */
export interface BookingListItem {
  id: string;
  eventDate: string;
  eventTime: string;
  eventType: EventType;
  location: string;
  guestCount: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: Date;

  // Proposal fields
  proposalAmount?: number;
  proposalExpiresAt?: Date;

  // Other party info
  vendorBusinessName?: string; // For customer
  customerEmail?: string; // For vendor
}

/**
 * Refund calculation result
 */
export interface RefundCalculation {
  refundAmount: number;
  refundPercentage: number;
  daysBeforeEvent: number;
}
