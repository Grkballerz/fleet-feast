# Briefing: Fleet-Feast-tp2

**Generated**: 2025-12-20T00:55:00-05:00
**Agent**: Dana_Database
**Task ID**: Fleet-Feast-tp2
**Phase**: 1

---

## Task Details

**Title**: Add proposal notification types to NotificationType enum

**Objective**: Add new notification types for the proposal workflow.

---

## Acceptance Criteria

- [ ] All 5 new notification types added to NotificationType enum
- [ ] NotificationPreferences model updated for new types
- [ ] Schema validates: `npx prisma validate`

---

## New NotificationTypes to Add

Add these to the NotificationType enum (around line 100):

```prisma
// Proposal workflow notifications
INQUIRY_RECEIVED      // Vendor receives new inquiry
PROPOSAL_SENT         // Customer receives proposal
PROPOSAL_ACCEPTED     // Vendor notified of acceptance
PROPOSAL_EXPIRING     // Customer reminded proposal expires soon
PROPOSAL_EXPIRED      // Both parties notified of expiration
```

---

## NotificationPreferences Updates

Add corresponding email preference fields to NotificationPreferences model (around line 668):

```prisma
// Proposal notification preferences
emailInquiryReceived     Boolean @default(true) @map("email_inquiry_received")
emailProposalSent        Boolean @default(true) @map("email_proposal_sent")
emailProposalAccepted    Boolean @default(true) @map("email_proposal_accepted")
emailProposalExpiring    Boolean @default(true) @map("email_proposal_expiring")
emailProposalExpired     Boolean @default(true) @map("email_proposal_expired")
```

---

## Important Notes

1. Add comments to each new enum value
2. Keep existing notification types intact
3. DO NOT run migrations - just update schema

---

## Gap Checklist

- [ ] 5 notification types added with comments
- [ ] 5 preference fields added to NotificationPreferences
- [ ] `npx prisma validate` passes
