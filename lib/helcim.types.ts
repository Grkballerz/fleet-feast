/**
 * Helcim API TypeScript Types
 *
 * Official API Documentation: https://devdocs.helcim.com/
 *
 * These types represent the request and response structures for Helcim's REST API.
 * Helcim does not provide an official TypeScript SDK, so we define types based on
 * the API documentation.
 */

// =============================================================================
// BASE TYPES
// =============================================================================

export type Currency = 'CAD' | 'USD';

export type TransactionType =
  | 'purchase'
  | 'preauth'
  | 'capture'
  | 'refund'
  | 'verify'
  | 'withdraw';

export type CardType =
  | 'VISA'
  | 'MASTERCARD'
  | 'AMEX'
  | 'DISCOVER'
  | 'DINERS'
  | 'JCB';

export type TransactionStatus =
  | 'APPROVED'
  | 'DECLINED'
  | 'ERROR';

// =============================================================================
// API ERROR TYPES
// =============================================================================

export interface HelcimApiError {
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  message?: string;
  error?: string;
}

export class HelcimError extends Error {
  public statusCode?: number;
  public errors?: HelcimApiError['errors'];

  constructor(message: string, statusCode?: number, errors?: HelcimApiError['errors']) {
    super(message);
    this.name = 'HelcimError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

export interface BaseHelcimRequest {
  /** Your Helcim account ID */
  accountId?: string;
  /** Your Helcim terminal ID */
  terminalId?: string;
}

export interface PurchaseRequest extends BaseHelcimRequest {
  /** Amount in cents (e.g., 1000 = $10.00) */
  amount: number;
  /** Currency code */
  currency: Currency;
  /** Card token from HelcimPay.js (frontend) */
  cardToken: string;
  /** Customer code for tracking */
  customerCode?: string;
  /** Invoice number */
  invoiceNumber?: string;
  /** Custom reference (e.g., booking ID) */
  comments?: string;
  /** Billing information */
  billing?: BillingInfo;
  /** IP address of the customer */
  ipAddress?: string;
  /** Test mode flag */
  test?: boolean;
}

export interface PreauthRequest extends BaseHelcimRequest {
  /** Amount to pre-authorize in cents */
  amount: number;
  /** Currency code */
  currency: Currency;
  /** Card token from HelcimPay.js */
  cardToken: string;
  /** Customer code for tracking */
  customerCode?: string;
  /** Invoice number */
  invoiceNumber?: string;
  /** Custom reference (e.g., booking ID) */
  comments?: string;
  /** Billing information */
  billing?: BillingInfo;
  /** IP address of the customer */
  ipAddress?: string;
  /** Test mode flag */
  test?: boolean;
}

export interface CaptureRequest extends BaseHelcimRequest {
  /** Original preauth transaction ID */
  preAuthTransactionId: number;
  /** Amount to capture in cents (can be less than or equal to preauth) */
  amount: number;
  /** Invoice number */
  invoiceNumber?: string;
  /** IP address of the customer */
  ipAddress?: string;
  /** Test mode flag */
  test?: boolean;
}

export interface RefundRequest extends BaseHelcimRequest {
  /** Original transaction ID to refund */
  originalTransactionId: number;
  /** Amount to refund in cents (can be partial) */
  amount: number;
  /** IP address of the customer */
  ipAddress?: string;
  /** Test mode flag */
  test?: boolean;
}

export interface BillingInfo {
  name?: string;
  street1?: string;
  street2?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface HelcimTransactionResponse {
  /** Transaction ID from Helcim */
  transactionId: number;
  /** Date and time of transaction */
  dateCreated: string;
  /** Transaction status */
  status: TransactionStatus;
  /** Transaction type */
  type: TransactionType;
  /** Amount in cents */
  amount: number;
  /** Currency code */
  currency: Currency;
  /** Approval code (if approved) */
  approvalCode?: string;
  /** AVS response code */
  avsResponse?: string;
  /** CVV response code */
  cvvResponse?: string;
  /** Card information (masked) */
  cardNumber?: string;
  /** Card type */
  cardType?: CardType;
  /** Card expiry (MMYY) */
  cardExpiry?: string;
  /** Cardholder name */
  cardHolderName?: string;
  /** Customer code */
  customerCode?: string;
  /** Invoice number */
  invoiceNumber?: string;
  /** Comments/reference */
  comments?: string;
  /** Warning message (if any) */
  warning?: string;
}

export interface PurchaseResponse extends HelcimTransactionResponse {
  type: 'purchase';
}

export interface PreauthResponse extends HelcimTransactionResponse {
  type: 'preauth';
}

export interface CaptureResponse extends HelcimTransactionResponse {
  type: 'capture';
  /** Original preauth transaction ID */
  preAuthTransactionId: number;
}

export interface RefundResponse extends HelcimTransactionResponse {
  type: 'refund';
  /** Original transaction ID */
  originalTransactionId: number;
}

export interface TransactionDetails {
  transactionId: number;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: Currency;
  dateCreated: string;
  cardNumber?: string;
  cardType?: CardType;
  approvalCode?: string;
  customerCode?: string;
  invoiceNumber?: string;
  comments?: string;
}

// =============================================================================
// HELCIM PAY INITIALIZATION
// =============================================================================

export interface HelcimPayInitializeRequest {
  /** Your JS config token from Helcim dashboard */
  token: string;
  /** Language preference */
  language?: 'en' | 'fr';
}

export interface HelcimPayInitializeResponse {
  /** Checkout token for frontend */
  checkoutToken: string;
  /** Session expiry timestamp */
  sessionExpiry: string;
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

export interface HelcimWebhookEvent {
  /** Event type */
  type: 'APPROVED' | 'DECLINED' | 'REFUNDED';
  /** Transaction ID */
  transactionId: number;
  /** Transaction type */
  transactionType: TransactionType;
  /** Amount in cents */
  amount: number;
  /** Currency */
  currency: Currency;
  /** Timestamp */
  dateCreated: string;
  /** Customer code */
  customerCode?: string;
  /** Invoice number */
  invoiceNumber?: string;
  /** Comments */
  comments?: string;
  /** Card data (masked) */
  cardNumber?: string;
  cardType?: CardType;
}

export interface WebhookVerificationResult {
  valid: boolean;
  event?: HelcimWebhookEvent;
  error?: string;
}

// =============================================================================
// CLIENT CONFIGURATION
// =============================================================================

export interface HelcimConfig {
  /** API token from Helcim dashboard */
  apiToken: string;
  /** Your Helcim account ID */
  accountId: string;
  /** Your Helcim terminal ID */
  terminalId: string;
  /** Webhook secret for signature verification */
  webhookSecret?: string;
  /** Base API URL (defaults to https://api.helcim.com/v2) */
  baseUrl?: string;
  /** Test mode flag */
  testMode?: boolean;
}
