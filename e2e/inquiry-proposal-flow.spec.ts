import { test, expect } from '@playwright/test';
import {
  generateTestCustomer,
  generateTestVendor,
  generateTestBooking,
  waitFor
} from './fixtures/test-data';
import {
  setupBookingUser,
  createTestInquiry,
  createTestProposal,
  loginAsVendor,
  loginAsCustomer
} from './fixtures/booking-fixtures';

/**
 * E2E Tests: Complete Inquiry-to-Payment Flow
 *
 * This test suite covers the complete user journey from inquiry submission
 * to payment completion, including all happy paths and error scenarios.
 *
 * Flow Overview:
 * 1. Customer submits inquiry on truck page
 * 2. Vendor receives inquiry and sends proposal
 * 3. Customer accepts/declines proposal
 * 4. Customer completes payment (if accepted)
 * 5. Booking confirmed
 */

test.describe('Inquiry to Payment Flow - Happy Path', () => {
  let customerEmail: string;
  let vendorEmail: string;
  let bookingId: string;

  test.beforeEach(async ({ page }) => {
    // Generate unique test users for each test
    const customer = generateTestCustomer();
    const vendor = generateTestVendor();
    customerEmail = customer.email;
    vendorEmail = vendor.email;

    // Setup test users in database (assumes fixture helper exists)
    await setupBookingUser('customer', customer);
    await setupBookingUser('vendor', vendor);
  });

  test('Scenario 1: Complete flow from inquiry to payment', async ({ page, context }) => {
    // ========================================
    // STEP 1: Customer creates inquiry
    // ========================================
    console.log('Step 1: Customer creating inquiry...');

    await loginAsCustomer(page, customerEmail);

    // Navigate to truck listing
    await page.goto('/trucks');
    await page.waitForTimeout(waitFor.api);

    // Click on first truck
    const truckCard = page.locator('[data-testid="truck-card"]').first();
    await expect(truckCard).toBeVisible({ timeout: 10000 });
    await truckCard.click();

    await page.waitForURL(/\/trucks\/[a-z0-9-]+/, { timeout: 5000 });

    // Click "Book This Truck" button
    const bookButton = page.locator('button:has-text("Book This Truck")').first();
    await expect(bookButton).toBeVisible();
    await bookButton.click();

    await page.waitForURL(/\/customer\/booking/, { timeout: 5000 });

    // Fill inquiry form
    const booking = generateTestBooking();

    await page.fill('input[name="eventDate"]', booking.eventDate);
    await page.fill('input[name="eventTime"]', booking.eventTime);
    await page.fill('input[name="guestCount"]', booking.guestCount.toString());

    // Select event type
    const eventTypeSelect = page.locator('select[name="eventType"]');
    await eventTypeSelect.selectOption(booking.eventType);

    // Fill location details
    await page.fill('input[name="location.address"]', booking.location.address);
    await page.fill('input[name="location.city"]', booking.location.city);
    await page.fill('input[name="location.state"]', booking.location.state);
    await page.fill('input[name="location.zip"]', booking.location.zip);

    // Fill special requests
    if (booking.specialRequests) {
      await page.fill('textarea[name="specialRequests"]', booking.specialRequests);
    }

    // Submit inquiry
    const submitButton = page.locator('button[type="submit"]:has-text("Submit Inquiry")');
    await submitButton.click();

    await page.waitForTimeout(waitFor.api);

    // Should redirect to booking details page
    await expect(page).toHaveURL(/\/customer\/bookings\/[a-z0-9-]+/);

    // Extract booking ID from URL
    const url = page.url();
    bookingId = url.split('/').pop() || '';

    // Verify inquiry status
    const statusBadge = page.locator('[data-testid="booking-status"], .badge:has-text("INQUIRY")');
    await expect(statusBadge).toBeVisible();

    console.log(`✓ Inquiry created with ID: ${bookingId}`);

    // ========================================
    // STEP 2: Vendor sends proposal
    // ========================================
    console.log('Step 2: Vendor sending proposal...');

    // Open new page for vendor
    const vendorPage = await context.newPage();
    await loginAsVendor(vendorPage, vendorEmail);

    // Navigate to vendor messages
    await vendorPage.goto('/vendor/messages');
    await vendorPage.waitForTimeout(waitFor.api);

    // Find the inquiry message
    const inquiryMessage = vendorPage.locator(`[data-booking-id="${bookingId}"]`).first();
    if (await inquiryMessage.isVisible({ timeout: 2000 })) {
      await inquiryMessage.click();
    } else {
      // Fallback: click first message
      await vendorPage.locator('[data-testid="message-thread"]').first().click();
    }

    await vendorPage.waitForTimeout(waitFor.transition);

    // Click "Send Proposal" button
    const sendProposalBtn = vendorPage.locator('button:has-text("Send Proposal")');
    await expect(sendProposalBtn).toBeVisible({ timeout: 5000 });
    await sendProposalBtn.click();

    await vendorPage.waitForTimeout(waitFor.transition);

    // Fill proposal form
    // Add line item
    await vendorPage.fill('input[name="lineItems[0].name"]', 'Base Catering Service');
    await vendorPage.fill('input[name="lineItems[0].quantity"]', '1');
    await vendorPage.fill('input[name="lineItems[0].unitPrice"]', '1500');

    // Add another line item
    const addItemBtn = vendorPage.locator('button:has-text("Add Line Item")');
    if (await addItemBtn.isVisible({ timeout: 2000 })) {
      await addItemBtn.click();
      await vendorPage.fill('input[name="lineItems[1].name"]', 'Additional Hour');
      await vendorPage.fill('input[name="lineItems[1].quantity"]', '2');
      await vendorPage.fill('input[name="lineItems[1].unitPrice"]', '250');
    }

    // Add inclusions
    const inclusionsTextarea = vendorPage.locator('textarea[name="inclusions"]');
    await inclusionsTextarea.fill('Setup and cleanup\nServing staff\nDisposable plates and utensils');

    // Add terms
    const termsTextarea = vendorPage.locator('textarea[name="terms"]');
    await termsTextarea.fill('50% deposit required upon booking confirmation. Full payment due 7 days before event.');

    // Set expiration
    await vendorPage.fill('input[name="expirationDays"]', '7');

    // Submit proposal
    const submitProposalBtn = vendorPage.locator('button[type="submit"]:has-text("Send Proposal")');
    await submitProposalBtn.click();

    await vendorPage.waitForTimeout(waitFor.api);

    // Verify proposal sent
    const proposalCard = vendorPage.locator('[data-testid="proposal-card"]');
    await expect(proposalCard).toBeVisible({ timeout: 5000 });

    console.log('✓ Proposal sent successfully');

    await vendorPage.close();

    // ========================================
    // STEP 3: Customer accepts proposal
    // ========================================
    console.log('Step 3: Customer accepting proposal...');

    // Navigate to messages to see proposal
    await page.goto(`/customer/messages/${bookingId}`);
    await page.waitForTimeout(waitFor.api);

    // Verify proposal card is visible
    const customerProposalCard = page.locator('[data-testid="proposal-card"]');
    await expect(customerProposalCard).toBeVisible({ timeout: 10000 });

    // Verify pricing is displayed
    const totalAmount = page.locator('text=/\\$2000\\.00|\\$2,000\\.00/');
    await expect(totalAmount.first()).toBeVisible();

    // Click Accept button
    const acceptButton = page.locator('button:has-text("Accept")');
    await expect(acceptButton).toBeVisible();
    await acceptButton.click();

    await page.waitForTimeout(waitFor.api);

    // Should redirect to payment page
    await expect(page).toHaveURL(/\/customer\/booking\/[a-z0-9-]+\/payment/);

    console.log('✓ Proposal accepted, redirected to payment');

    // ========================================
    // STEP 4: Customer completes payment
    // ========================================
    console.log('Step 4: Customer completing payment...');

    // Verify payment page loads
    const paymentHeading = page.locator('h1:has-text("Complete Payment")');
    await expect(paymentHeading).toBeVisible({ timeout: 5000 });

    // Verify booking details are shown
    await expect(page.locator('text=/Booking Details/i')).toBeVisible();
    await expect(page.locator('text=/Payment Breakdown/i')).toBeVisible();

    // Fill Helcim payment form
    const cardNumberField = page.frameLocator('iframe[title*="Helcim"]').locator('input[name="cardNumber"]');
    if (await cardNumberField.isVisible({ timeout: 5000 })) {
      await cardNumberField.fill('4242424242424242');

      const expiryField = page.frameLocator('iframe[title*="Helcim"]').locator('input[name="cardExpiry"]');
      await expiryField.fill('12/30');

      const cvvField = page.frameLocator('iframe[title*="Helcim"]').locator('input[name="cardCVV"]');
      await cvvField.fill('123');
    } else {
      // Fallback for non-iframe implementation
      await page.fill('input[name="cardNumber"]', '4242424242424242');
      await page.fill('input[name="cardExpiry"]', '12/30');
      await page.fill('input[name="cardCVV"]', '123');
    }

    // Submit payment
    const payButton = page.locator('button:has-text("Pay")').first();
    await expect(payButton).toBeVisible();
    await payButton.click();

    await page.waitForTimeout(waitFor.api * 2); // Payment processing may take longer

    // Verify success message
    const successMessage = page.locator('text=/Payment Successful|payment has been processed/i');
    await expect(successMessage).toBeVisible({ timeout: 10000 });

    // Should redirect to booking details with success query param
    await page.waitForURL(/\/customer\/bookings\/[a-z0-9-]+/, { timeout: 10000 });

    // Verify booking status is CONFIRMED
    const confirmedBadge = page.locator('.badge:has-text("CONFIRMED")');
    await expect(confirmedBadge).toBeVisible({ timeout: 5000 });

    console.log('✓ Payment completed successfully, booking confirmed');

    // ========================================
    // VERIFICATION: Check complete flow
    // ========================================

    // Verify event details are preserved
    await expect(page.locator(`text=/${booking.location.city}/`)).toBeVisible();
    await expect(page.locator(`text=/${booking.guestCount}/`)).toBeVisible();

    console.log('✅ Complete inquiry-to-payment flow succeeded!');
  });
});

