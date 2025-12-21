# Proposal Workflow Notifications

This document describes the notification system for the inquiry-proposal flow in Fleet Feast.

## Overview

The proposal workflow includes 5 notification types that are sent to customers and vendors at different stages of the booking process.

## Notification Types

### 1. INQUIRY_RECEIVED (Vendor)

**Trigger**: When customer submits a booking inquiry

**Recipients**: Vendor

**In-App Notification**:
- Title: "New Inquiry from Customer"
- Message: "{CustomerName} is interested in your services for {EventType} on {EventDate}"
- Link: `/vendor/bookings/{bookingId}`

**Email Subject**: "New Inquiry: {CustomerName} - {EventType}"

**Email Preference**: `emailInquiryReceived` (default: true)

**Usage**:
```typescript
import { notifyInquiryReceived } from '@/modules/notification/notification.service';

await notifyInquiryReceived({
  vendorId: string,
  bookingId: string,
  customerName: string,
  eventType: string,
  eventDate: string,
  guestCount?: number,
  location?: string,
});
```

---

### 2. PROPOSAL_SENT (Customer)

**Trigger**: When vendor sends a proposal to customer

**Recipients**: Customer

**In-App Notification**:
- Title: "New Proposal from {BusinessName}"
- Message: "{BusinessName} has sent you a proposal for ${ProposalAmount}"
- Link: `/customer/bookings/{bookingId}`

**Email Subject**: "New Proposal from {BusinessName} - ${ProposalAmount}"

**Email Preference**: `emailProposalSent` (default: true)

**Usage**:
```typescript
import { notifyProposalSent } from '@/modules/notification/notification.service';

await notifyProposalSent({
  customerId: string,
  bookingId: string,
  businessName: string,
  proposalAmount: string,
  eventType?: string,
  eventDate: string,
  expiresAt?: string,
});
```

---

### 3. PROPOSAL_ACCEPTED (Vendor)

**Trigger**: When customer accepts vendor's proposal

**Recipients**: Vendor

**In-App Notification**:
- Title: "Proposal Accepted!"
- Message: "Your proposal for {EventType} on {EventDate} was accepted"
- Link: `/vendor/bookings/{bookingId}`

**Email Subject**: "Proposal Accepted - {CustomerName}"

**Email Preference**: `emailProposalAccepted` (default: true)

**Usage**:
```typescript
import { notifyProposalAccepted } from '@/modules/notification/notification.service';

await notifyProposalAccepted({
  vendorId: string,
  bookingId: string,
  customerName: string,
  eventType: string,
  eventDate: string,
  proposalAmount: string,
});
```

---

### 4. PROPOSAL_EXPIRING (Customer)

**Trigger**: 24-48 hours before proposal expiration (via cron job)

**Recipients**: Customer

**In-App Notification**:
- Title: "Proposal Expiring Soon"
- Message: "Your proposal from {BusinessName} expires in {TimeLeft}"
- Link: `/customer/bookings/{bookingId}`

**Email Subject**: "Urgent: Proposal Expires in {TimeLeft} - {BusinessName}"

**Email Preference**: `emailProposalExpiring` (default: true)

**Automated by**: `/api/cron/check-expiring-proposals` (runs every 6 hours)

**Manual Usage**:
```typescript
import { notifyProposalExpiring } from '@/modules/notification/notification.service';

await notifyProposalExpiring({
  customerId: string,
  bookingId: string,
  businessName: string,
  eventType: string,
  eventDate: string,
  proposalAmount: string,
  timeLeft: string,
  expiresAt: string,
});
```

---

### 5. PROPOSAL_EXPIRED (Both)

**Trigger**: When proposal expires without acceptance (via cron job)

**Recipients**: Both customer and vendor

**In-App Notification**:
- Title: "Proposal Expired"
- Message: "The proposal for {EventType} has expired"
- Link: `/bookings/{bookingId}`

**Email Subject**: "Proposal Expired - {EventType}"

**Email Preference**: `emailProposalExpired` (default: true)

**Automated by**: `/api/cron/check-expiring-proposals` (runs every 6 hours)

**Manual Usage**:
```typescript
import { notifyProposalExpired } from '@/modules/notification/notification.service';

// For customer
await notifyProposalExpired({
  userId: customerId,
  bookingId: string,
  eventType: string,
  eventDate: string,
  businessName: string,
});

// For vendor
await notifyProposalExpired({
  userId: vendorId,
  bookingId: string,
  eventType: string,
  eventDate: string,
  customerName: string,
});
```

---

## Cron Job

### Check Expiring Proposals

**Endpoint**: `POST /api/cron/check-expiring-proposals`

**Schedule**: Every 6 hours (recommended)

**Authentication**: Requires `CRON_SECRET` in Authorization header

