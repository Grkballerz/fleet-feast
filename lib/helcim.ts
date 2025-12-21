/**
 * Helcim API Client for Fleet Feast
 *
 * Official Documentation: https://devdocs.helcim.com/
 *
 * This client provides typed functions for Helcim payment processing.
 * Helcim does not provide an official npm SDK, so we use the REST API directly.
 *
 * SECURITY NOTES:
 * - Never send raw card numbers to the server
 * - Use HelcimPay.js on the frontend for card tokenization
 * - Always validate webhook signatures to prevent fraud
 * - Log transactions but mask sensitive data (card numbers, tokens)
 *
 * @example
 * ```typescript
 * // Initialize client
 * const helcim = new HelcimClient({
 *   apiToken: process.env.HELCIM_API_TOKEN!,
 *   accountId: process.env.HELCIM_ACCOUNT_ID!,
 *   terminalId: process.env.HELCIM_TERMINAL_ID!,
 *   webhookSecret: process.env.HELCIM_WEBHOOK_SECRET,
 * });
 *
 * // Process a payment
 * const result = await helcim.processPayment({
 *   amount: 10000, // $100.00 in cents
 *   currency: 'USD',
 *   cardToken: 'token_from_frontend',
 *   comments: 'Booking #12345',
 * });
 * ```
 */

import * as crypto from 'crypto';
import type {
  HelcimConfig,
  PurchaseRequest,
  PurchaseResponse,
  PreauthRequest,
  PreauthResponse,
  CaptureRequest,
  CaptureResponse,
  RefundRequest,
  RefundResponse,
  TransactionDetails,
  HelcimApiError,
  WebhookVerificationResult,
  HelcimWebhookEvent,
} from './helcim.types';
import { HelcimError } from './helcim.types';

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_BASE_URL = 'https://api.helcim.com/v2';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Mask sensitive data for logging
 */
function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const masked = { ...data };

  // Mask card tokens
  if (masked.cardToken) {
    masked.cardToken = `${masked.cardToken.substring(0, 8)}...${masked.cardToken.substring(masked.cardToken.length - 4)}`;
  }

  // Mask card numbers (should already be masked by Helcim, but double-check)
  if (masked.cardNumber) {
    masked.cardNumber = masked.cardNumber.replace(/\d(?=\d{4})/g, '*');
  }

  return masked;
}

/**
 * Format amount for logging (cents to dollars)
 */
function formatAmount(amountInCents: number, currency: string): string {
  const dollars = (amountInCents / 100).toFixed(2);
  return `${currency} ${dollars}`;
}

// =============================================================================
// HELCIM CLIENT CLASS
// =============================================================================

export class HelcimClient {
  private config: HelcimConfig;
  private baseUrl: string;

  constructor(config: HelcimConfig) {
    // Validate required configuration
    if (!config.apiToken) {
      throw new Error('Helcim API token is required');
    }
    if (!config.accountId) {
      throw new Error('Helcim account ID is required');
    }
    if (!config.terminalId) {
      throw new Error('Helcim terminal ID is required');
    }

    this.config = config;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  }

  // ===========================================================================
  // PRIVATE HELPER METHODS
  // ===========================================================================

  /**
   * Make an authenticated request to Helcim API
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'api-token': this.config.apiToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      console.log(`[Helcim] ${method} ${endpoint}`, maskSensitiveData(body));

      const response = await fetch(url, options);

      // Parse response
      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle errors
      if (!response.ok) {
        const errorData = data as HelcimApiError;
        const errorMessage = errorData.message || errorData.error || 'Helcim API request failed';

        console.error(`[Helcim] Error ${response.status}:`, errorData);

        throw new HelcimError(
          errorMessage,
          response.status,
          errorData.errors
        );
      }

      console.log(`[Helcim] Success:`, maskSensitiveData(data));

      return data as T;
    } catch (error) {
      if (error instanceof HelcimError) {
        throw error;
      }

      // Network or timeout errors
      console.error('[Helcim] Request failed:', error);
      throw new HelcimError(
        error instanceof Error ? error.message : 'Network request failed',
        undefined,
        undefined
      );
    }
  }

  /**
   * Add default account/terminal IDs to request
   */
  private addDefaults<T extends { accountId?: string; terminalId?: string; test?: boolean }>(
    request: T
  ): T {
    return {
      ...request,
      accountId: request.accountId || this.config.accountId,
      terminalId: request.terminalId || this.config.terminalId,
      test: this.config.testMode || request.test || undefined,
    };
  }

