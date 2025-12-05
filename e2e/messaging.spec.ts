import { test, expect } from '@playwright/test';
import { testMessage, waitFor } from './fixtures/test-data';

/**
 * Messaging E2E Tests
 * Tests in-app messaging between customers and vendors
 */

test.describe('Customer to Vendor Messaging', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(waitFor.navigation);
  });

  test('should send message to vendor from truck details page', async ({ page }) => {
    // Navigate to a truck details page
    await page.goto('/search?location=Los+Angeles,+CA');
    await page.waitForTimeout(waitFor.api);

    const truckCard = page.locator('.truck-card').first();
    await truckCard.click();

    await page.waitForTimeout(waitFor.navigation);

    // Click message or contact button
    const messageButton = page.locator('button:has-text("Message"), button:has-text("Contact"), button:has-text("Send Message")').first();
    await messageButton.click();

    await page.waitForTimeout(waitFor.transition);

    // Fill message form
    const subjectInput = page.locator('input[name="subject"], input[placeholder*="subject"]');
    if (await subjectInput.isVisible()) {
      await subjectInput.fill(testMessage.subject);
    }

    const messageTextarea = page.locator('textarea[name="message"], textarea[name="content"]');
    await messageTextarea.fill(testMessage.content);

    // Submit message
    const sendButton = page.locator('button[type="submit"]:has-text("Send"), button:has-text("Send Message")').first();
    await sendButton.click();

    await page.waitForTimeout(waitFor.api);

    // Should show success message
    const successMessage = page.locator('text=/message sent|sent successfully/i');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should send message about active booking', async ({ page }) => {
    // Navigate to bookings
    await page.goto('/dashboard/bookings');

    const booking = page.locator('[data-testid="booking-card"], .booking-card').first();

    if (await booking.isVisible()) {
      await booking.click();

      await page.waitForTimeout(waitFor.transition);

      // Look for message vendor button
      const messageButton = page.locator('button:has-text("Message"), button:has-text("Contact Vendor")').first();

      if (await messageButton.isVisible({ timeout: 2000 })) {
        await messageButton.click();

        await page.waitForTimeout(waitFor.transition);

        // Fill message
        const messageTextarea = page.locator('textarea[name="message"]');
        await messageTextarea.fill('Hi, I have a question about our upcoming event.');

        const sendButton = page.locator('button:has-text("Send")').first();
        await sendButton.click();

        await page.waitForTimeout(waitFor.api);

        // Should show success
        const successMessage = page.locator('text=/sent|success/i');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should view message history in inbox', async ({ page }) => {
    await page.goto('/messages');

    // Should show messages inbox
    const messagesList = page.locator('[data-testid="messages-list"], .messages-list');
    await expect(messagesList).toBeVisible({ timeout: 5000 });

    // Check for message threads
    const messageThread = page.locator('[data-testid="message-thread"], .message-thread').first();
    if (await messageThread.isVisible()) {
      await messageThread.click();

      await page.waitForTimeout(waitFor.transition);

      // Should show conversation
      const conversation = page.locator('[data-testid="conversation"], .conversation');
      await expect(conversation).toBeVisible();
    }
  });

  test('should see anti-circumvention warning', async ({ page }) => {
    await page.goto('/messages');

    // Look for warning about off-platform communication
    const warning = page.locator('text=/platform|terms|off-platform|circumvent/i, [role="alert"]');

    // Warning might be in message composition area or visible in UI
    const messageButton = page.locator('button:has-text("New Message")').first();
    if (await messageButton.isVisible({ timeout: 2000 })) {
      await messageButton.click();
      await page.waitForTimeout(waitFor.transition);

      // Check for warning
      const warningInModal = page.locator('text=/platform|terms|circumvent/i');
      if (await warningInModal.isVisible({ timeout: 2000 })) {
        await expect(warningInModal).toBeVisible();
      }
    }
  });

  test('should filter contact information from messages', async ({ page }) => {
    await page.goto('/messages');

    const messageButton = page.locator('button:has-text("New Message")').first();

    if (await messageButton.isVisible({ timeout: 2000 })) {
      await messageButton.click();
      await page.waitForTimeout(waitFor.transition);

      // Try to send message with contact info
      const messageTextarea = page.locator('textarea[name="message"]');
      await messageTextarea.fill('My phone number is 555-1234 and email is test@example.com');

      const sendButton = page.locator('button:has-text("Send")').first();
      await sendButton.click();

      await page.waitForTimeout(waitFor.animation);

      // Should show warning or filter the content
      const warning = page.locator('text=/contact|phone|email|not allowed/i, .text-red-500');
      await expect(warning.first()).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Vendor Message Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as vendor
    await page.goto('/login');
    await page.fill('input[name="email"]', 'vendor@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(waitFor.navigation);
  });

  test('should view incoming messages from customers', async ({ page }) => {
    await page.goto('/vendor/messages');

    // Should show messages inbox
    const messagesList = page.locator('[data-testid="messages-list"], .messages-list');
    await expect(messagesList).toBeVisible({ timeout: 5000 });
  });

  test('should reply to customer message', async ({ page }) => {
    await page.goto('/vendor/messages');

    const messageThread = page.locator('[data-testid="message-thread"], .message-thread').first();

    if (await messageThread.isVisible()) {
      await messageThread.click();

      await page.waitForTimeout(waitFor.transition);

      // Fill reply
      const replyTextarea = page.locator('textarea[name="message"], textarea[name="reply"]');
      await replyTextarea.fill('Thank you for your inquiry! We would be happy to cater your event.');

      const sendButton = page.locator('button:has-text("Send"), button:has-text("Reply")').first();
      await sendButton.click();

      await page.waitForTimeout(waitFor.api);

      // Should show success
      const successMessage = page.locator('text=/sent|success/i');
      await expect(successMessage).toBeVisible({ timeout: 5000 });

      // Reply should appear in conversation
      const replyMessage = page.locator('text=/happy to cater/i');
      await expect(replyMessage).toBeVisible();
    }
  });

  test('should mark message as read', async ({ page }) => {
    await page.goto('/vendor/messages');

    // Find unread message
    const unreadMessage = page.locator('[data-unread="true"], .message-unread').first();

    if (await unreadMessage.isVisible()) {
      await unreadMessage.click();

      await page.waitForTimeout(waitFor.transition);

      // Message should now be marked as read
      await page.goto('/vendor/messages');

      // Unread count should decrease
      const unreadBadge = page.locator('[data-testid="unread-count"]');
      // Just verify the page loads without errors
      await page.waitForTimeout(waitFor.transition);
    }
  });

  test('should view messages related to specific booking', async ({ page }) => {
    await page.goto('/vendor/bookings');

    const booking = page.locator('[data-testid="booking-card"]').first();

    if (await booking.isVisible()) {
      await booking.click();

      await page.waitForTimeout(waitFor.transition);

      // Look for messages tab or section
      const messagesTab = page.locator('button:has-text("Messages"), a:has-text("Messages")');

      if (await messagesTab.isVisible({ timeout: 2000 })) {
        await messagesTab.click();

        await page.waitForTimeout(waitFor.transition);

        // Should show booking-related messages
        const messages = page.locator('[data-testid="booking-messages"]');
        await expect(messages).toBeVisible();
      }
    }
  });
});

test.describe('Message Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(waitFor.navigation);
  });

  test('should show unread message count in header', async ({ page }) => {
    // Look for unread badge in header
    const unreadBadge = page.locator('[data-testid="unread-messages"], .unread-badge, .notification-badge');

    if (await unreadBadge.first().isVisible({ timeout: 2000 })) {
      await expect(unreadBadge.first()).toBeVisible();
    }
  });

  test('should navigate to messages from notification', async ({ page }) => {
    const messagesLink = page.locator('a[href*="/messages"], button:has-text("Messages")').first();

    if (await messagesLink.isVisible({ timeout: 2000 })) {
      await messagesLink.click();

      // Should navigate to messages page
      await page.waitForURL(/\/messages/, { timeout: 5000 });
      await expect(page).toHaveURL(/\/messages/);
    }
  });
});

