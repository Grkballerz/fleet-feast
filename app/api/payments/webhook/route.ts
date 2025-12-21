/**
 * Payment Webhook Handler
 * POST /api/payments/webhook - Handle payment webhook events
 *
 * NOTE: Stripe webhook handling removed. This route will be repurposed for Helcim webhooks.
 * Helcim webhook integration will be implemented in a future task.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Handle POST request - Payment webhook placeholder
 */
export async function POST(req: NextRequest) {
  // TODO: Implement Helcim webhook handling
  console.log("[Webhook] Payment webhook endpoint - awaiting Helcim integration");

  return NextResponse.json(
    { error: "Payment webhook not yet implemented" },
    { status: 501 } // Not Implemented
  );
}
