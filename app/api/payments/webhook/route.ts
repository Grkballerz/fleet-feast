/**
 * Helcim Payment Webhook Handler
 * POST /api/payments/webhook - Handle Helcim payment webhook events
 *
 * This endpoint receives webhook notifications from Helcim when payment events occur.
 * It verifies the webhook signature, processes the event, and updates payment records.
 *
 * SECURITY:
 * - All webhooks MUST have valid HMAC signatures (verified via lib/helcim.ts)
 * - Idempotency is enforced using transactionId
 * - Returns 200 OK for all processed events (prevents unnecessary retries)
 *
 * EVENTS HANDLED:
 * - APPROVED: Payment authorized successfully
 * - DECLINED: Payment authorization failed
 * - REFUNDED: Payment refunded to customer
 * - (VOIDED is handled as a refund for now)
 *
 * Official Docs: https://devdocs.helcim.com/webhooks/
 */

import { NextRequest, NextResponse } from "next/server";
import { createHelcimClient } from "@/lib/helcim";
import { prisma } from "@/lib/prisma";
import type { HelcimWebhookEvent } from "@/lib/helcim.types";

// =============================================================================
// WEBHOOK EVENT PROCESSOR
// =============================================================================

/**
 * Process APPROVED event - Payment successfully authorized
 */
async function handleApproved(event: HelcimWebhookEvent) {
  console.log(`[Webhook] Processing APPROVED event for transaction ${event.transactionId}`);

  // Find payment by Helcim transaction ID
  const payment = await prisma.payment.findUnique({
    where: { externalPaymentId: event.transactionId.toString() },
    include: { booking: true },
  });

  if (!payment) {
    console.warn(`[Webhook] Payment not found for transaction ${event.transactionId}`);
    // This could be a test webhook or a payment not yet created in our system
    // Return 200 to prevent retries
    return { processed: true, warning: "Payment not found" };
  }

  // Check if already processed (idempotency)
  if (payment.status === "AUTHORIZED") {
    console.log(`[Webhook] Payment ${payment.id} already authorized - skipping`);
    return { processed: true, idempotent: true };
  }

  // Update payment status to AUTHORIZED
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "AUTHORIZED",
      authorizedAt: new Date(event.dateCreated),
    },
  });

  console.log(`[Webhook] Payment ${payment.id} authorized successfully`);

  return {
    processed: true,
    paymentId: payment.id,
    bookingId: payment.bookingId,
    amount: event.amount,
  };
}

/**
 * Process DECLINED event - Payment authorization failed
 */
async function handleDeclined(event: HelcimWebhookEvent) {
  console.log(`[Webhook] Processing DECLINED event for transaction ${event.transactionId}`);

  // Find payment by Helcim transaction ID
  const payment = await prisma.payment.findUnique({
    where: { externalPaymentId: event.transactionId.toString() },
    include: { booking: true },
  });

  if (!payment) {
    console.warn(`[Webhook] Payment not found for transaction ${event.transactionId}`);
    return { processed: true, warning: "Payment not found" };
  }

  // Check if already processed (idempotency)
  if (payment.status === "FAILED") {
    console.log(`[Webhook] Payment ${payment.id} already marked as failed - skipping`);
    return { processed: true, idempotent: true };
  }

  // Update payment status to FAILED
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "FAILED",
    },
  });

  console.log(`[Webhook] Payment ${payment.id} marked as failed`);

  return {
    processed: true,
    paymentId: payment.id,
    bookingId: payment.bookingId,
  };
}

/**
 * Process REFUNDED event - Payment refunded to customer
 */
