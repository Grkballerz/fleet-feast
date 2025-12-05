/**
 * Stripe Mock Helper
 * Provides mock implementation of Stripe client for testing
 */

export const mockStripeConnect = {
  createAccount: jest.fn(),
  createAccountLink: jest.fn(),
  isAccountOnboarded: jest.fn(),
};

export const mockStripePayments = {
  createPaymentIntent: jest.fn(),
  capturePaymentIntent: jest.fn(),
  createRefund: jest.fn(),
};

export const mockStripeTransfers = {
  createTransfer: jest.fn(),
};

export const mockStripeUtils = {
  constructWebhookEvent: jest.fn(),
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
