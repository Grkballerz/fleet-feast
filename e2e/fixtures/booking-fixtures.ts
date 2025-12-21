/**
 * Booking Flow E2E Test Fixtures
 *
 * Provides reusable helper functions for testing the complete
 * inquiry-to-payment booking flow.
 */

import { Page } from '@playwright/test';
import { generateTestCustomer, generateTestVendor, generateTestBooking, waitFor } from './test-data';

/**
 * User setup data for bookings
 */
export interface BookingUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  businessName?: string;
  cuisineType?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

/**
 * Proposal options
 */
export interface ProposalOptions {
  lineItems?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  inclusions?: string[];
  terms?: string;
  expirationDays?: number;
}

/**
 * Setup a test user (customer or vendor) in the database
 *
 * @param role - 'customer' or 'vendor'
 * @param userData - User data to create
 * @returns User ID
 */
export async function setupBookingUser(
  role: 'customer' | 'vendor',
  userData: BookingUserData
): Promise<string> {
  // This would typically call a test API endpoint to create the user
  // For now, we'll simulate this with a fetch call

  try {
    const response = await fetch('http://localhost:3000/api/test/setup-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        ...userData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to setup ${role}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.userId;
  } catch (error) {
    console.error(`Error setting up ${role}:`, error);
    throw error;
  }
}

/**
 * Login as customer
 *
 * @param page - Playwright page
 * @param email - Customer email
 * @param password - Customer password (defaults to test password)
 */
export async function loginAsCustomer(
  page: Page,
  email: string,
  password: string = 'TestPass123!'
): Promise<void> {
  await page.goto('/login');
  await page.waitForTimeout(waitFor.navigation);

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  await page.waitForTimeout(waitFor.navigation);

  // Verify login succeeded
  const dashboardUrl = /\/customer\/|\/dashboard/;
  await page.waitForURL(dashboardUrl, { timeout: 5000 });
}

/**
 * Login as vendor
 *
 * @param page - Playwright page
 * @param email - Vendor email
 * @param password - Vendor password (defaults to test password)
 */
export async function loginAsVendor(
  page: Page,
  email: string,
  password: string = 'VendorPass123!'
): Promise<void> {
  await page.goto('/login');
  await page.waitForTimeout(waitFor.navigation);

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  await page.waitForTimeout(waitFor.navigation);

  // Verify login succeeded
  const vendorUrl = /\/vendor\//;
  await page.waitForURL(vendorUrl, { timeout: 5000 });
}

/**
 * Create a test inquiry
 *
 * @param page - Playwright page
 * @param customerEmail - Customer email (must be logged in)
 * @returns Booking ID
 */
export async function createTestInquiry(
  page: Page,
  customerEmail: string
): Promise<string> {
  // Ensure customer is logged in
  await loginAsCustomer(page, customerEmail);

  // Navigate to trucks page
  await page.goto('/trucks');
  await page.waitForTimeout(waitFor.api);

  // Click first truck
  const truckCard = page.locator('[data-testid="truck-card"]').first();
  await truckCard.click();
  await page.waitForURL(/\/trucks\/[a-z0-9-]+/);

  // Click Book button
  const bookButton = page.locator('button:has-text("Book This Truck")').first();
  await bookButton.click();
  await page.waitForURL(/\/customer\/booking/);

  // Fill inquiry form
  const booking = generateTestBooking();

  await page.fill('input[name="eventDate"]', booking.eventDate);
  await page.fill('input[name="eventTime"]', booking.eventTime);
  await page.fill('input[name="guestCount"]', booking.guestCount.toString());
  await page.selectOption('select[name="eventType"]', booking.eventType);

  await page.fill('input[name="location.address"]', booking.location.address);
  await page.fill('input[name="location.city"]', booking.location.city);
  await page.fill('input[name="location.state"]', booking.location.state);
  await page.fill('input[name="location.zip"]', booking.location.zip);

  if (booking.specialRequests) {
    await page.fill('textarea[name="specialRequests"]', booking.specialRequests);
  }

  // Submit
  const submitButton = page.locator('button[type="submit"]:has-text("Submit Inquiry")');
  await submitButton.click();

  await page.waitForTimeout(waitFor.api);

  // Extract booking ID from URL
  await page.waitForURL(/\/customer\/bookings\/[a-z0-9-]+/);
  const url = page.url();
  const bookingId = url.split('/').pop() || '';

  return bookingId;
}

/**
 * Create a test proposal
 *
 * @param page - Playwright page
 * @param vendorEmail - Vendor email (must be logged in)
 * @param bookingId - Booking ID to send proposal for
 * @param options - Proposal options
 */
export async function createTestProposal(
  page: Page,
  vendorEmail: string,
  bookingId: string,
  options: ProposalOptions = {}
): Promise<void> {
  // Ensure vendor is logged in
  await loginAsVendor(page, vendorEmail);

  // Navigate to vendor messages
  await page.goto('/vendor/messages');
  await page.waitForTimeout(waitFor.api);

  // Find and click the inquiry
  const inquiryMessage = page.locator(`[data-booking-id="${bookingId}"]`).first();
  if (await inquiryMessage.isVisible({ timeout: 2000 })) {
    await inquiryMessage.click();
  } else {
    // Fallback: click first message
    await page.locator('[data-testid="message-thread"]').first().click();
  }

  await page.waitForTimeout(waitFor.transition);

  // Click Send Proposal
  const sendProposalBtn = page.locator('button:has-text("Send Proposal")');
  await sendProposalBtn.click();
  await page.waitForTimeout(waitFor.transition);

  // Fill proposal form with defaults or provided options
  const lineItems = options.lineItems || [
    { name: 'Base Catering Service', quantity: 1, unitPrice: 1500 },
    { name: 'Additional Hour', quantity: 2, unitPrice: 250 },
  ];

  for (let i = 0; i < lineItems.length; i++) {
    const item = lineItems[i];

    if (i > 0) {
      // Add another line item
      const addItemBtn = page.locator('button:has-text("Add Line Item")');
      if (await addItemBtn.isVisible({ timeout: 2000 })) {
        await addItemBtn.click();
        await page.waitForTimeout(waitFor.animation);
      }
    }

    await page.fill(`input[name="lineItems[${i}].name"]`, item.name);
    await page.fill(`input[name="lineItems[${i}].quantity"]`, item.quantity.toString());
    await page.fill(`input[name="lineItems[${i}].unitPrice"]`, item.unitPrice.toString());
  }

  // Add inclusions
  const inclusions = options.inclusions || [
    'Setup and cleanup',
    'Serving staff',
    'Disposable plates and utensils',
  ];
  await page.fill('textarea[name="inclusions"]', inclusions.join('\n'));

  // Add terms
  const terms = options.terms || '50% deposit required upon booking confirmation. Full payment due 7 days before event.';
  await page.fill('textarea[name="terms"]', terms);

  // Set expiration
  const expirationDays = options.expirationDays !== undefined ? options.expirationDays : 7;
  await page.fill('input[name="expirationDays"]', expirationDays.toString());

  // Submit proposal
  const submitProposalBtn = page.locator('button[type="submit"]:has-text("Send Proposal")');
  await submitProposalBtn.click();

  await page.waitForTimeout(waitFor.api);
}

/**
 * Accept a proposal as customer
 *
 * @param page - Playwright page
 * @param customerEmail - Customer email
 * @param bookingId - Booking ID
 */
export async function acceptProposal(
  page: Page,
  customerEmail: string,
  bookingId: string
): Promise<void> {
  await loginAsCustomer(page, customerEmail);

  // Navigate to proposal
  await page.goto(`/customer/messages/${bookingId}`);
  await page.waitForTimeout(waitFor.api);

  // Click Accept
  const acceptButton = page.locator('button:has-text("Accept")');
  await acceptButton.click();

  await page.waitForTimeout(waitFor.api);

  // Should redirect to payment page
  await page.waitForURL(/\/customer\/booking\/[a-z0-9-]+\/payment/);
}

/**
 * Decline a proposal as customer
 *
 * @param page - Playwright page
 * @param customerEmail - Customer email
 * @param bookingId - Booking ID
 */
export async function declineProposal(
  page: Page,
  customerEmail: string,
  bookingId: string
): Promise<void> {
  await loginAsCustomer(page, customerEmail);

  // Navigate to proposal
  await page.goto(`/customer/messages/${bookingId}`);
  await page.waitForTimeout(waitFor.api);

  // Click Decline
  const declineButton = page.locator('button:has-text("Decline")');
  await declineButton.click();

  // Confirm if dialog appears
  const confirmButton = page.locator('button:has-text("Yes"), button:has-text("Confirm")');
  if (await confirmButton.isVisible({ timeout: 2000 })) {
    await confirmButton.click();
  }

  await page.waitForTimeout(waitFor.api);
}

/**
 * Complete payment with test card
 *
 * @param page - Playwright page
 * @param cardNumber - Test card number (defaults to success card)
 */
export async function completePayment(
  page: Page,
  cardNumber: string = '4242424242424242'
): Promise<void> {
  // Ensure we're on payment page
  await page.waitForURL(/\/payment/);

  // Try iframe implementation first
  const cardNumberFrame = page.frameLocator('iframe[title*="Helcim"]').locator('input[name="cardNumber"]');
  if (await cardNumberFrame.isVisible({ timeout: 2000 })) {
    await cardNumberFrame.fill(cardNumber);

    const expiryField = page.frameLocator('iframe[title*="Helcim"]').locator('input[name="cardExpiry"]');
    await expiryField.fill('12/30');

    const cvvField = page.frameLocator('iframe[title*="Helcim"]').locator('input[name="cardCVV"]');
    await cvvField.fill('123');
  } else {
    // Fallback to direct fields
    await page.fill('input[name="cardNumber"]', cardNumber);
    await page.fill('input[name="cardExpiry"]', '12/30');
    await page.fill('input[name="cardCVV"]', '123');
  }

  // Submit payment
  const payButton = page.locator('button:has-text("Pay")').first();
  await payButton.click();

  await page.waitForTimeout(waitFor.api * 2); // Payment takes longer

  // Wait for success or error
  await page.waitForTimeout(waitFor.transition);
}

/**
 * Get booking status
 *
 * @param page - Playwright page
 * @param bookingId - Booking ID
 * @returns Booking status string
 */
export async function getBookingStatus(
  page: Page,
  bookingId: string
): Promise<string> {
  await page.goto(`/customer/bookings/${bookingId}`);
  await page.waitForTimeout(waitFor.api);

  const statusBadge = page.locator('[data-testid="booking-status"], .badge').first();
  const statusText = await statusBadge.textContent();

  return statusText?.trim() || 'UNKNOWN';
}

/**
 * Verify proposal details are displayed
 *
 * @param page - Playwright page
 * @param expectedAmount - Expected total amount
 */
export async function verifyProposalDetails(
  page: Page,
  expectedAmount: number
): Promise<boolean> {
  const proposalCard = page.locator('[data-testid="proposal-card"]');
  if (!(await proposalCard.isVisible({ timeout: 5000 }))) {
    return false;
  }

  // Check amount
  const amountText = await page.locator('text=/\\$' + expectedAmount.toFixed(2) + '/').first().textContent();
  if (!amountText) {
    return false;
  }

  // Check line items table
  const lineItemsTable = page.locator('table tbody tr');
  const lineItemCount = await lineItemsTable.count();
  if (lineItemCount === 0) {
    return false;
  }

  // Check inclusions
  const inclusions = page.locator('[data-testid="inclusions"] li');
  const inclusionCount = await inclusions.count();
  if (inclusionCount === 0) {
    return false;
  }

  return true;
}

/**
 * Cleanup test booking data
 *
 * @param bookingId - Booking ID to clean up
 */
export async function cleanupBooking(bookingId: string): Promise<void> {
  try {
    await fetch(`http://localhost:3000/api/test/cleanup-booking/${bookingId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error cleaning up booking:', error);
  }
}

/**
 * Cleanup test user
 *
 * @param email - User email to clean up
 */
export async function cleanupUser(email: string): Promise<void> {
  try {
    await fetch(`http://localhost:3000/api/test/cleanup-user/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error cleaning up user:', error);
  }
}
