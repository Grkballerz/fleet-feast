/**
 * Stripe Client Wrapper
 * Stripe SDK wrapper for payment operations and Connect marketplace
 */

import Stripe from "stripe";

// Validate required environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not configured in environment variables");
}

if (!stripeWebhookSecret) {
  console.warn("STRIPE_WEBHOOK_SECRET is not configured - webhook verification will fail");
}

/**
 * Initialize Stripe client
 */
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
  appInfo: {
    name: "Fleet Feast",
    version: "1.0.0",
  },
});

/**
 * Stripe Connect account operations
 */
export const stripeConnect = {
  /**
   * Create a connected account for a vendor
   */
  async createAccount(params: {
    email: string;
    businessName: string;
    country?: string;
  }): Promise<Stripe.Account> {
    const account = await stripe.accounts.create({
      type: "express",
      country: params.country || "US",
      email: params.email,
      business_type: "company",
      company: {
        name: params.businessName,
      },
      capabilities: {
        transfers: { requested: true },
      },
      settings: {
        payouts: {
          schedule: {
            interval: "manual", // We control payout timing (escrow)
          },
        },
      },
    });

    return account;
  },

  /**
   * Create an account link for onboarding
   */
  async createAccountLink(params: {
    accountId: string;
    refreshUrl: string;
    returnUrl: string;
  }): Promise<Stripe.AccountLink> {
    const accountLink = await stripe.accountLinks.create({
      account: params.accountId,
      refresh_url: params.refreshUrl,
      return_url: params.returnUrl,
      type: "account_onboarding",
    });

    return accountLink;
  },

  /**
   * Retrieve account details
   */
  async retrieveAccount(accountId: string): Promise<Stripe.Account> {
    return await stripe.accounts.retrieve(accountId);
  },

  /**
   * Check if account is fully onboarded
   */
  async isAccountOnboarded(accountId: string): Promise<boolean> {
    const account = await stripe.accounts.retrieve(accountId);
    return (
      account.charges_enabled === true &&
      account.payouts_enabled === true &&
      account.details_submitted === true
    );
  },
};

/**
 * Payment intent operations
 */
export const stripePayments = {
  /**
   * Create a payment intent with escrow (manual capture)
   */
  async createPaymentIntent(params: {
    amount: number;
    currency?: string;
    description?: string;
    metadata?: Stripe.MetadataParam;
    connectedAccountId?: string;
    applicationFeeAmount?: number;
    customerId?: string;
  }): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: params.currency || "usd",
      description: params.description,
      metadata: params.metadata,
      capture_method: "manual", // Escrow: authorize now, capture later
      ...(params.connectedAccountId && {
        application_fee_amount: params.applicationFeeAmount
          ? Math.round(params.applicationFeeAmount * 100)
          : undefined,
        transfer_data: {
          destination: params.connectedAccountId,
        },
      }),
      ...(params.customerId && {
        customer: params.customerId,
      }),
    });

    return paymentIntent;
  },

  /**
   * Capture a payment intent (release from escrow)
   */
  async capturePaymentIntent(
    paymentIntentId: string,
    amountToCapture?: number
  ): Promise<Stripe.PaymentIntent> {
    const captureParams: Stripe.PaymentIntentCaptureParams = {};

    if (amountToCapture !== undefined) {
      captureParams.amount_to_capture = Math.round(amountToCapture * 100);
    }

    return await stripe.paymentIntents.capture(paymentIntentId, captureParams);
  },

  /**
   * Cancel a payment intent (before capture)
   */
  async cancelPaymentIntent(
    paymentIntentId: string,
    cancellationReason?: Stripe.PaymentIntentCancelParams.CancellationReason
  ): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.cancel(paymentIntentId, {
      cancellation_reason: cancellationReason,
    });
  },

  /**
   * Retrieve payment intent details
   */
  async retrievePaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  },

  /**
   * Create a refund
   */
  async createRefund(params: {
    paymentIntentId: string;
    amount?: number;
    reason?: Stripe.RefundCreateParams.Reason;
    metadata?: Stripe.MetadataParam;
  }): Promise<Stripe.Refund> {
    return await stripe.refunds.create({
      payment_intent: params.paymentIntentId,
      amount: params.amount ? Math.round(params.amount * 100) : undefined,
      reason: params.reason,
      metadata: params.metadata,
    });
  },
};

/**
 * Transfer operations (for vendor payouts)
 */
export const stripeTransfers = {
  /**
   * Create a transfer to a connected account
   */
  async createTransfer(params: {
    amount: number;
    currency?: string;
    destination: string;
    description?: string;
    metadata?: Stripe.MetadataParam;
  }): Promise<Stripe.Transfer> {
    return await stripe.transfers.create({
      amount: Math.round(params.amount * 100),
      currency: params.currency || "usd",
      destination: params.destination,
      description: params.description,
      metadata: params.metadata,
    });
  },

  /**
   * Retrieve transfer details
   */
  async retrieveTransfer(transferId: string): Promise<Stripe.Transfer> {
    return await stripe.transfers.retrieve(transferId);
  },
};

/**
 * Webhook operations
 */
export const stripeWebhooks = {
  /**
   * Construct and verify webhook event
   */
  constructEvent(
    payload: string | Buffer,
    signature: string,
    secret?: string
  ): Stripe.Event {
    const webhookSecret = secret || stripeWebhookSecret;

    if (!webhookSecret) {
      throw new Error("Webhook secret is not configured");
    }

    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  },
};

/**
 * Utility functions
 */
export const stripeUtils = {
  /**
   * Convert cents to dollars
   */
  centsToDollars(cents: number): number {
    return cents / 100;
  },

  /**
   * Convert dollars to cents
   */
  dollarsToCents(dollars: number): number {
    return Math.round(dollars * 100);
  },

  /**
   * Format amount for display
   */
  formatAmount(cents: number, currency: string = "usd"): string {
    const dollars = cents / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(dollars);
  },
};

export default stripe;