  // ===========================================================================
  // PUBLIC API METHODS
  // ===========================================================================

  /**
   * Process a one-step payment (purchase)
   *
   * @example
   * ```typescript
   * const result = await helcim.processPayment({
   *   amount: 10000, // $100.00
   *   currency: 'USD',
   *   cardToken: 'token_from_helcimpay_js',
   *   comments: 'Booking #12345',
   * });
   * ```
   */
  async processPayment(request: PurchaseRequest): Promise<PurchaseResponse> {
    const requestData = this.addDefaults(request);

    console.log(
      `[Helcim] Processing payment: ${formatAmount(request.amount, request.currency)}`
    );

    return this.request<PurchaseResponse>('/payment/purchase', 'POST', requestData);
  }

  /**
   * Pre-authorize a payment (hold funds without capturing)
   *
   * Use this for bookings where you want to hold funds but capture later.
   * The hold typically lasts 7-30 days depending on the card issuer.
   *
   * @example
   * ```typescript
   * // Hold $100 for a booking
   * const preauth = await helcim.preauthorize({
   *   amount: 10000,
   *   currency: 'USD',
   *   cardToken: 'token_from_helcimpay_js',
   *   comments: 'Booking #12345 - Hold until event',
   * });
   *
   * // Later, capture the funds
   * await helcim.capturePayment({
   *   preAuthTransactionId: preauth.transactionId,
   *   amount: 10000,
   * });
   * ```
   */
  async preauthorize(request: PreauthRequest): Promise<PreauthResponse> {
    const requestData = this.addDefaults(request);

    console.log(
      `[Helcim] Pre-authorizing: ${formatAmount(request.amount, request.currency)}`
    );

    return this.request<PreauthResponse>('/payment/preauth', 'POST', requestData);
  }

  /**
   * Capture a previously pre-authorized payment
   *
   * @example
   * ```typescript
   * // Capture the full amount
   * await helcim.capturePayment({
   *   preAuthTransactionId: 123456,
   *   amount: 10000,
   * });
   *
   * // Partial capture (e.g., if booking was partially used)
   * await helcim.capturePayment({
   *   preAuthTransactionId: 123456,
   *   amount: 7500, // Only capture $75 of the $100 hold
   * });
   * ```
   */
  async capturePayment(request: CaptureRequest): Promise<CaptureResponse> {
    const requestData = this.addDefaults(request);

    console.log(
      `[Helcim] Capturing preauth ${request.preAuthTransactionId}: ${formatAmount(request.amount, 'USD')}`
    );

    return this.request<CaptureResponse>('/payment/capture', 'POST', requestData);
  }

  /**
   * Refund a payment (full or partial)
   *
   * @example
   * ```typescript
   * // Full refund
   * await helcim.refundPayment({
   *   originalTransactionId: 123456,
   *   amount: 10000,
   * });
   *
   * // Partial refund
   * await helcim.refundPayment({
   *   originalTransactionId: 123456,
   *   amount: 5000, // Refund $50 of the $100 payment
   * });
   * ```
   */
  async refundPayment(request: RefundRequest): Promise<RefundResponse> {
    const requestData = this.addDefaults(request);

    console.log(
      `[Helcim] Refunding transaction ${request.originalTransactionId}: ${formatAmount(request.amount, 'USD')}`
    );

    return this.request<RefundResponse>('/payment/refund', 'POST', requestData);
  }

  /**
   * Get details of a specific transaction
   *
   * @example
   * ```typescript
   * const transaction = await helcim.getTransaction(123456);
   * console.log('Transaction status:', transaction.status);
   * ```
   */
  async getTransaction(transactionId: number): Promise<TransactionDetails> {
    console.log(`[Helcim] Fetching transaction ${transactionId}`);

    return this.request<TransactionDetails>(
      `/payment/transactions/${transactionId}`,
      'GET'
    );
  }