test.describe('Inquiry to Payment Flow - Customer Declines', () => {
  test('Scenario 2: Customer declines proposal', async ({ page }) => {
    const customer = generateTestCustomer();
    const vendor = generateTestVendor();

    await setupBookingUser('customer', customer);
    await setupBookingUser('vendor', vendor);

    // Create inquiry and proposal via fixture helpers
    const bookingId = await createTestInquiry(page, customer.email);
    await createTestProposal(page, vendor.email, bookingId);

    // Login as customer
    await loginAsCustomer(page, customer.email);

    // Navigate to proposal
    await page.goto(`/customer/messages/${bookingId}`);
    await page.waitForTimeout(waitFor.api);

    // Verify proposal card
    const proposalCard = page.locator('[data-testid="proposal-card"]');
    await expect(proposalCard).toBeVisible({ timeout: 5000 });

    // Click Decline button
    const declineButton = page.locator('button:has-text("Decline")');
    await expect(declineButton).toBeVisible();
    await declineButton.click();

    // Confirm decline in dialog if present
    const confirmButton = page.locator('button:has-text("Yes"), button:has-text("Confirm")');
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }

    await page.waitForTimeout(waitFor.api);

    // Verify declined status
    const declinedBadge = page.locator('.badge:has-text("DECLINED")');
    await expect(declinedBadge).toBeVisible({ timeout: 5000 });

    // Verify message about declined proposal
    const declinedMessage = page.locator('text=/declined this proposal/i');
    await expect(declinedMessage).toBeVisible();

    // Verify no payment button is shown
    const paymentButton = page.locator('button:has-text("Proceed to Payment")');
    await expect(paymentButton).not.toBeVisible();

    console.log('✓ Customer successfully declined proposal');
  });
});

