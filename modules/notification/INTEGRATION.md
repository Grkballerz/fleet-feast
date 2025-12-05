# Notification System Integration Guide

This document provides guidance for integrating the notification system into other services.

## Quick Start

```typescript
import {
  notifyBookingRequest,
  notifyBookingAccepted,
  notifyPaymentConfirmed,
  // ... other convenience functions
} from '@/modules/notification/notification.service';
```

## Convenience Functions

The notification service provides pre-built convenience functions for common notifications:

### Booking Notifications

```typescript
// When a customer creates a booking request (notify vendor)
await notifyBookingRequest({
  vendorId: booking.vendorId,
  customerId: booking.customerId,
  bookingId: booking.id,
  customerName: customer.email.split('@')[0],
  eventDate: format(booking.eventDate, 'MMMM d, yyyy'),
  eventTime: booking.eventTime,
  eventType: booking.eventType,
  location: booking.location,
  guestCount: booking.guestCount,
  totalAmount: booking.totalAmount.toString(),
});

// When a vendor accepts a booking (notify customer)
await notifyBookingAccepted({
  customerId: booking.customerId,
  bookingId: booking.id,
  vendorName: vendor.businessName,
  eventDate: format(booking.eventDate, 'MMMM d, yyyy'),
  eventTime: booking.eventTime,
  guestCount: booking.guestCount,
  totalAmount: booking.totalAmount.toString(),
});

// When a vendor declines a booking (notify customer)
await notifyBookingDeclined({
  customerId: booking.customerId,
  bookingId: booking.id,
  vendorName: vendor.businessName,
  eventDate: format(booking.eventDate, 'MMMM d, yyyy'),
});
```

### Payment Notifications

```typescript
// When payment is confirmed
await notifyPaymentConfirmed({
  userId: booking.customerId,
  bookingId: booking.id,
  eventDate: format(booking.eventDate, 'MMMM d, yyyy'),
  eventTime: booking.eventTime,
  vendorName: vendor.businessName,
  totalAmount: payment.amount.toString(),
});
```

### Messaging Notifications

```typescript
// When a new message is sent
await notifyNewMessage({
  recipientId: recipientUserId,
  bookingId: booking.id,
  senderName: sender.email.split('@')[0],
  messagePreview: message.content,
  eventDate: format(booking.eventDate, 'MMMM d, yyyy'),
});
```

### Scheduled Notifications

These should be called by cron jobs:

```typescript
// Event reminder (24 hours before event)
await notifyEventReminder({
  userId: booking.customerId,
  bookingId: booking.id,
  vendorName: vendor.businessName,
  eventDate: format(booking.eventDate, 'MMMM d, yyyy'),
  eventTime: booking.eventTime,
  location: booking.location,
  guestCount: booking.guestCount,
});

// Review prompt (7 days after event)
await notifyReviewPrompt({
  userId: booking.customerId,
  bookingId: booking.id,
  vendorName: vendor.businessName,
});
```

## Manual Notification Creation

For custom notifications, use the service directly:

```typescript
import { notificationService } from '@/modules/notification/notification.service';

await notificationService.createNotification({
  userId: 'user-id',
  type: 'BOOKING_REQUEST', // NotificationType enum
  title: 'Notification Title',
  message: 'Notification message text',
  link: '/path/to/resource',
  metadata: {
    // Any additional data for email template
    customField: 'value',
  },
});
```

## Integration Points

### 1. Booking Service

**File**: `modules/booking/booking.service.ts`

Add notifications to:
- `createBooking()` - notify vendor
- `acceptBooking()` - notify customer
- `declineBooking()` - notify customer
- `cancelBooking()` - notify both parties

### 2. Payment Service

**File**: `modules/payment/payment.service.ts`

Add notifications to:
- `capturePayment()` - notify both parties

### 3. Messaging Service

**File**: `modules/messaging/messaging.service.ts`

Add notifications to:
- `createMessage()` - notify recipient

### 4. Dispute Service

**File**: `modules/dispute/dispute.service.ts`

Add notifications to:
- `createDispute()` - notify both parties
- `resolveDispute()` - notify both parties

### 5. Violation Service

**File**: `modules/violation/violation.service.ts`

Add notifications to:
- `createViolation()` - notify user

## Cron Jobs Required

Create these scheduled jobs:

### 1. Event Reminders (Daily)

```typescript
// Run daily at 9:00 AM
// modules/cron/event-reminders.ts

import { prisma } from '@/lib/prisma';
import { notifyEventReminder } from '@/modules/notification/notification.service';

export async function sendEventReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const nextDay = new Date(tomorrow);
  nextDay.setDate(nextDay.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      status: 'CONFIRMED',
      eventDate: {
        gte: tomorrow,
        lt: nextDay,
      },
    },
    include: {
      customer: true,
      vendorProfile: true,
    },
  });

  for (const booking of bookings) {
    await notifyEventReminder({
      userId: booking.customerId,
      bookingId: booking.id,
      vendorName: booking.vendorProfile.businessName,
      eventDate: format(booking.eventDate, 'MMMM d, yyyy'),
      eventTime: booking.eventTime,
      location: booking.location,
      guestCount: booking.guestCount,
    });
  }
}
```

### 2. Review Prompts (Daily)

```typescript
// Run daily at 10:00 AM
// modules/cron/review-prompts.ts

import { prisma } from '@/lib/prisma';
import { notifyReviewPrompt } from '@/modules/notification/notification.service';

export async function sendReviewPrompts() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const eightDaysAgo = new Date(sevenDaysAgo);
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 1);

  const bookings = await prisma.booking.findMany({
    where: {
      status: 'COMPLETED',
      eventDate: {
        gte: eightDaysAgo,
        lt: sevenDaysAgo,
      },
      review: null, // No review submitted yet
    },
    include: {
      vendorProfile: true,
    },
  });

  for (const booking of bookings) {
    await notifyReviewPrompt({
      userId: booking.customerId,
      bookingId: booking.id,
      vendorName: booking.vendorProfile.businessName,
    });
  }
}
```

### 3. Notification Cleanup (Weekly)

```typescript
// Run weekly on Sunday at 2:00 AM
// modules/cron/notification-cleanup.ts

import { notificationService } from '@/modules/notification/notification.service';

export async function cleanupOldNotifications() {
  // Delete read notifications older than 90 days
  await notificationService.deleteOldNotifications(90);
}
```

## Environment Variables

Add to `.env`:

```bash
# SendGrid Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=notifications@fleetfeast.com
SENDGRID_FROM_NAME=Fleet Feast

# Application URL (for email links)
NEXT_PUBLIC_APP_URL=https://fleetfeast.com
```

## Testing Email Templates

During development (without SendGrid API key), emails are logged to console:

```
[EMAIL] Would send email (SendGrid not configured):
  To: user@example.com
  Subject: New Booking Request
  HTML: <!DOCTYPE html>...
```

## Error Handling

All notification functions are fire-and-forget. Email failures don't block the main operation:

```typescript
// This won't throw even if email fails
await notifyBookingRequest({ ... });

// Booking is created regardless of notification success
```

## User Preferences

Users can customize their notification preferences via:

```
GET /api/notifications/preferences
PUT /api/notifications/preferences
```

Preferences control email notifications only. In-app notifications are always created.
