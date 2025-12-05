import { test, expect } from '@playwright/test';
import { generateTestVendor, waitFor } from './fixtures/test-data';
import path from 'path';

/**
 * Vendor Onboarding E2E Tests
 * Tests vendor application and approval workflow
 */

test.describe('Vendor Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Create and login as vendor
    const vendor = generateTestVendor();

    // Register vendor account
    await page.goto('/register');
    await page.fill('input[name="email"]', vendor.email);
    await page.fill('input[name="password"]', vendor.password);
    await page.fill('input[name="confirmPassword"]', vendor.password);
    await page.fill('input[name="name"]', vendor.name);

    const vendorRadio = page.locator('input[type="radio"][value="VENDOR"]');
    await vendorRadio.click();

    await page.click('button[type="submit"]');

    // Wait for registration to complete
    await page.waitForTimeout(waitFor.navigation);
  });

  test('should complete vendor profile setup', async ({ page }) => {
    // Navigate to vendor onboarding/profile setup
    const onboardingUrl = page.url().includes('onboarding') ? page.url() : '/vendor/onboarding';
    if (!page.url().includes('onboarding')) {
      await page.goto(onboardingUrl);
    }

    // Fill business information
    await page.fill('input[name="businessName"]', 'Test Food Truck Co.');
    await page.fill('textarea[name="description"]', 'We serve delicious test food for E2E tests!');
    await page.fill('input[name="phone"]', '+12345678901');

    // Service radius
    const radiusInput = page.locator('input[name="serviceRadius"]');
    if (await radiusInput.isVisible()) {
      await radiusInput.fill('25');
    }

    // Minimum booking amount
    const minBookingInput = page.locator('input[name="minBookingAmount"]');
    if (await minBookingInput.isVisible()) {
      await minBookingInput.fill('500');
    }

    // Select cuisine types
    const cuisineCheckbox = page.locator('input[type="checkbox"][value="AMERICAN"]').first();
    if (await cuisineCheckbox.isVisible()) {
      await cuisineCheckbox.check();
    }

    // Submit business information
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    await nextButton.click();

    await page.waitForTimeout(waitFor.transition);

    // Should proceed to next step
    await expect(page).toHaveURL(/onboarding|documents|verification/);
  });

  test('should upload required documents', async ({ page }) => {
    // Navigate to documents section
    await page.goto('/vendor/onboarding');

    // Skip to documents if needed
    const skipButton = page.locator('button:has-text("Skip"), a:has-text("Documents")');
    if (await skipButton.isVisible()) {
      await skipButton.first().click();
    }

    // Upload business license
    const businessLicenseInput = page.locator('input[type="file"][name*="license"], input[type="file"]').first();
    if (await businessLicenseInput.isVisible()) {
      // Create a test file path
      const testFilePath = path.join(process.cwd(), 'public', 'placeholder.jpg');

      // Upload file
      await businessLicenseInput.setInputFiles(testFilePath);

      await page.waitForTimeout(waitFor.animation);

      // Verify upload success indicator
      const successIndicator = page.locator('text=/uploaded|success/i, .text-green-500');
      await expect(successIndicator.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should submit application for review', async ({ page }) => {
    await page.goto('/vendor/onboarding');

    // Fill minimum required fields
    await page.fill('input[name="businessName"]', 'Quick Test Truck');

    // Submit application
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Submit Application")');
    await submitButton.click();

    await page.waitForTimeout(waitFor.api);

    // Should show pending approval message
    const pendingMessage = page.locator('text=/pending|under review|submitted/i');
    await expect(pendingMessage).toBeVisible({ timeout: 5000 });
  });

  test('should save progress and resume later', async ({ page }) => {
    await page.goto('/vendor/onboarding');

    // Fill some information
    await page.fill('input[name="businessName"]', 'Partial Entry Truck');

    // Save draft
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Draft")');
    if (await saveButton.isVisible()) {
      await saveButton.click();

      await page.waitForTimeout(waitFor.api);

      // Reload page
      await page.reload();

      await page.waitForTimeout(waitFor.transition);

      // Verify data persisted
      const businessNameInput = page.locator('input[name="businessName"]');
      await expect(businessNameInput).toHaveValue('Partial Entry Truck');
    }
  });

  test('should validate required fields before submission', async ({ page }) => {
    await page.goto('/vendor/onboarding');

    // Try to submit without required fields
    const submitButton = page.locator('button:has-text("Submit")');
    await submitButton.click();

    // Should show validation errors
    const errorMessages = page.locator('.text-red-500, .text-destructive, [role="alert"]');
    await expect(errorMessages.first()).toBeVisible();
  });
});

test.describe('Admin Vendor Approval', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(waitFor.navigation);
  });

  test('should view pending vendor applications', async ({ page }) => {
    // Navigate to admin vendor management
    await page.goto('/admin/vendors');

    await expect(page.locator('h1')).toContainText(/vendor|applications/i);

    // Check for pending applications list
    const pendingSection = page.locator('text=/pending|awaiting approval/i').first();
    await expect(pendingSection).toBeVisible({ timeout: 5000 });
  });

  test('should approve vendor application', async ({ page }) => {
    await page.goto('/admin/vendors');

    // Find and click on a pending application
    const pendingVendor = page.locator('[data-status="PENDING"], .status-pending').first();

    if (await pendingVendor.isVisible()) {
      await pendingVendor.click();

      await page.waitForTimeout(waitFor.transition);

      // Click approve button
      const approveButton = page.locator('button:has-text("Approve")');
      await approveButton.click();

      // Confirm approval if modal appears
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      if (await confirmButton.isVisible({ timeout: 1000 })) {
        await confirmButton.click();
      }

      await page.waitForTimeout(waitFor.api);

      // Should show success message
      const successMessage = page.locator('text=/approved|success/i');
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
  });

  test('should reject vendor application with reason', async ({ page }) => {
    await page.goto('/admin/vendors');

    const pendingVendor = page.locator('[data-status="PENDING"]').first();

    if (await pendingVendor.isVisible()) {
      await pendingVendor.click();

      await page.waitForTimeout(waitFor.transition);

      // Click reject button
      const rejectButton = page.locator('button:has-text("Reject"), button:has-text("Deny")');
      await rejectButton.click();

      // Fill rejection reason
      const reasonTextarea = page.locator('textarea[name="reason"], textarea[name="rejectionReason"]');
      if (await reasonTextarea.isVisible({ timeout: 2000 })) {
        await reasonTextarea.fill('Missing required documentation');

        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Submit")');
        await confirmButton.click();

        await page.waitForTimeout(waitFor.api);

        // Should show success message
        const successMessage = page.locator('text=/rejected|denied/i');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

test.describe('Vendor Status Updates', () => {
  test('should receive notification when approved', async ({ page }) => {
    // This test would require setting up notification system
    // Placeholder for future implementation
    test.skip();
  });

  test('should receive notification when rejected', async ({ page }) => {
    // This test would require setting up notification system
    // Placeholder for future implementation
    test.skip();
  });

  test('should allow resubmission after rejection', async ({ page }) => {
    // This test would require complex state setup
    // Placeholder for future implementation
    test.skip();
  });
});
