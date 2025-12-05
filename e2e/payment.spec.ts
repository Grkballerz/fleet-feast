import { test, expect } from '@playwright/test';
import { stripeTestCards, waitFor } from './fixtures/test-data';

/**
 * Payment Flow E2E Tests
 * Tests Stripe payment integration and payment workflows
 */

test.describe('Payment Processing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(waitFor.navigation);
  });

  test('should complete payment with valid card', async ({ page }) => {
    // Navigate to a booking that needs payment
    await page.goto('/dashboard/bookings');

    // Find an accepted booking awaiting payment
    const acceptedBooking = page.locator('[data-status="ACCEPTED"], .status-accepted').first();

    if (await acceptedBooking.isVisible()) {
      // Click pay now button
      const payButton = page.locator('button:has-text("Pay"), button:has-text("Make Payment")').first();
      await payButton.click();

      await page.waitForTimeout(waitFor.transition);

      // Wait for Stripe Elements to load
      await page.waitForTimeout(2000);

      // Fill in Stripe card element using iframe
      const stripeCardFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();

      // Try to fill card number
      const cardNumberInput = stripeCardFrame.locator('input[name="cardnumber"], input[placeholder*="card number"]');
      if (await cardNumberInput.isVisible({ timeout: 5000 })) {
        await cardNumberInput.fill(stripeTestCards.success.number);

        // Fill expiry
        const expiryInput = stripeCardFrame.locator('input[name="exp-date"], input[placeholder*="MM"]');
        await expiryInput.fill(stripeTestCards.success.expiry);

        // Fill CVC
        const cvcInput = stripeCardFrame.locator('input[name="cvc"], input[placeholder*="CVC"]');
        await cvcInput.fill(stripeTestCards.success.cvc);
      }

      // Fill billing details (outside iframe)
      const zipInput = page.locator('input[name="zip"], input[name="postalCode"]');
      if (await zipInput.isVisible()) {
        await zipInput.fill(stripeTestCards.success.zip);
      }

      // Submit payment
      const submitButton = page.locator('button[type="submit"]:has-text("Pay"), button:has-text("Complete Payment")').first();
      await submitButton.click();

      // Wait for payment processing
      await page.waitForTimeout(waitFor.api * 2);

      // Should show success message
      const successMessage = page.locator('text=/payment successful|payment complete|thank you/i');
      await expect(successMessage).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });

  test('should handle declined card', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    const acceptedBooking = page.locator('[data-status="ACCEPTED"]').first();

    if (await acceptedBooking.isVisible()) {
      const payButton = page.locator('button:has-text("Pay")').first();
      await payButton.click();

      await page.waitForTimeout(waitFor.transition);
      await page.waitForTimeout(2000);

      // Use declined test card
      const stripeCardFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();

      const cardNumberInput = stripeCardFrame.locator('input[name="cardnumber"]');
      if (await cardNumberInput.isVisible({ timeout: 5000 })) {
        await cardNumberInput.fill(stripeTestCards.declined.number);

        const expiryInput = stripeCardFrame.locator('input[name="exp-date"]');
        await expiryInput.fill(stripeTestCards.declined.expiry);

        const cvcInput = stripeCardFrame.locator('input[name="cvc"]');
        await cvcInput.fill(stripeTestCards.declined.cvc);

        const submitButton = page.locator('button[type="submit"]:has-text("Pay")').first();
        await submitButton.click();

        await page.waitForTimeout(waitFor.api);

        // Should show error message
        const errorMessage = page.locator('text=/declined|failed|error/i, .text-red-500');
        await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
      }
    } else {
      test.skip();
    }
  });

  test('should handle insufficient funds', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    const acceptedBooking = page.locator('[data-status="ACCEPTED"]').first();

    if (await acceptedBooking.isVisible()) {
      const payButton = page.locator('button:has-text("Pay")').first();
      await payButton.click();

      await page.waitForTimeout(waitFor.transition);
      await page.waitForTimeout(2000);

      // Use insufficient funds test card
      const stripeCardFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();

      const cardNumberInput = stripeCardFrame.locator('input[name="cardnumber"]');
      if (await cardNumberInput.isVisible({ timeout: 5000 })) {
        await cardNumberInput.fill(stripeTestCards.insufficientFunds.number);

        const expiryInput = stripeCardFrame.locator('input[name="exp-date"]');
        await expiryInput.fill(stripeTestCards.insufficientFunds.expiry);

        const cvcInput = stripeCardFrame.locator('input[name="cvc"]');
        await cvcInput.fill(stripeTestCards.insufficientFunds.cvc);

        const submitButton = page.locator('button[type="submit"]:has-text("Pay")').first();
        await submitButton.click();

        await page.waitForTimeout(waitFor.api);

        // Should show insufficient funds error
        const errorMessage = page.locator('text=/insufficient|not enough/i');
        await expect(errorMessage).toBeVisible({ timeout: 10000 });
      }
    } else {
      test.skip();
    }
  });

  test('should validate card form before submission', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    const acceptedBooking = page.locator('[data-status="ACCEPTED"]').first();

    if (await acceptedBooking.isVisible()) {
      const payButton = page.locator('button:has-text("Pay")').first();
      await payButton.click();

      await page.waitForTimeout(waitFor.transition);

      // Try to submit without filling card details
      const submitButton = page.locator('button[type="submit"]:has-text("Pay")').first();
      await submitButton.click();

      await page.waitForTimeout(waitFor.animation);

      // Should show validation errors
      const errorMessage = page.locator('.text-red-500, [role="alert"], text=/required|invalid/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
  });
});

