import { test, expect } from '@playwright/test';
import { generateTestCustomer, generateTestVendor, waitFor } from './fixtures/test-data';

/**
 * Authentication E2E Tests
 * Tests user registration, login, and password reset flows
 */

test.describe('Customer Authentication', () => {
  test('should register new customer successfully', async ({ page }) => {
    const customer = generateTestCustomer();

    await page.goto('/register');

    // Wait for page to load
    await expect(page.locator('h1')).toContainText(/register|sign up/i);

    // Fill registration form
    await page.fill('input[name="email"]', customer.email);
    await page.fill('input[name="password"]', customer.password);
    await page.fill('input[name="confirmPassword"]', customer.password);
    await page.fill('input[name="name"]', customer.name);

    // Select customer role
    const customerRadio = page.locator('input[type="radio"][value="CUSTOMER"]');
    if (await customerRadio.isVisible()) {
      await customerRadio.click();
    }

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL(/\/(dashboard|profile|home)/, { timeout: 10000 });

    // Verify successful registration
    await expect(page).toHaveURL(/\/(dashboard|profile|home)/);
  });

  test('should login existing customer', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toContainText(/login|sign in/i);

    // Fill login form
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL(/\//, { timeout: 10000 });

    // Verify logged in state (check for user menu or profile link)
    const userMenu = page.locator('[data-testid="user-menu"], [aria-label*="user"], .user-menu');
    await expect(userMenu).toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation messages
    const errorMessages = page.locator('.text-red-500, .text-destructive, [role="alert"]');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    const customer = generateTestCustomer();

    await page.goto('/register');

    await page.fill('input[name="email"]', customer.email);
    await page.fill('input[name="password"]', 'weak');

    // Blur to trigger validation
    await page.fill('input[name="name"]', customer.name);

    // Check for password strength indicator or error
    const passwordError = page.locator('text=/password.*strong|password.*requirements/i');
    await expect(passwordError).toBeVisible({ timeout: 2000 });
  });

  test('should handle duplicate email registration', async ({ page }) => {
    await page.goto('/register');

    // Try to register with existing email
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    await page.fill('input[name="name"]', 'Test User');

    await page.click('button[type="submit"]');

    // Should show error message
    const errorMessage = page.locator('text=/already exists|already registered/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(waitFor.navigation);

    // Find and click logout
    const userMenu = page.locator('[data-testid="user-menu"], [aria-label*="user"]').first();
    await userMenu.click();

    const logoutButton = page.locator('text=/logout|sign out/i');
    await logoutButton.click();

    // Should redirect to login or home
    await page.waitForURL(/\/(login|$)/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/(login|$)/);
  });
});

test.describe('Vendor Authentication', () => {
  test('should register new vendor successfully', async ({ page }) => {
    const vendor = generateTestVendor();

    await page.goto('/register');

    await expect(page.locator('h1')).toContainText(/register|sign up/i);

    // Fill vendor registration form
    await page.fill('input[name="email"]', vendor.email);
    await page.fill('input[name="password"]', vendor.password);
    await page.fill('input[name="confirmPassword"]', vendor.password);
    await page.fill('input[name="name"]', vendor.name);

    // Select vendor role
    const vendorRadio = page.locator('input[type="radio"][value="VENDOR"]');
    await vendorRadio.click();

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to vendor onboarding or dashboard
    await page.waitForURL(/\/(vendor|onboarding|dashboard)/, { timeout: 10000 });
  });

  test('should login existing vendor', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'vendor@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');

    await page.click('button[type="submit"]');

    // Vendors should see vendor-specific dashboard
    await page.waitForURL(/\//, { timeout: 10000 });

    // Check for vendor-specific elements
    const vendorIndicator = page.locator('text=/vendor dashboard|my trucks|bookings/i').first();
    await expect(vendorIndicator).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Password Reset', () => {
  test('should request password reset', async ({ page }) => {
    await page.goto('/forgot-password');

    await expect(page.locator('h1')).toContainText(/forgot password|reset password/i);

    // Enter email
    await page.fill('input[name="email"]', 'customer@test.com');

    // Submit
    await page.click('button[type="submit"]');

    // Should show success message
    const successMessage = page.locator('text=/email sent|check your email/i');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should handle invalid email for password reset', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    // Should show validation error
    const errorMessage = page.locator('.text-red-500, .text-destructive');
    await expect(errorMessage.first()).toBeVisible();
  });
});

test.describe('Session Management', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('should persist session after page refresh', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(waitFor.navigation);

    // Refresh page
    await page.reload();

    await page.waitForTimeout(waitFor.transition);

    // Should still be logged in
    const userMenu = page.locator('[data-testid="user-menu"], [aria-label*="user"]').first();
    await expect(userMenu).toBeVisible();
  });
});
