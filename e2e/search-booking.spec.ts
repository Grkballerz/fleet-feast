import { test, expect } from '@playwright/test';
import { generateTestBooking, waitFor } from './fixtures/test-data';

/**
 * Search and Booking E2E Tests
 * Tests the complete search to booking workflow
 */

test.describe('Food Truck Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should search food trucks by location', async ({ page }) => {
    // Navigate to search page
    const searchLink = page.locator('a:has-text("Search"), a:has-text("Find Trucks")');
    if (await searchLink.isVisible()) {
      await searchLink.click();
    } else {
      await page.goto('/search');
    }

    // Enter location
    await page.fill('input[name="location"], input[placeholder*="location"]', 'Los Angeles, CA');

    // Click search
    const searchButton = page.locator('button:has-text("Search")').first();
    await searchButton.click();

    await page.waitForTimeout(waitFor.api);

    // Should show search results
    const results = page.locator('[data-testid="search-results"], .search-results, .truck-card');
    await expect(results.first()).toBeVisible({ timeout: 5000 });
  });

  test('should filter by cuisine type', async ({ page }) => {
    await page.goto('/search?location=Los+Angeles,+CA');

    await page.waitForTimeout(waitFor.api);

    // Open cuisine filter
    const cuisineFilter = page.locator('button:has-text("Cuisine"), [data-filter="cuisine"]');
    if (await cuisineFilter.isVisible()) {
      await cuisineFilter.click();

      // Select a cuisine type
      const americanCheckbox = page.locator('input[type="checkbox"][value="AMERICAN"], label:has-text("American")');
      await americanCheckbox.first().click();

      await page.waitForTimeout(waitFor.api);

      // Results should update
      const results = page.locator('.truck-card');
      await expect(results.first()).toBeVisible();
    }
  });

  test('should filter by price range', async ({ page }) => {
    await page.goto('/search?location=Los+Angeles,+CA');

    await page.waitForTimeout(waitFor.api);

    // Find price range slider or inputs
    const minPriceInput = page.locator('input[name="minPrice"], input[aria-label*="minimum"]');
    if (await minPriceInput.isVisible()) {
      await minPriceInput.fill('500');

      const maxPriceInput = page.locator('input[name="maxPrice"], input[aria-label*="maximum"]');
      await maxPriceInput.fill('2000');

      await page.waitForTimeout(waitFor.api);

      // Results should filter
      const results = page.locator('.truck-card');
      await expect(results.first()).toBeVisible();
    }
  });

  test('should sort search results', async ({ page }) => {
    await page.goto('/search?location=Los+Angeles,+CA');

    await page.waitForTimeout(waitFor.api);

    // Find sort dropdown
    const sortSelect = page.locator('select[name="sort"], [data-testid="sort-select"]');
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption('price-asc');

      await page.waitForTimeout(waitFor.api);

      // Results should re-order
      const results = page.locator('.truck-card');
      await expect(results.first()).toBeVisible();
    }
  });

  test('should show no results message when no trucks match', async ({ page }) => {
    await page.goto('/search?location=Antarctica');

    await page.waitForTimeout(waitFor.api);

    // Should show no results message
    const noResults = page.locator('text=/no trucks found|no results/i');
    await expect(noResults).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Food Truck Details', () => {
  test('should view truck details page', async ({ page }) => {
    await page.goto('/search?location=Los+Angeles,+CA');

    await page.waitForTimeout(waitFor.api);

    // Click on first truck card
    const truckCard = page.locator('.truck-card, [data-testid="truck-card"]').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    // Should navigate to truck details
    await expect(page).toHaveURL(/\/trucks\/|\/vendor\//);

    // Should show truck information
    const truckName = page.locator('h1');
    await expect(truckName).toBeVisible();
  });

  test('should view truck photos gallery', async ({ page }) => {
    // Navigate to a truck details page
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    // Look for photo gallery
    const gallery = page.locator('[data-testid="photo-gallery"], .gallery, .photos');
    if (await gallery.isVisible()) {
      // Click to open lightbox/modal
      const photo = page.locator('.gallery img, .photo').first();
      await photo.click();

      // Should show enlarged view
      const modal = page.locator('[role="dialog"], .modal, .lightbox');
      await expect(modal).toBeVisible({ timeout: 2000 });
    }
  });

  test('should view truck reviews and ratings', async ({ page }) => {
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    // Look for reviews section
    const reviewsSection = page.locator('[data-testid="reviews"], .reviews, text=/reviews/i').first();
    await expect(reviewsSection).toBeVisible({ timeout: 5000 });
  });

  test('should show truck availability calendar', async ({ page }) => {
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    // Look for calendar or availability indicator
    const calendar = page.locator('[data-testid="calendar"], .calendar, input[type="date"]');
    await expect(calendar.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Booking Request Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(waitFor.navigation);
  });

  test('should submit booking request', async ({ page }) => {
    const booking = generateTestBooking();

    // Go to search and select a truck
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    // Click book now button
    const bookButton = page.locator('button:has-text("Book"), button:has-text("Request Booking")').first();
    await bookButton.click();

    await page.waitForTimeout(waitFor.transition);

    // Fill booking form
    await page.fill('input[name="eventDate"], input[type="date"]', booking.eventDate);
    await page.fill('input[name="guestCount"]', booking.guestCount.toString());

    // Select event type
    const eventTypeSelect = page.locator('select[name="eventType"]');
    if (await eventTypeSelect.isVisible()) {
      await eventTypeSelect.selectOption(booking.eventType);
    }

    // Fill event details
    const specialRequests = page.locator('textarea[name="specialRequests"]');
    if (await specialRequests.isVisible()) {
      await specialRequests.fill(booking.specialRequests);
    }

    // Submit booking request
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    await page.waitForTimeout(waitFor.api);

    // Should show success message
    const successMessage = page.locator('text=/request sent|booking submitted|success/i');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should validate booking date is in future', async ({ page }) => {
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    const bookButton = page.locator('button:has-text("Book")').first();
    await bookButton.click();

    await page.waitForTimeout(waitFor.transition);

    // Try to book a past date
    const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.fill('input[name="eventDate"], input[type="date"]', pastDate);

    await page.click('button[type="submit"]');

    // Should show validation error
    const errorMessage = page.locator('text=/future date|date must be/i, .text-red-500');
    await expect(errorMessage.first()).toBeVisible({ timeout: 2000 });
  });

  test('should require guest count within limits', async ({ page }) => {
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    const bookButton = page.locator('button:has-text("Book")').first();
    await bookButton.click();

    await page.waitForTimeout(waitFor.transition);

    // Try invalid guest count
    const guestCountInput = page.locator('input[name="guestCount"]');
    await guestCountInput.fill('0');

    await page.click('button[type="submit"]');

    // Should show validation error
    const errorMessage = page.locator('.text-red-500, [role="alert"]');
    await expect(errorMessage.first()).toBeVisible();
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    // Logout first
    const userMenu = page.locator('[data-testid="user-menu"]').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
      const logoutButton = page.locator('text=/logout/i');
      await logoutButton.click();
      await page.waitForTimeout(waitFor.navigation);
    }

    // Try to book
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    const bookButton = page.locator('button:has-text("Book")').first();
    await bookButton.click();

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Booking Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(waitFor.navigation);
  });

  test('should view booking history', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    // Should show bookings list
    const bookingsList = page.locator('[data-testid="bookings-list"], .bookings');
    await expect(bookingsList).toBeVisible({ timeout: 5000 });
  });

  test('should cancel pending booking', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    // Find a pending booking
    const pendingBooking = page.locator('[data-status="PENDING"]').first();

    if (await pendingBooking.isVisible()) {
      // Click cancel button
      const cancelButton = page.locator('button:has-text("Cancel")').first();
      await cancelButton.click();

      // Confirm cancellation
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      if (await confirmButton.isVisible({ timeout: 1000 })) {
        await confirmButton.click();
      }

      await page.waitForTimeout(waitFor.api);

      // Should show success message
      const successMessage = page.locator('text=/cancelled|canceled/i');
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
  });
});