**What it does**:
1. Finds proposals expiring within 24-48 hours
2. Sends `PROPOSAL_EXPIRING` notifications to customers (once per booking)
3. Finds expired proposals (status: PROPOSAL_SENT, past expiry date)
4. Updates booking status to `EXPIRED`
5. Sends `PROPOSAL_EXPIRED` notifications to both parties

**Setup with Vercel Cron**:
```json
{
  "crons": [
    {
      "path": "/api/cron/check-expiring-proposals",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Manual Trigger**:
```bash
curl -X POST https://your-domain.com/api/cron/check-expiring-proposals \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Email Preferences

Users can control which proposal notifications they receive via their notification preferences:

```typescript
// Update preferences
await notificationService.updatePreferences(userId, {
  emailInquiryReceived: true,   // Vendor: New inquiry
  emailProposalSent: true,      // Customer: Proposal received
  emailProposalAccepted: true,  // Vendor: Proposal accepted
  emailProposalExpiring: true,  // Customer: Proposal expiring soon
  emailProposalExpired: true,   // Both: Proposal expired
});
```

**Default**: All proposal email notifications are enabled by default.

**Digest Mode**: When `emailDigest: true`, immediate emails are disabled in favor of a daily summary email.

---

## Email Templates

All proposal notification emails use the base Fleet Feast email template with:

- Orange branding (#F97316)
- Fleet Feast logo
- Responsive design
- Structured details sections
- Clear call-to-action buttons
- Footer with support links and notification settings

### Template Features

1. **INQUIRY_RECEIVED**: Highlights event details, encourages vendor to send proposal
2. **PROPOSAL_SENT**: Shows proposal amount prominently, includes expiry date
3. **PROPOSAL_ACCEPTED**: Celebratory tone with confetti emoji, confirms next steps
4. **PROPOSAL_EXPIRING**: Urgent styling, shows time remaining, encourages quick action
5. **PROPOSAL_EXPIRED**: Neutral tone, provides next steps for both parties

---

## Integration Points

### When to Call Notification Functions

1. **Booking Creation** (Customer submits inquiry):
   ```typescript
   // In booking creation endpoint
   await notifyInquiryReceived({...});
   ```

2. **Proposal Sent** (Vendor sends proposal):
   ```typescript
   // In proposal creation/update endpoint
   await notifyProposalSent({...});
   ```

3. **Proposal Accepted** (Customer accepts):
   ```typescript
   // In proposal acceptance endpoint
   await notifyProposalAccepted({...});
   ```

4. **Expiring/Expired** (Automated):
   - Handled automatically by cron job
   - No manual integration needed
   - Runs every 6 hours

---

## Testing

### Test Expiring Proposals Notification

```typescript
// Create a booking with proposal expiring in 30 hours
const booking = await prisma.booking.create({
  data: {
    status: 'PROPOSAL_SENT',
    proposalExpiresAt: new Date(Date.now() + 30 * 60 * 60 * 1000),
    proposalAmount: 500,
    // ... other fields
  },
});

// Wait 6 hours for cron job, or manually trigger:
// POST /api/cron/check-expiring-proposals
```

### Test Expired Proposal

```typescript
// Create a booking with expired proposal
const booking = await prisma.booking.create({
  data: {
    status: 'PROPOSAL_SENT',
    proposalExpiresAt: new Date(Date.now() - 1000), // 1 second ago
    proposalAmount: 500,
    // ... other fields
  },
});

// Trigger cron job immediately:
// POST /api/cron/check-expiring-proposals
```

---

## Files Modified/Created

### Modified Files
1. `modules/notification/notification.types.ts`
   - Added proposal fields to `EmailTemplateData`
   - Added proposal preferences to `NotificationPreferencesResponse`
   - Added proposal notification types to `EMAIL_PREFERENCE_MAP`

2. `modules/notification/email.service.ts`
   - Imported proposal template renderers
   - Added proposal renderers to `EMAIL_TEMPLATE_RENDERERS` map

3. `modules/notification/templates/email-templates.ts`
   - Added 5 new email template renderer functions

4. `modules/notification/notification.service.ts`
   - Added 5 new convenience functions for proposal notifications

### Created Files
1. `app/api/cron/check-expiring-proposals/route.ts`
   - Cron job for handling expiring and expired proposals

2. `docs/PROPOSAL_NOTIFICATIONS.md` (this file)
   - Complete documentation of proposal notification system

---

## Future Enhancements

1. **Digest Emails**: Implement daily digest functionality for batched notifications
2. **SMS Notifications**: Add SMS support for urgent proposal expirations
3. **Push Notifications**: Add web push notifications for real-time alerts
4. **Reminder Escalation**: Send multiple reminders at 48h, 24h, 12h, 6h intervals
5. **Custom Expiry Windows**: Allow vendors to set custom proposal expiry times
