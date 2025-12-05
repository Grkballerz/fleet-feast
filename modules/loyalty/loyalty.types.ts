/**
 * Loyalty Module TypeScript Types
 * Shared types for loyalty discount operations
 */

/**
 * Loyalty status for a customer-vendor pair
 */
export interface LoyaltyStatus {
  isEligible: boolean; // Is customer eligible for loyalty discount?
  previousBookings: number; // Count of completed bookings
  discountPercent: number; // Discount percentage (0 or 5)
}

/**
 * Pricing calculation result with loyalty applied
 */
export interface LoyaltyPricing {
  baseAmount: number; // Original booking amount
  discountAmount: number; // Amount discounted (5% of base)
  discountPercent: number; // Discount percentage applied
  totalAmount: number; // Final amount customer pays (base - discount)
  platformFee: number; // Commission platform takes (10% or 15% of total)
  vendorPayout: number; // Amount vendor receives (total - platformFee)
  loyaltyApplied: boolean; // Whether loyalty discount was applied
  commissionRate: number; // Commission rate used (0.10 or 0.15)
}