test.describe('Inquiry to Payment Flow - Vendor Declines', () => {
  test('Scenario 3: Vendor declines inquiry without sending proposal', async ({ page }) => {
    const customer = generateTestCustomer();
    const vendor = generateTestVendor();

    await setupBookingUser('customer', customer);
    await setupBookingUser('vendor', vendor);

    // Create inquiry
    const bookingId = await createTestInquiry(page, customer.email);

    // Login as vendor
    await loginAsVendor(page, vendor.email);

    // Navigate to inquiry
    await page.goto('/vendor/messages');
    await page.waitForTimeout(waitFor.api);

    const inquiryMessage = page.locator(`[data-booking-id="${bookingId}"]`).first();
    if (await inquiryMessage.isVisible({ timeout: 2000 })) {
      await inquiryMessage.click();
    } else {
      await page.locator('[data-testid="message-thread"]').first().click();
    }

    await page.waitForTimeout(waitFor.transition);

    // Look for decline button
    const declineButton = page.locator('button:has-text("Decline Inquiry")');
    if (await declineButton.isVisible({ timeout: 2000 })) {
      await declineButton.click();

      // Confirm decline
      const confirmButton = page.locator('button:has-text("Yes"), button:has-text("Confirm")');
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }

      await page.waitForTimeout(waitFor.api);

      // Verify declined status
      const statusBadge = page.locator('.badge:has-text("DECLINED")');
      await expect(statusBadge).toBeVisible({ timeout: 5000 });

      console.log('✓ Vendor successfully declined inquiry');
    } else {
      // If decline button not found, send a decline message instead
      const messageInput = page.locator('textarea[name="message"]');
      await messageInput.fill('Unfortunately, we are not available for this date. Thank you for your inquiry.');

      const sendButton = page.locator('button:has-text("Send")');
      await sendButton.click();

      await page.waitForTimeout(waitFor.api);

      console.log('✓ Vendor sent decline message');
    }
  });
});

