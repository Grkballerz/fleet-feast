/**
 * Loyalty Service Layer
 * Handles loyalty discount eligibility and pricing calculations
 *
 * Business Rules:
 * - 5% discount on 2nd+ booking with same vendor
 * - Platform absorbs cost by reducing commission (15% → 10%)
 * - Vendor payout remains unchanged
 */

import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import type { LoyaltyStatus, LoyaltyPricing } from "./loyalty.types";

/**
 * Constants
 */
export const LOYALTY_DISCOUNT_PERCENT = 0.05; // 5% discount
export const STANDARD_COMMISSION = 0.15; // 15% platform fee
export const LOYALTY_COMMISSION = 0.10; // 10% platform fee for loyalty bookings

/**
 * Check if a customer is eligible for loyalty discount with a vendor
 *
 * Eligibility: Customer has at least 1 COMPLETED booking with this vendor
 *
 * @param customerId - Customer's user ID
 * @param vendorId - Vendor's user ID
 * @returns Loyalty status including eligibility and previous booking count
 */
export async function checkLoyaltyEligibility(
  customerId: string,
  vendorId: string
): Promise<LoyaltyStatus> {
  // Count completed bookings between this customer-vendor pair
  const previousBookings = await prisma.booking.count({
    where: {
      customerId,
      vendorId,
      status: BookingStatus.COMPLETED,
    },
  });

  // Eligible if they have at least 1 completed booking
  const isEligible = previousBookings >= 1;

  return {
    isEligible,
    previousBookings,
    discountPercent: isEligible ? LOYALTY_DISCOUNT_PERCENT * 100 : 0,
  };
}

/**
 * Calculate booking price with loyalty discount applied
 *
 * Math breakdown (example with $1000 base):
 *
 * WITHOUT LOYALTY:
 * - Base: $1000
 * - Discount: $0
 * - Total: $1000
 * - Commission (15%): $150
 * - Vendor Payout: $850
 *
 * WITH LOYALTY:
 * - Base: $1000
 * - Discount (5%): $50
 * - Total: $950 (customer pays less)
 * - Commission (10%): $95 (platform earns less)
 * - Vendor Payout: $855 (vendor gets more despite customer paying less)
 *
 * Platform absorbs the discount cost by reducing commission.
 *
 * @param baseAmount - Original booking amount before discount
 * @param loyaltyStatus - Loyalty eligibility status
 * @returns Complete pricing breakdown
 */
export function calculateLoyaltyPricing(
  baseAmount: number,
  loyaltyStatus: LoyaltyStatus
): LoyaltyPricing {
  // Calculate discount amount
  const discountAmount = loyaltyStatus.isEligible
    ? baseAmount * LOYALTY_DISCOUNT_PERCENT
    : 0;

  // Calculate total amount customer pays (after discount)
  const totalAmount = baseAmount - discountAmount;

  // Determine commission rate (lower for loyalty bookings)
  const commissionRate = loyaltyStatus.isEligible
    ? LOYALTY_COMMISSION
    : STANDARD_COMMISSION;

  // Calculate platform fee and vendor payout
  const platformFee = totalAmount * commissionRate;
  const vendorPayout = totalAmount - platformFee;

  return {
    baseAmount,
    discountAmount,
    discountPercent: loyaltyStatus.isEligible ? LOYALTY_DISCOUNT_PERCENT * 100 : 0,
    totalAmount,
    platformFee,
    vendorPayout,
    loyaltyApplied: loyaltyStatus.isEligible,
    commissionRate,
  };
}

/**
 * Get loyalty discount summary for display
 *
 * @param customerId - Customer's user ID
 * @param vendorId - Vendor's user ID
 * @returns Human-readable summary
 */
export async function getLoyaltyDiscountSummary(
  customerId: string,
  vendorId: string
): Promise<{
  eligible: boolean;
  message: string;
  previousBookings: number;
}> {
  const loyaltyStatus = await checkLoyaltyEligibility(customerId, vendorId);

  let message = "";
  if (loyaltyStatus.isEligible) {
    message = `You qualify for a 5% loyalty discount! You've completed ${loyaltyStatus.previousBookings} booking(s) with this vendor.`;
  } else {
    message = "Complete your first booking to unlock a 5% loyalty discount on future bookings with this vendor!";
  }

  return {
    eligible: loyaltyStatus.isEligible,
    message,
    previousBookings: loyaltyStatus.previousBookings,
  };
}