async function handleRefunded(event: HelcimWebhookEvent) {
  console.log(`[Webhook] Processing REFUNDED event for transaction ${event.transactionId}`);

  // For refunds, we need to find the original payment
  // Helcim webhook should include the original transaction ID in comments or invoiceNumber
  // For now, we'll search by transaction ID (which might be the refund transaction)

  // Try to find by exact transaction ID first
  let payment = await prisma.payment.findUnique({
    where: { externalPaymentId: event.transactionId.toString() },
    include: { booking: true },
  });

  // If not found, this might be a refund transaction ID
  // We'd need to query Helcim API to get the original transaction
  if (!payment) {
    console.warn(
      `[Webhook] Payment not found for refund transaction ${event.transactionId}`
    );
    // In production, we should query Helcim API to get original transaction
    // For now, log and return success to prevent retries
    return { processed: true, warning: "Original payment not found for refund" };
  }

  // Check if already refunded (idempotency)
  if (payment.status === "REFUNDED") {
    console.log(`[Webhook] Payment ${payment.id} already refunded - skipping`);
    return { processed: true, idempotent: true };
  }

  // Update payment status to REFUNDED
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "REFUNDED",
      refundedAt: new Date(event.dateCreated),
    },
  });

  console.log(`[Webhook] Payment ${payment.id} refunded successfully`);

  return {
    processed: true,
    paymentId: payment.id,
    bookingId: payment.bookingId,
    amount: event.amount,
  };
}

// =============================================================================
// WEBHOOK ROUTE HANDLER
// =============================================================================

/**
 * POST /api/payments/webhook
 *
 * Handle incoming Helcim webhook events
 *
 * @param request - NextRequest with webhook payload and signature header
 * @returns NextResponse with processing status
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Extract raw body and signature
    const body = await request.text();
    const signature = request.headers.get("helcim-signature");

    console.log("[Webhook] Received webhook event");
    console.log("[Webhook] Signature present:", !!signature);
    console.log("[Webhook] Body length:", body.length);

    // Step 2: Verify webhook signature
    const helcim = createHelcimClient();
    const verification = helcim.verifyWebhook(body, signature);

    if (!verification.valid) {
      console.error("[Webhook] Signature verification failed:", verification.error);
      return NextResponse.json(
        {
          error: "Invalid webhook signature",
          details: verification.error,
        },
        { status: 401 }
      );
    }

    // Step 3: Extract verified event
    const event = verification.event!;

    console.log("[Webhook] Event verified:", {
      type: event.type,
      transactionId: event.transactionId,
      transactionType: event.transactionType,
      amount: event.amount,
      currency: event.currency,
    });

    // Step 4: Process event based on type
    let result;

    switch (event.type) {
      case "APPROVED":
        result = await handleApproved(event);
        break;

      case "DECLINED":
        result = await handleDeclined(event);
        break;

      case "REFUNDED":
        result = await handleRefunded(event);
        break;

      default:
        console.warn(`[Webhook] Unknown event type: ${event.type}`);
        // Return 200 to prevent retries for unknown events
        return NextResponse.json({
          received: true,
          warning: `Unknown event type: ${event.type}`,
        });
    }

    // Step 5: Return success response
    console.log("[Webhook] Event processed successfully:", result);

    return NextResponse.json({
      received: true,
      ...result,
    });
  } catch (error) {
    // Log error but return 200 to prevent retries
    // (we don't want Helcim to keep retrying if there's a bug in our code)
    console.error("[Webhook] Error processing webhook:", error);

    // In production, you might want to:
    // 1. Send alert to monitoring system (Sentry, DataDog, etc.)
    // 2. Store failed webhook in a dead letter queue for manual review
    // 3. Return 200 to prevent Helcim retries while you investigate

    return NextResponse.json(
      {
        received: true,
        processed: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 } // Return 200 to prevent retries
    );
  }
}

/**
 * GET /api/payments/webhook
 *
 * Return information about webhook endpoint (for debugging)
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/payments/webhook",
    method: "POST",
    description: "Helcim payment webhook handler",
    events: ["APPROVED", "DECLINED", "REFUNDED"],
    documentation: "https://devdocs.helcim.com/webhooks/",
  });
}