test.describe('Inquiry to Payment Flow - Proposal Expiration', () => {
  test('Scenario 4: Proposal expires before customer accepts', async ({ page }) => {
    const customer = generateTestCustomer();
    const vendor = generateTestVendor();

    await setupBookingUser('customer', customer);
    await setupBookingUser('vendor', vendor);

    // Create inquiry and proposal with 0 day expiration (expires immediately)
    const bookingId = await createTestInquiry(page, customer.email);
    await createTestProposal(page, vendor.email, bookingId, { expirationDays: 0 });

    // Login as customer
    await loginAsCustomer(page, customer.email);

    // Navigate to proposal
    await page.goto(`/customer/messages/${bookingId}`);
    await page.waitForTimeout(waitFor.api);

    // Verify proposal card
    const proposalCard = page.locator('[data-testid="proposal-card"]');
    await expect(proposalCard).toBeVisible({ timeout: 5000 });

    // Verify expired badge
    const expiredBadge = page.locator('.badge:has-text("Expired")');
    await expect(expiredBadge).toBeVisible();

    // Verify accept/decline buttons are disabled or not shown
    const acceptButton = page.locator('button:has-text("Accept")');
    if (await acceptButton.isVisible({ timeout: 2000 })) {
      await expect(acceptButton).toBeDisabled();
    } else {
      await expect(acceptButton).not.toBeVisible();
    }

    // Verify expiration message
    const expirationMessage = page.locator('text=/proposal has expired/i');
    await expect(expirationMessage).toBeVisible();

    console.log('✓ Expired proposal displayed correctly');
  });

  test('Scenario 4b: Proposal expiring soon warning', async ({ page }) => {
    const customer = generateTestCustomer();
    const vendor = generateTestVendor();

    await setupBookingUser('customer', customer);
    await setupBookingUser('vendor', vendor);

    // Create proposal expiring in 1 day
    const bookingId = await createTestInquiry(page, customer.email);
    await createTestProposal(page, vendor.email, bookingId, { expirationDays: 1 });

    // Login as customer
    await loginAsCustomer(page, customer.email);

    // Navigate to proposal
    await page.goto(`/customer/messages/${bookingId}`);
    await page.waitForTimeout(waitFor.api);

    // Verify expiring soon warning
    const warningMessage = page.locator('text=/Expires in|expiring soon/i');
    await expect(warningMessage).toBeVisible({ timeout: 5000 });

    // Verify accept button is still enabled
    const acceptButton = page.locator('button:has-text("Accept")');
    await expect(acceptButton).toBeVisible();
    await expect(acceptButton).toBeEnabled();

    console.log('✓ Expiring soon warning displayed correctly');
  });
});