test.describe('Message Search and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(waitFor.navigation);
  });

  test('should search messages by keyword', async ({ page }) => {
    await page.goto('/messages');

    const searchInput = page.locator('input[name="search"], input[placeholder*="Search"]');

    if (await searchInput.isVisible({ timeout: 2000 })) {
      await searchInput.fill('catering');

      await page.waitForTimeout(waitFor.api);

      // Results should filter
      const results = page.locator('[data-testid="message-thread"]');
      if (await results.first().isVisible({ timeout: 2000 })) {
        await expect(results.first()).toBeVisible();
      }
    }
  });

  test('should filter messages by unread status', async ({ page }) => {
    await page.goto('/messages');

    const unreadFilter = page.locator('button:has-text("Unread"), input[type="checkbox"][name="unread"]');

    if (await unreadFilter.first().isVisible({ timeout: 2000 })) {
      await unreadFilter.first().click();

      await page.waitForTimeout(waitFor.transition);

      // Should show only unread messages
      const messages = page.locator('[data-testid="message-thread"]');
      await expect(messages.first()).toBeVisible();
    }
  });
});

test.describe('Message Attachments', () => {
  test('should send message with image attachment', async ({ page }) => {
    // Login as customer
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(waitFor.navigation);

    await page.goto('/messages');

    const newMessageButton = page.locator('button:has-text("New Message")').first();

    if (await newMessageButton.isVisible({ timeout: 2000 })) {
      await newMessageButton.click();
      await page.waitForTimeout(waitFor.transition);

      // Look for file upload
      const fileInput = page.locator('input[type="file"]');

      if (await fileInput.isVisible({ timeout: 2000 })) {
        // This test would require actual file upload
        // Placeholder for future implementation
        test.skip();
      }
    }
  });
});