  /**
   * Verify webhook signature to prevent fraud
   *
   * Helcim sends a signature in the webhook request headers to verify authenticity.
   * Always verify this signature before processing webhook events.
   *
   * @example
   * ```typescript
   * // In your webhook endpoint
   * export async function POST(request: Request) {
   *   const signature = request.headers.get('helcim-signature');
   *   const payload = await request.text();
   *
   *   const result = helcim.verifyWebhook(payload, signature);
   *
   *   if (!result.valid) {
   *     return new Response('Invalid signature', { status: 401 });
   *   }
   *
   *   // Process the webhook event
   *   console.log('Transaction:', result.event.transactionId);
   *   console.log('Status:', result.event.type);
   * }
   * ```
   */
  verifyWebhook(
    payload: string,
    signature: string | null
  ): WebhookVerificationResult {
    if (!this.config.webhookSecret) {
      console.warn('[Helcim] Webhook secret not configured - cannot verify signature');
      return {
        valid: false,
        error: 'Webhook secret not configured',
      };
    }

    if (!signature) {
      return {
        valid: false,
        error: 'Missing webhook signature',
      };
    }

    try {
      // Compute expected signature
      const hmac = crypto.createHmac('sha256', this.config.webhookSecret);
      hmac.update(payload);
      const expectedSignature = hmac.digest('hex');

      // Compare signatures (timing-safe comparison)
      const valid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!valid) {
        return {
          valid: false,
          error: 'Invalid webhook signature',
        };
      }

      // Parse the event
      const event = JSON.parse(payload) as HelcimWebhookEvent;

      console.log('[Helcim] Webhook verified:', {
        transactionId: event.transactionId,
        type: event.type,
        amount: formatAmount(event.amount, event.currency),
      });

      return {
        valid: true,
        event,
      };
    } catch (error) {
      console.error('[Helcim] Webhook verification failed:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  /**
   * Test connectivity to Helcim API
   *
   * This is a simple test to verify your API credentials are working.
   * It doesn't make an actual transaction, but validates authentication.
   *
   * @example
   * ```typescript
   * const isConnected = await helcim.testConnection();
   * if (isConnected) {
   *   console.log('Helcim API is configured correctly');
   * }
   * ```
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('[Helcim] Testing API connection...');

      // Test with a minimal request (this will fail validation but confirm auth)
      // The presence of validation errors (not auth errors) means connection works
      await this.request('/payment/purchase', 'POST', {
        amount: 1,
        currency: 'USD',
        cardToken: 'test',
      });

      return true;
    } catch (error) {
      if (error instanceof HelcimError) {
        // If we get a validation error (400), credentials are valid
        if (error.statusCode === 400) {
          console.log('[Helcim] Connection test successful (credentials valid)');
          return true;
        }
        // 401/403 means auth failure
        if (error.statusCode === 401 || error.statusCode === 403) {
          console.error('[Helcim] Authentication failed - check API token');
          return false;
        }
      }

      console.error('[Helcim] Connection test failed:', error);
      return false;
    }
  }
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

/**
 * Create a Helcim client with environment variables
 *
 * @example
 * ```typescript
 * import { createHelcimClient } from '@/lib/helcim';
 *
 * const helcim = createHelcimClient();
 * const result = await helcim.processPayment({ ... });
 * ```
 */
export function createHelcimClient(config?: Partial<HelcimConfig>): HelcimClient {
  return new HelcimClient({
    apiToken: config?.apiToken || process.env.HELCIM_API_TOKEN || '',
    accountId: config?.accountId || process.env.HELCIM_ACCOUNT_ID || '',
    terminalId: config?.terminalId || process.env.HELCIM_TERMINAL_ID || '',
    webhookSecret: config?.webhookSecret || process.env.HELCIM_WEBHOOK_SECRET,
    baseUrl: config?.baseUrl,
    testMode: config?.testMode || process.env.NODE_ENV !== 'production',
  });
}

// Re-export types for convenience
export * from './helcim.types';