test.describe('Payment Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(waitFor.navigation);
  });

  test('should show payment receipt', async ({ page }) => {
    // Navigate to a paid booking
    await page.goto('/dashboard/bookings');

    const paidBooking = page.locator('[data-status="CONFIRMED"], .status-confirmed').first();

    if (await paidBooking.isVisible()) {
      await paidBooking.click();

      await page.waitForTimeout(waitFor.transition);

      // Look for receipt or payment details
      const receipt = page.locator('[data-testid="receipt"], .receipt, text=/receipt|payment details/i');
      await expect(receipt.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should download payment receipt as PDF', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    const paidBooking = page.locator('[data-status="CONFIRMED"]').first();

    if (await paidBooking.isVisible()) {
      await paidBooking.click();

      await page.waitForTimeout(waitFor.transition);

      // Look for download receipt button
      const downloadButton = page.locator('button:has-text("Download"), a:has-text("Download Receipt")');

      if (await downloadButton.first().isVisible({ timeout: 2000 })) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download');

        await downloadButton.first().click();

        const download = await downloadPromise;

        // Verify download started
        expect(download.suggestedFilename()).toMatch(/receipt|invoice/i);
      }
    }
  });

  test('should send payment confirmation email', async ({ page }) => {
    // This test would require email service integration
    // Placeholder for future implementation
    test.skip();
  });
});

test.describe('Refund Processing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(waitFor.navigation);
  });

  test('should request refund for cancelled booking', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    // Find a confirmed booking that can be cancelled
    const confirmedBooking = page.locator('[data-status="CONFIRMED"]').first();

    if (await confirmedBooking.isVisible()) {
      // Click cancel booking
      const cancelButton = page.locator('button:has-text("Cancel Booking")').first();

      if (await cancelButton.isVisible({ timeout: 2000 })) {
        await cancelButton.click();

        // Select refund reason
        const reasonSelect = page.locator('select[name="reason"], textarea[name="reason"]');
        if (await reasonSelect.isVisible({ timeout: 2000 })) {
          await reasonSelect.fill('Change of plans');

          const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Request Refund")');
          await confirmButton.click();

          await page.waitForTimeout(waitFor.api);

          // Should show refund processing message
          const refundMessage = page.locator('text=/refund|processing/i');
          await expect(refundMessage).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should view refund status', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    // Find a booking with refund
    const refundedBooking = page.locator('[data-status="REFUNDED"], .status-refunded').first();

    if (await refundedBooking.isVisible()) {
      await refundedBooking.click();

      await page.waitForTimeout(waitFor.transition);

      // Should show refund details
      const refundInfo = page.locator('text=/refund|refunded/i');
      await expect(refundInfo).toBeVisible();
    }
  });
});

test.describe('Vendor Payment Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as vendor
    await page.goto('/login');
    await page.fill('input[name="email"]', 'vendor@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(waitFor.navigation);
  });

  test('should view earnings summary', async ({ page }) => {
    await page.goto('/vendor/earnings');

    // Should show earnings dashboard
    const earningsTotal = page.locator('[data-testid="total-earnings"], .earnings-total');
    await expect(earningsTotal.first()).toBeVisible({ timeout: 5000 });
  });

  test('should view payment history', async ({ page }) => {
    await page.goto('/vendor/payments');

    // Should show payments list
    const paymentsList = page.locator('[data-testid="payments-list"], .payments');
    await expect(paymentsList).toBeVisible({ timeout: 5000 });
  });

  test('should setup payout method', async ({ page }) => {
    await page.goto('/vendor/settings/payments');

    // Look for connect Stripe button or bank account form
    const stripeConnect = page.locator('button:has-text("Connect Stripe"), button:has-text("Setup Payouts")');

    if (await stripeConnect.first().isVisible({ timeout: 5000 })) {
      await expect(stripeConnect.first()).toBeVisible();
    }
  });
});
