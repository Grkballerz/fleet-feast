/**
 * TypeScript declarations for Helcim.js
 *
 * Helcim.js is a client-side library for securely tokenizing credit card data.
 * This file provides type definitions for the global `helcim` object.
 *
 * @see {@link https://devdocs.helcim.com/helcim-js/overview Helcim.js Documentation}
 */

declare global {
  interface Window {
    /**
     * Helcim.js global object
     * Available after loading https://myhelcim.com/js/version2.js
     */
    helcim?: HelcimAPI;
  }
}

/**
 * Main Helcim API interface
 */
interface HelcimAPI {
  /**
   * Initialize and append the Helcim payment iframe to the DOM
   *
   * @param config - Configuration object for Helcim payment form
   *
   * @example
   * ```typescript
   * window.helcim.appendHelcimIframe({
   *   token: process.env.NEXT_PUBLIC_HELCIM_JS_CONFIG_TOKEN,
   *   onSuccess: (response) => {
   *     console.log('Card token:', response.cardToken);
   *   },
   *   onError: (error) => {
   *     console.error('Tokenization failed:', error.message);
   *   },
   *   onReady: () => {
   *     console.log('Form is ready');
   *   }
   * });
   * ```
   */
  appendHelcimIframe: (config: HelcimConfig) => void;
}

/**
 * Configuration for Helcim payment form initialization
 */
interface HelcimConfig {
  /**
   * Your Helcim.js configuration token
   * Get this from: Helcim Dashboard → Settings → HelcimPay.js → Configuration
   */
  token: string;

  /**
   * Callback fired when card tokenization succeeds
   * @param response - Success response containing the card token
   */
  onSuccess: (response: HelcimSuccessResponse) => void;

  /**
   * Callback fired when card tokenization fails
   * @param error - Error response containing failure details
   */
  onError: (error: HelcimErrorResponse) => void;

  /**
   * Optional callback fired when the form is ready for user input
   */
  onReady?: () => void;

  /**
   * Optional language preference for the form
   * @default "en"
   */
  language?: "en" | "fr";
}

/**
 * Success response from Helcim.js tokenization
 */
interface HelcimSuccessResponse {
  /**
   * The tokenized card token - use this for backend payment processing
   * This token is safe to send to your server
   */
  cardToken: string;

  /**
   * Type of card (e.g., "VISA", "MASTERCARD", "AMEX")
   */
  cardType?: string;

  /**
   * Last 4 digits of the card number
   */
  cardNumber?: string;

  /**
   * Expiry month (MM)
   */
  expiryMonth?: string;

  /**
   * Expiry year (YYYY)
   */
  expiryYear?: string;

  /**
   * Cardholder name
   */
  cardholderName?: string;
}

/**
 * Error response from Helcim.js tokenization
 */
interface HelcimErrorResponse {
  /**
   * Error type/code
   */
  error: string;

  /**
   * Human-readable error message
   */
  message?: string;

  /**
   * Additional error details
   */
  details?: string;

  /**
   * Field-specific validation errors
   */
  fieldErrors?: Array<{
    field: string;
    message: string;
  }>;
}

export {};
