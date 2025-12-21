/**
 * Helcim API Client - Usage Examples
 *
 * This file demonstrates how to use the Helcim API client for common
 * payment processing scenarios in Fleet Feast.
 *
 * DO NOT USE IN PRODUCTION - This is for reference only
 */

import { createHelcimClient, HelcimClient } from './helcim';
import type { PreauthResponse } from './helcim.types';

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Example 1: Create client with environment variables
 */
function example1_createClient() {
  // Automatically reads from process.env
  const helcim = createHelcimClient();

  // Or pass config explicitly
  const helcimExplicit = createHelcimClient({
    apiToken: 'your_api_token',
    accountId: 'your_account_id',
    terminalId: 'your_terminal_id',
    webhookSecret: 'your_webhook_secret',
    testMode: true,
  });

  return helcim;
}

// =============================================================================
// PAYMENT SCENARIOS
// =============================================================================

/**
 * Example 2: Process a one-step payment (instant charge)
 *
 * Use this for immediate payments that don't need pre-authorization.
 * For example: small purchases, instant bookings, tips.
 */
async function example2_processPayment(
  helcim: HelcimClient,
  cardToken: string,
  bookingId: string
) {
  try {
    const result = await helcim.processPayment({
      amount: 10000, // $100.00 in cents
      currency: 'USD',
      cardToken: cardToken, // From HelcimPay.js on frontend
      comments: `Booking #${bookingId}`,
      invoiceNumber: bookingId,
      customerCode: 'customer-123',
      ipAddress: '192.168.1.1', // Customer's IP for fraud prevention
    });

    console.log('Payment successful!');
    console.log('Transaction ID:', result.transactionId);
    console.log('Approval Code:', result.approvalCode);
    console.log('Card Last 4:', result.cardNumber?.slice(-4));

    return result;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}

/**
 * Example 3: Two-step payment flow (preauth → capture)
 *
 * RECOMMENDED for Fleet Feast bookings:
 * 1. Pre-authorize when booking is created (hold funds)
 * 2. Capture after service is completed
 * 3. Partial capture if service was partially used
 * 4. Let preauth expire if booking is cancelled
 */
async function example3_twoStepPayment(
  helcim: HelcimClient,
  cardToken: string,
  bookingId: string
) {
  try {
    // Step 1: Pre-authorize $100 when booking is created
    console.log('Step 1: Pre-authorizing funds...');
    const preauth = await helcim.preauthorize({
      amount: 10000, // $100.00
      currency: 'USD',
      cardToken: cardToken,
      comments: `Booking #${bookingId} - Hold until event`,
      invoiceNumber: bookingId,
      customerCode: 'customer-123',
    });

    console.log('Pre-auth successful!');
    console.log('Transaction ID:', preauth.transactionId);
    console.log('Funds are held for 7-30 days');

    // Store preauth.transactionId in your database with the booking

    // ... Time passes, event happens ...

    // Step 2: Capture the funds after service is completed
    console.log('Step 2: Capturing funds after event...');
    const capture = await helcim.capturePayment({
      preAuthTransactionId: preauth.transactionId,
      amount: 10000, // Full amount
      invoiceNumber: bookingId,
    });

    console.log('Capture successful!');
    console.log('Transaction ID:', capture.transactionId);
    console.log('Funds transferred to your account');

    return capture;
  } catch (error) {
    console.error('Payment flow failed:', error);
    throw error;
  }
}

/**
 * Example 4: Partial capture
 *
 * Use this if the service was only partially used.
 * For example: booking was for 4 hours but only used 3 hours.
 */
async function example4_partialCapture(
  helcim: HelcimClient,
  preauthTransactionId: number
) {
  try {
    // Original preauth was $100, but only charge $75
    const capture = await helcim.capturePayment({
      preAuthTransactionId: preauthTransactionId,
      amount: 7500, // $75.00 (75% of original)
      invoiceNumber: 'booking-123',
    });

    console.log('Partial capture successful!');
    console.log('Charged: $75.00 of $100.00 held');
    console.log('Remaining $25.00 will be released back to customer');

    return capture;
  } catch (error) {
    console.error('Partial capture failed:', error);
    throw error;
  }
}

/**
 * Example 5: Full refund
 *
 * Use this for cancellations or service issues.
 */
async function example5_fullRefund(
  helcim: HelcimClient,
  originalTransactionId: number
) {
  try {
    const refund = await helcim.refundPayment({
      originalTransactionId: originalTransactionId,
      amount: 10000, // Full $100.00 refund
    });

    console.log('Full refund successful!');
    console.log('Refund Transaction ID:', refund.transactionId);
    console.log('Customer will see refund in 3-5 business days');

    return refund;
  } catch (error) {
    console.error('Refund failed:', error);
    throw error;
  }
}

/**
 * Example 6: Partial refund
 *
 * Use this for partial cancellations or discounts.
 */
async function example6_partialRefund(
  helcim: HelcimClient,
  originalTransactionId: number
) {
  try {
    // Refund $30 of a $100 charge
    const refund = await helcim.refundPayment({
      originalTransactionId: originalTransactionId,
      amount: 3000, // $30.00 partial refund
    });

    console.log('Partial refund successful!');
    console.log('Refunded: $30.00');
    console.log('Net charge: $70.00');

    return refund;
  } catch (error) {
    console.error('Partial refund failed:', error);
    throw error;
  }
}

// =============================================================================
// TRANSACTION LOOKUP
// =============================================================================

/**
 * Example 7: Get transaction details
 *
 * Use this to check transaction status or retrieve details.
 */
async function example7_getTransaction(
  helcim: HelcimClient,
  transactionId: number
) {
  try {
    const transaction = await helcim.getTransaction(transactionId);

    console.log('Transaction Details:');
    console.log('Status:', transaction.status);
    console.log('Type:', transaction.type);
    console.log('Amount:', transaction.amount / 100);
    console.log('Date:', transaction.dateCreated);
    console.log('Approval Code:', transaction.approvalCode);

    return transaction;
  } catch (error) {
    console.error('Transaction lookup failed:', error);
    throw error;
  }
}

// =============================================================================
// WEBHOOK HANDLING
// =============================================================================

/**
 * Example 8: Verify webhook signature
 *
 * CRITICAL: Always verify webhook signatures to prevent fraud!
 *
 * In your Next.js API route (app/api/webhooks/helcim/route.ts):
 */
async function example8_webhookHandler() {
  // This would be in app/api/webhooks/helcim/route.ts
  /*
  import { createHelcimClient } from '@/lib/helcim';

  export async function POST(request: Request) {
    const helcim = createHelcimClient();

    // Get signature from headers
    const signature = request.headers.get('helcim-signature');

    // Get raw body
    const payload = await request.text();

    // Verify signature
    const result = helcim.verifyWebhook(payload, signature);

    if (!result.valid) {
      console.error('Invalid webhook signature:', result.error);
      return new Response('Unauthorized', { status: 401 });
    }

    // Process the event
    const event = result.event!;

    console.log('Webhook Event:', event.type);
    console.log('Transaction:', event.transactionId);
    console.log('Amount:', event.amount / 100);

    // Update your database based on the event
    switch (event.type) {
      case 'APPROVED':
        await updateBookingPaymentStatus(event.invoiceNumber, 'paid');
        break;

      case 'DECLINED':
        await updateBookingPaymentStatus(event.invoiceNumber, 'failed');
        break;

      case 'REFUNDED':
        await updateBookingPaymentStatus(event.invoiceNumber, 'refunded');
        break;
    }

    return new Response('OK', { status: 200 });
  }
  */
}

// =============================================================================
// CONNECTION TESTING
// =============================================================================

/**
 * Example 9: Test API connection
 *
 * Use this to verify your credentials are configured correctly.
 */
async function example9_testConnection(helcim: HelcimClient) {
  try {
    const isConnected = await helcim.testConnection();

    if (isConnected) {
      console.log('✓ Helcim API connection successful');
      console.log('✓ Credentials are valid');
    } else {
      console.error('✗ Helcim API connection failed');
      console.error('✗ Check your HELCIM_API_TOKEN in .env.local');
    }

    return isConnected;
  } catch (error) {
    console.error('Connection test error:', error);
    return false;
  }
}

// =============================================================================
// FLEET FEAST BOOKING FLOW
// =============================================================================

/**
 * Example 10: Complete Fleet Feast booking flow
 *
 * This demonstrates the full payment lifecycle for a food truck booking:
 * 1. Customer creates booking → Pre-authorize payment
 * 2. Event happens → Capture payment
 * 3. Customer cancels → Let preauth expire (no charge)
 * 4. Partial service → Partial capture
 * 5. Service issue → Refund
 */
async function example10_fleetFeastBookingFlow(
  helcim: HelcimClient,
  cardToken: string,
  bookingAmount: number,
  bookingId: string
) {
  try {
    // === Step 1: Customer Creates Booking ===
    console.log('\n=== Step 1: Customer Creates Booking ===');
    const preauth = await helcim.preauthorize({
      amount: bookingAmount,
      currency: 'USD',
      cardToken: cardToken,
      comments: `Food Truck Booking #${bookingId}`,
      invoiceNumber: bookingId,
      customerCode: 'customer-123',
    });

    console.log('✓ Funds held:', bookingAmount / 100);
    console.log('✓ Preauth ID:', preauth.transactionId);

    // Store in database:
    // await prisma.booking.update({
    //   where: { id: bookingId },
    //   data: {
    //     preauthTransactionId: preauth.transactionId,
    //     paymentStatus: 'authorized',
    //   },
    // });

    // === Step 2: Event Completes Successfully ===
    console.log('\n=== Step 2: Event Completes Successfully ===');
    const capture = await helcim.capturePayment({
      preAuthTransactionId: preauth.transactionId,
      amount: bookingAmount,
      invoiceNumber: bookingId,
    });

    console.log('✓ Payment captured:', bookingAmount / 100);
    console.log('✓ Capture ID:', capture.transactionId);

    // Update database:
    // await prisma.booking.update({
    //   where: { id: bookingId },
    //   data: {
    //     captureTransactionId: capture.transactionId,
    //     paymentStatus: 'paid',
    //   },
    // });

    // === Optional: Customer Requests Partial Refund ===
    console.log('\n=== Step 3 (Optional): Customer Requests Partial Refund ===');
    const refundAmount = Math.floor(bookingAmount * 0.2); // 20% refund
    const refund = await helcim.refundPayment({
      originalTransactionId: capture.transactionId,
      amount: refundAmount,
    });

    console.log('✓ Partial refund:', refundAmount / 100);
    console.log('✓ Refund ID:', refund.transactionId);
    console.log('✓ Net amount:', (bookingAmount - refundAmount) / 100);

    // Update database:
    // await prisma.booking.update({
    //   where: { id: bookingId },
    //   data: {
    //     refundTransactionId: refund.transactionId,
    //     paymentStatus: 'partially_refunded',
    //     refundedAmount: refundAmount,
    //   },
    // });

    return {
      preauth,
      capture,
      refund,
    };
  } catch (error) {
    console.error('Booking flow failed:', error);
    throw error;
  }
}

// =============================================================================
// EXPORT EXAMPLES
// =============================================================================

export const examples = {
  example1_createClient,
  example2_processPayment,
  example3_twoStepPayment,
  example4_partialCapture,
  example5_fullRefund,
  example6_partialRefund,
  example7_getTransaction,
  example8_webhookHandler,
  example9_testConnection,
  example10_fleetFeastBookingFlow,
};
