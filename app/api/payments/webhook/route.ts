/**
 * Stripe Webhook Handler
 * POST /api/payments/webhook - Handle Stripe webhook events
 *
 * No authentication required (signature verification instead)
 */

import { NextRequest, NextResponse } from "next/server";
import { stripeWebhooks } from "@/modules/payment/stripe.client";
import {
  handlePaymentAuthorized,
  handlePaymentFailed,
  updateVendorStripeStatus,
} from "@/modules/payment/payment.service";
import { StripeWebhookEvent } from "@/modules/payment/payment.types";
import Stripe from "stripe";

/**
 * Handle POST request - Stripe webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripeWebhooks.constructEvent(body, signature);
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    console.log(`[Webhook] Processing event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case StripeWebhookEvent.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentIntentSucceeded(event);
        break;

      case StripeWebhookEvent.PAYMENT_INTENT_PAYMENT_FAILED:
        await handlePaymentIntentFailed(event);
        break;

      case StripeWebhookEvent.PAYMENT_INTENT_CANCELED:
        await handlePaymentIntentCanceled(event);
        break;

      case StripeWebhookEvent.CHARGE_REFUNDED:
        await handleChargeRefunded(event);
        break;

      case StripeWebhookEvent.TRANSFER_CREATED:
        await handleTransferCreated(event);
        break;

      case StripeWebhookEvent.TRANSFER_FAILED:
        await handleTransferFailed(event);
        break;

      case StripeWebhookEvent.ACCOUNT_UPDATED:
        await handleAccountUpdated(event);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  try {
    await handlePaymentAuthorized(paymentIntent.id);
    console.log(`[Webhook] Payment authorized: ${paymentIntent.id}`);
  } catch (error) {
    console.error(`[Webhook] Failed to handle payment authorization:`, error);
    throw error;
  }
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  try {
    await handlePaymentFailed(paymentIntent.id);
    console.log(`[Webhook] Payment failed: ${paymentIntent.id}`);
  } catch (error) {
    console.error(`[Webhook] Failed to handle payment failure:`, error);
    // Don't throw - we still want to acknowledge the webhook
  }
}

/**
 * Handle payment_intent.canceled event
 */
async function handlePaymentIntentCanceled(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.log(`[Webhook] Payment canceled: ${paymentIntent.id}`);
  // Payment cancellation is handled through our cancellation flow
}

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;

  console.log(`[Webhook] Charge refunded: ${charge.id}`);
  // Refund is handled through our refund flow
}

/**
 * Handle transfer.created event
 */
async function handleTransferCreated(event: Stripe.Event) {
  const transfer = event.data.object as Stripe.Transfer;

  console.log(`[Webhook] Transfer created: ${transfer.id}`);
  // Log successful transfer for monitoring
}

/**
 * Handle transfer.failed event
 */
async function handleTransferFailed(event: Stripe.Event) {
  const transfer = event.data.object as Stripe.Transfer;

  console.error(`[Webhook] Transfer failed: ${transfer.id}`);
  // Log failed transfer for manual intervention
}

/**
 * Handle account.updated event
 */
async function handleAccountUpdated(event: Stripe.Event) {
  const account = event.data.object as Stripe.Account;

  try {
    await updateVendorStripeStatus(account.id);
    console.log(`[Webhook] Account updated: ${account.id}`);
  } catch (error) {
    console.error(`[Webhook] Failed to update vendor status:`, error);
    // Don't throw - vendor can still complete onboarding
  }
}