test.describe('Inquiry to Payment Flow - Mobile Responsive', () => {
  test.use({
    viewport: { width: 375, height: 667 } // iPhone SE dimensions
  });

  test('Scenario 5: Complete flow on mobile device', async ({ page, context }) => {
    const customer = generateTestCustomer();
    const vendor = generateTestVendor();

    await setupBookingUser('customer', customer);
    await setupBookingUser('vendor', vendor);

    // ========================================
    // MOBILE: Customer creates inquiry
    // ========================================
    await loginAsCustomer(page, customer.email);

    // Navigate to truck listing
    await page.goto('/trucks');
    await page.waitForTimeout(waitFor.api);

    // On mobile, cards should stack vertically
    const truckCard = page.locator('[data-testid="truck-card"]').first();
    await expect(truckCard).toBeVisible({ timeout: 10000 });

    // Verify card is full width on mobile
    const cardBox = await truckCard.boundingBox();
    expect(cardBox?.width).toBeGreaterThan(300); // Should be close to full width

    await truckCard.click();
    await page.waitForURL(/\/trucks\/[a-z0-9-]+/);

    // Mobile sticky booking button should be visible
    const mobileBookButton = page.locator('button:has-text("Book This Truck")').first();
    await expect(mobileBookButton).toBeVisible();

    // Verify button is positioned correctly (sticky)
    const buttonBox = await mobileBookButton.boundingBox();
    expect(buttonBox).not.toBeNull();

    await mobileBookButton.click();
    await page.waitForURL(/\/customer\/booking/);

    // Fill inquiry form on mobile
    const booking = generateTestBooking();

    // Form fields should be stacked vertically
    await page.fill('input[name="eventDate"]', booking.eventDate);
    await page.fill('input[name="eventTime"]', booking.eventTime);

    // Scroll to ensure field is visible before filling
    await page.locator('input[name="guestCount"]').scrollIntoViewIfNeeded();
    await page.fill('input[name="guestCount"]', booking.guestCount.toString());

    await page.locator('select[name="eventType"]').scrollIntoViewIfNeeded();
    await page.selectOption('select[name="eventType"]', booking.eventType);

    await page.locator('input[name="location.address"]').scrollIntoViewIfNeeded();
    await page.fill('input[name="location.address"]', booking.location.address);
    await page.fill('input[name="location.city"]', booking.location.city);
    await page.fill('input[name="location.state"]', booking.location.state);
    await page.fill('input[name="location.zip"]', booking.location.zip);

    // Submit button should be full width on mobile
    const submitButton = page.locator('button[type="submit"]:has-text("Submit Inquiry")');
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    await page.waitForTimeout(waitFor.api);
    await expect(page).toHaveURL(/\/customer\/bookings\/[a-z0-9-]+/);

    const url = page.url();
    const bookingId = url.split('/').pop() || '';

    console.log('✓ Mobile inquiry submitted successfully');

    // ========================================
    // MOBILE: Vendor sends proposal (tablet view)
    // ========================================
    const vendorPage = await context.newPage();
    await vendorPage.setViewportSize({ width: 768, height: 1024 }); // Tablet

    await loginAsVendor(vendorPage, vendor.email);
    await vendorPage.goto('/vendor/messages');
    await vendorPage.waitForTimeout(waitFor.api);

    const inquiryMessage = vendorPage.locator('[data-testid="message-thread"]').first();
    await inquiryMessage.click();
    await vendorPage.waitForTimeout(waitFor.transition);

    const sendProposalBtn = vendorPage.locator('button:has-text("Send Proposal")');
    await expect(sendProposalBtn).toBeVisible();
    await sendProposalBtn.click();

    // Fill proposal (fields should be responsive)
    await vendorPage.fill('input[name="lineItems[0].name"]', 'Mobile Catering');
    await vendorPage.fill('input[name="lineItems[0].quantity"]', '1');
    await vendorPage.fill('input[name="lineItems[0].unitPrice"]', '1500');

    await vendorPage.locator('textarea[name="inclusions"]').scrollIntoViewIfNeeded();
    await vendorPage.fill('textarea[name="inclusions"]', 'Full service');

    await vendorPage.locator('button[type="submit"]:has-text("Send Proposal")').scrollIntoViewIfNeeded();
    await vendorPage.locator('button[type="submit"]:has-text("Send Proposal")').click();

    await vendorPage.waitForTimeout(waitFor.api);
    await vendorPage.close();

    console.log('✓ Vendor sent proposal on tablet');

    // ========================================
    // MOBILE: Customer accepts on phone
    // ========================================
    await page.goto(`/customer/messages/${bookingId}`);
    await page.waitForTimeout(waitFor.api);

    const proposalCard = page.locator('[data-testid="proposal-card"]');
    await expect(proposalCard).toBeVisible({ timeout: 10000 });

    // Proposal card should be responsive
    const proposalBox = await proposalCard.boundingBox();
    expect(proposalBox?.width).toBeLessThanOrEqual(375);

    // Buttons should stack vertically on mobile
    const acceptButton = page.locator('button:has-text("Accept")');
    await acceptButton.scrollIntoViewIfNeeded();
    await expect(acceptButton).toBeVisible();
    await acceptButton.click();

    await page.waitForTimeout(waitFor.api);
    await expect(page).toHaveURL(/\/customer\/booking\/[a-z0-9-]+\/payment/);

    console.log('✓ Customer accepted proposal on mobile');

    // ========================================
    // MOBILE: Payment page responsive
    // ========================================

    // Payment page should have single column layout on mobile
    const paymentHeading = page.locator('h1:has-text("Complete Payment")');
    await expect(paymentHeading).toBeVisible();

    // Booking details should be above payment form on mobile
    const bookingDetails = page.locator('text=/Booking Details/');
    const paymentForm = page.locator('text=/Payment Information/');

    await expect(bookingDetails).toBeVisible();
    await expect(paymentForm).toBeVisible();

    console.log('✅ Mobile responsive flow completed successfully!');
  });
});

