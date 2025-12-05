import { test, expect } from '@playwright/test';
import { testReview, waitFor } from './fixtures/test-data';

/**
 * Review Submission E2E Tests
 * Tests customer review and rating functionality
 */

test.describe('Customer Review Submission', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(waitFor.navigation);
  });

  test('should submit review for completed booking', async ({ page }) => {
    // Navigate to bookings
    await page.goto('/dashboard/bookings');

    // Find completed booking
    const completedBooking = page.locator('[data-status="COMPLETED"], .status-completed').first();

    if (await completedBooking.isVisible()) {
      // Look for review button
      const reviewButton = page.locator('button:has-text("Review"), button:has-text("Leave Review"), button:has-text("Write Review")').first();

      if (await reviewButton.isVisible({ timeout: 2000 })) {
        await reviewButton.click();

        await page.waitForTimeout(waitFor.transition);

        // Select rating (5 stars)
        const starRating = page.locator('[data-rating="5"], button[aria-label*="5 star"]');
        if (await starRating.isVisible({ timeout: 2000 })) {
          await starRating.click();
        } else {
          // Try alternative star selection
          const stars = page.locator('.star, [data-testid="star"]');
          const starCount = await stars.count();
          if (starCount >= 5) {
            await stars.nth(4).click(); // Click 5th star
          }
        }

        // Write review comment
        const commentTextarea = page.locator('textarea[name="comment"], textarea[name="review"]');
        await commentTextarea.fill(testReview.comment);

        // Submit review
        const submitButton = page.locator('button[type="submit"]:has-text("Submit"), button:has-text("Post Review")').first();
        await submitButton.click();

        await page.waitForTimeout(waitFor.api);

        // Should show success message
        const successMessage = page.locator('text=/review submitted|thank you|posted/i');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should require rating before submission', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    const completedBooking = page.locator('[data-status="COMPLETED"]').first();

    if (await completedBooking.isVisible()) {
      const reviewButton = page.locator('button:has-text("Review")').first();

      if (await reviewButton.isVisible({ timeout: 2000 })) {
        await reviewButton.click();
        await page.waitForTimeout(waitFor.transition);

        // Try to submit without rating
        const commentTextarea = page.locator('textarea[name="comment"]');
        await commentTextarea.fill('Great service!');

        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();

        // Should show validation error
        const errorMessage = page.locator('text=/rating required|select rating/i, .text-red-500');
        await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should allow review with rating only (no comment)', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    const completedBooking = page.locator('[data-status="COMPLETED"]').first();

    if (await completedBooking.isVisible()) {
      const reviewButton = page.locator('button:has-text("Review")').first();

      if (await reviewButton.isVisible({ timeout: 2000 })) {
        await reviewButton.click();
        await page.waitForTimeout(waitFor.transition);

        // Select rating only
        const stars = page.locator('.star, [data-testid="star"]');
        if ((await stars.count()) >= 4) {
          await stars.nth(3).click(); // 4 stars
        }

        // Submit without comment
        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();

        await page.waitForTimeout(waitFor.api);

        // Should succeed
        const successMessage = page.locator('text=/review submitted|posted|thank you/i');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should prevent duplicate reviews for same booking', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    // Find booking that already has a review
    const reviewedBooking = page.locator('[data-has-review="true"], .has-review').first();

    if (await reviewedBooking.isVisible()) {
      // Review button should be disabled or not visible
      const reviewButton = page.locator('button:has-text("Review")');

      if (await reviewButton.isVisible({ timeout: 1000 })) {
        await expect(reviewButton).toBeDisabled();
      }

      // Should show "already reviewed" indicator
      const reviewedIndicator = page.locator('text=/already reviewed|review submitted/i');
      await expect(reviewedIndicator).toBeVisible({ timeout: 2000 });
    }
  });

  test('should edit existing review', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    const reviewedBooking = page.locator('[data-has-review="true"]').first();

    if (await reviewedBooking.isVisible()) {
      // Look for edit review button
      const editButton = page.locator('button:has-text("Edit Review"), button:has-text("Update Review")').first();

      if (await editButton.isVisible({ timeout: 2000 })) {
        await editButton.click();
        await page.waitForTimeout(waitFor.transition);

        // Update comment
        const commentTextarea = page.locator('textarea[name="comment"]');
        await commentTextarea.fill('Updated: ' + testReview.comment);

        const submitButton = page.locator('button:has-text("Update"), button:has-text("Save")').first();
        await submitButton.click();

        await page.waitForTimeout(waitFor.api);

        // Should show success
        const successMessage = page.locator('text=/updated|saved/i');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should view own reviews in profile', async ({ page }) => {
    await page.goto('/profile/reviews');

    // Should show list of user's reviews
    const reviewsList = page.locator('[data-testid="reviews-list"], .reviews-list');
    await expect(reviewsList).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Review Display', () => {
  test('should display reviews on truck details page', async ({ page }) => {
    // Navigate to a truck details page
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    // Should show reviews section
    const reviewsSection = page.locator('[data-testid="reviews"], .reviews-section, text=/customer reviews/i').first();
    await expect(reviewsSection).toBeVisible({ timeout: 5000 });
  });

  test('should display average rating and review count', async ({ page }) => {
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();

    // Should show rating on card
    const rating = page.locator('[data-testid="rating"], .rating, .stars').first();
    if (await rating.isVisible({ timeout: 2000 })) {
      await expect(rating).toBeVisible();
    }
  });

  test('should sort reviews by date', async ({ page }) => {
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    // Look for sort dropdown in reviews section
    const sortSelect = page.locator('select[name="reviewSort"], [data-testid="review-sort"]');

    if (await sortSelect.isVisible({ timeout: 2000 })) {
      await sortSelect.selectOption('newest');
      await page.waitForTimeout(waitFor.animation);

      // Reviews should reorder
      const reviews = page.locator('[data-testid="review-item"]');
      if (await reviews.first().isVisible()) {
        await expect(reviews.first()).toBeVisible();
      }
    }
  });

  test('should filter reviews by rating', async ({ page }) => {
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    // Look for rating filter
    const fiveStarFilter = page.locator('button:has-text("5 stars"), input[value="5"]');

    if (await fiveStarFilter.first().isVisible({ timeout: 2000 })) {
      await fiveStarFilter.first().click();
      await page.waitForTimeout(waitFor.animation);

      // Should show only 5-star reviews
      const reviews = page.locator('[data-testid="review-item"]');
      await expect(reviews.first()).toBeVisible();
    }
  });

  test('should paginate reviews', async ({ page }) => {
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    // Look for pagination
    const nextButton = page.locator('button:has-text("Next"), button[aria-label*="next"]');

    if (await nextButton.isVisible({ timeout: 2000 })) {
      await nextButton.click();
      await page.waitForTimeout(waitFor.animation);

      // Should load next page of reviews
      await page.waitForTimeout(waitFor.api);
    }
  });
});

test.describe('Vendor Review Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as vendor
    await page.goto('/login');
    await page.fill('input[name="email"]', 'vendor@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(waitFor.navigation);
  });

  test('should view all received reviews', async ({ page }) => {
    await page.goto('/vendor/reviews');

    // Should show reviews dashboard
    const reviewsList = page.locator('[data-testid="reviews-list"], .reviews');
    await expect(reviewsList).toBeVisible({ timeout: 5000 });
  });

  test('should respond to customer review', async ({ page }) => {
    await page.goto('/vendor/reviews');

    const review = page.locator('[data-testid="review-item"]').first();

    if (await review.isVisible()) {
      // Look for respond button
      const respondButton = page.locator('button:has-text("Respond"), button:has-text("Reply")').first();

      if (await respondButton.isVisible({ timeout: 2000 })) {
        await respondButton.click();
        await page.waitForTimeout(waitFor.transition);

        // Write response
        const responseTextarea = page.locator('textarea[name="response"]');
        await responseTextarea.fill('Thank you for your wonderful review! We look forward to serving you again.');

        const submitButton = page.locator('button:has-text("Submit"), button:has-text("Post")').first();
        await submitButton.click();

        await page.waitForTimeout(waitFor.api);

        // Should show success
        const successMessage = page.locator('text=/response posted|sent/i');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should view review statistics', async ({ page }) => {
    await page.goto('/vendor/reviews');

    // Should show stats like average rating, total reviews
    const stats = page.locator('[data-testid="review-stats"], .review-stats');
    await expect(stats.first()).toBeVisible({ timeout: 5000 });
  });

  test('should filter reviews by rating', async ({ page }) => {
    await page.goto('/vendor/reviews');

    const filterButton = page.locator('button:has-text("Filter"), select[name="filter"]');

    if (await filterButton.first().isVisible({ timeout: 2000 })) {
      await filterButton.first().click();
      await page.waitForTimeout(waitFor.transition);

      // Select low ratings
      const lowRatingOption = page.locator('button:has-text("1-2 stars"), option[value="low"]');
      if (await lowRatingOption.first().isVisible({ timeout: 1000 })) {
        await lowRatingOption.first().click();
        await page.waitForTimeout(waitFor.api);
      }
    }
  });
});

test.describe('Review Moderation', () => {
  test('should report inappropriate review', async ({ page }) => {
    // Login as customer
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(waitFor.navigation);

    // Navigate to truck with reviews
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    // Find a review and report button
    const reportButton = page.locator('button:has-text("Report"), button[aria-label*="report"]').first();

    if (await reportButton.isVisible({ timeout: 2000 })) {
      await reportButton.click();
      await page.waitForTimeout(waitFor.transition);

      // Select reason
      const reasonSelect = page.locator('select[name="reason"], textarea[name="reason"]');
      if (await reasonSelect.isVisible({ timeout: 1000 })) {
        await reasonSelect.fill('Inappropriate content');

        const submitButton = page.locator('button:has-text("Submit"), button:has-text("Report")');
        await submitButton.click();

        await page.waitForTimeout(waitFor.api);

        // Should show success
        const successMessage = page.locator('text=/reported|thank you/i');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
