/**
 * Quote Module TypeScript Types
 * Shared types for quote request and quote submission operations
 */

import { QuoteRequestStatus, QuoteStatus, EventType } from "@prisma/client";

/**
 * Pricing breakdown structure (stored as JSON)
 */
export interface QuotePricing {
  basePrice: number; // Base fee for the event
  perPersonPrice?: number; // Optional per-person pricing
  additionalFees?: Array<{
    name: string;
    amount: number;
  }>;
  total: number; // Total amount (calculated)
}

/**
 * Quote request creation data
 */
export interface CreateQuoteRequestData {
  eventDate: string; // YYYY-MM-DD format
  eventType: EventType;
  guestCount: number;
  location: string;
  requirements: string;
  budget?: number;
  vendorIds: string[]; // Vendors to request quotes from
  expiresAt?: string; // Optional custom expiry date
}

/**
 * Quote submission data (vendor submits)
 */
export interface SubmitQuoteData {
  pricing: QuotePricing;
  inclusions: string[];
  terms?: string;
  validUntil: string; // YYYY-MM-DD format
}

/**
 * Quote request details (full)
 */
export interface QuoteRequestDetails {
  id: string;
  customerId: string;
  eventDate: string;
  eventType: EventType;
  guestCount: number;
  location: string;
  requirements: string;
  budget: number | null;
  status: QuoteRequestStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Customer info
  customer?: {
    id: string;
    email: string;
  };

  // Quotes received
  quotes?: QuoteDetails[];
}

/**
 * Quote details (full)
 */
export interface QuoteDetails {
  id: string;
  requestId: string;
  vendorId: string;
  pricing: QuotePricing;
  inclusions: string[];
  terms: string | null;
  validUntil: Date;
  status: QuoteStatus;
  bookingId: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Vendor info
  vendor?: {
    id: string;
    businessName: string;
    cuisineType: string;
    email: string;
    avgRating?: number;
    totalReviews?: number;
  };

  // Request info (for vendor view)
  request?: {
    id: string;
    eventDate: string;
    eventType: EventType;
    guestCount: number;
    location: string;
    requirements: string;
    budget: number | null;
  };
}

/**
 * Quote request list item (summary)
 */
export interface QuoteRequestListItem {
  id: string;
  eventDate: string;
  eventType: EventType;
  guestCount: number;
  location: string;
  status: QuoteRequestStatus;
  quotesReceived: number; // Count of submitted quotes
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Quote list item (summary for vendor)
 */
export interface QuoteListItem {
  id: string;
  requestId: string;
  status: QuoteStatus;
  pricing: QuotePricing;
  validUntil: Date;
  createdAt: Date;

  // Request info
  request: {
    eventDate: string;
    eventType: EventType;
    guestCount: number;
    location: string;
    customerEmail: string;
  };
}

/**
 * Quote comparison item (for customer comparing quotes)
 */
export interface QuoteComparison {
  quoteId: string;
  vendorId: string;
  vendorBusinessName: string;
  vendorCuisineType: string;
  vendorAvgRating: number | null;
  vendorTotalReviews: number;
  pricing: QuotePricing;
  inclusions: string[];
  terms: string | null;
  validUntil: Date;
  status: QuoteStatus;
}

/**
 * Accept quote data
 */
export interface AcceptQuoteData {
  eventTime: string; // HH:MM format (required when accepting)
  specialRequests?: string;
}