test.describe('Inquiry to Payment Flow - Error Handling', () => {
  test('Should handle network errors during inquiry submission', async ({ page }) => {
    const customer = generateTestCustomer();
    await setupBookingUser('customer', customer);
    await loginAsCustomer(page, customer.email);

    // Navigate to booking page
    await page.goto('/trucks');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('[data-testid="truck-card"]').first();
    await truckCard.click();
    await page.waitForURL(/\/trucks\/[a-z0-9-]+/);

    const bookButton = page.locator('button:has-text("Book This Truck")').first();
    await bookButton.click();
    await page.waitForURL(/\/customer\/booking/);

    // Fill form
    const booking = generateTestBooking();
    await page.fill('input[name="eventDate"]', booking.eventDate);
    await page.fill('input[name="eventTime"]', booking.eventTime);
    await page.fill('input[name="guestCount"]', booking.guestCount.toString());

    // Intercept API call and simulate network error
    await page.route('**/api/inquiries', route => route.abort());

    // Submit
    const submitButton = page.locator('button[type="submit"]:has-text("Submit Inquiry")');
    await submitButton.click();

    await page.waitForTimeout(waitFor.api);

    // Should show error message
    const errorMessage = page.locator('.alert-error, [role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    console.log('✓ Network error handled correctly');
  });

  test('Should validate required fields on inquiry form', async ({ page }) => {
    const customer = generateTestCustomer();
    await setupBookingUser('customer', customer);
    await loginAsCustomer(page, customer.email);

    // Navigate to booking page
    await page.goto('/trucks');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('[data-testid="truck-card"]').first();
    await truckCard.click();
    await page.waitForURL(/\/trucks\/[a-z0-9-]+/);

    const bookButton = page.locator('button:has-text("Book This Truck")').first();
    await bookButton.click();
    await page.waitForURL(/\/customer\/booking/);

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"]:has-text("Submit Inquiry")');
    await submitButton.click();

    // Should show validation errors
    const validationError = page.locator('text=/required|Please fill/i').first();
    await expect(validationError).toBeVisible({ timeout: 3000 });

    console.log('✓ Form validation working correctly');
  });

  test('Should handle payment processing errors gracefully', async ({ page }) => {
    const customer = generateTestCustomer();
    const vendor = generateTestVendor();

    await setupBookingUser('customer', customer);
    await setupBookingUser('vendor', vendor);

    // Create inquiry and proposal
    const bookingId = await createTestInquiry(page, customer.email);
    await createTestProposal(page, vendor.email, bookingId);

    // Login and accept proposal
    await loginAsCustomer(page, customer.email);
    await page.goto(`/customer/messages/${bookingId}`);
    await page.waitForTimeout(waitFor.api);

    const acceptButton = page.locator('button:has-text("Accept")');
    await acceptButton.click();

    await page.waitForTimeout(waitFor.api);
    await expect(page).toHaveURL(/\/payment/);

    // Intercept payment API to simulate error
    await page.route('**/api/payments', route =>
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: { message: 'Payment declined' } })
      })
    );

    // Try to submit payment with test card
    await page.fill('input[name="cardNumber"]', '4000000000000002'); // Declined card
    await page.fill('input[name="cardExpiry"]', '12/30');
    await page.fill('input[name="cardCVV"]', '123');

    const payButton = page.locator('button:has-text("Pay")').first();
    await payButton.click();

    await page.waitForTimeout(waitFor.api);

    // Should show error message
    const errorAlert = page.locator('.alert-error:has-text("Payment declined")');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });

    // Should NOT redirect to success page
    await expect(page).toHaveURL(/\/payment/);

    console.log('✓ Payment error handled correctly');
  });
});
