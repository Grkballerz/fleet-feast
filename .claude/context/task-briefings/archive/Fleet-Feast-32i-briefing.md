# Task Briefing: Fleet-Feast-32i

**Generated**: 2025-12-05T04:00:00Z
**Agent**: Blake_Backend
**Task**: Dispute Resolution System
**Invocation**: 1

---

## Objective

Implement automated dispute rules with manual escalation, 7-day dispute window, fund holds during disputes, and resolution outcomes (full refund, partial refund, no refund).

## Acceptance Criteria

1. **Dispute Creation**
   - `POST /api/disputes` - Create dispute for booking
   - Only COMPLETED bookings within 7 days can be disputed
   - Types: NO_SHOW, LATE_ARRIVAL, SERVICE_QUALITY, OTHER
   - Auto-hold funds when dispute opened

2. **Dispute Status Flow**
   - OPENED → UNDER_REVIEW → RESOLVED
   - Alternative: OPENED → ESCALATED → RESOLVED

3. **Auto-Rules**
   - No-show: Full refund if vendor didn't arrive
   - Late arrival: Partial refund (30min+ = 25%, 1hr+ = 50%)
   - Service quality: Manual review required

4. **Resolution Outcomes**
   - Full refund to customer
   - Partial refund (configurable percentage)
   - No refund (vendor favor)
   - Release held funds appropriately

5. **Admin Endpoints**
   - `GET /api/admin/disputes` - List all disputes
   - `PUT /api/admin/disputes/:id` - Update dispute status
   - `POST /api/admin/disputes/:id/resolve` - Resolve dispute

## Technical Details

### File Structure
```
modules/dispute/
├── dispute.service.ts     # Business logic
├── dispute.validation.ts  # Zod schemas
├── dispute.types.ts       # TypeScript types
└── dispute.rules.ts       # Auto-resolution rules

app/api/disputes/
├── route.ts               # POST (create), GET (user's disputes)
└── [id]/route.ts          # GET, PUT (update)

app/api/admin/disputes/
├── route.ts               # GET (list all)
├── [id]/route.ts          # PUT (update status)
└── [id]/resolve/route.ts  # POST (resolve with outcome)
```

### Dispute Types
```typescript
enum DisputeType {
  NO_SHOW = 'NO_SHOW',
  LATE_ARRIVAL = 'LATE_ARRIVAL',
  SERVICE_QUALITY = 'SERVICE_QUALITY',
  WRONG_ORDER = 'WRONG_ORDER',
  FOOD_QUALITY = 'FOOD_QUALITY',
  OTHER = 'OTHER',
}

enum DisputeStatus {
  OPENED = 'OPENED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
}

enum ResolutionOutcome {
  FULL_REFUND = 'FULL_REFUND',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
  NO_REFUND = 'NO_REFUND',
  CANCELLED = 'CANCELLED',
}
```

### Auto-Resolution Rules
```typescript
const AUTO_RESOLUTION_RULES: Record<DisputeType, (dispute: Dispute) => ResolutionSuggestion> = {
  NO_SHOW: () => ({
    outcome: 'FULL_REFUND',
    refundPercent: 100,
    requiresManualReview: false,
    reason: 'Vendor no-show confirmed',
  }),

  LATE_ARRIVAL: (dispute) => {
    const lateMinutes = dispute.metadata?.lateMinutes || 0;
    if (lateMinutes >= 60) {
      return { outcome: 'PARTIAL_REFUND', refundPercent: 50, requiresManualReview: false };
    } else if (lateMinutes >= 30) {
      return { outcome: 'PARTIAL_REFUND', refundPercent: 25, requiresManualReview: false };
    }
    return { outcome: 'NO_REFUND', refundPercent: 0, requiresManualReview: true };
  },

  SERVICE_QUALITY: () => ({
    outcome: null,
    refundPercent: null,
    requiresManualReview: true,
    reason: 'Service quality disputes require manual review',
  }),

  // ... other types
};
```

### 7-Day Dispute Window
```typescript
function canCreateDispute(booking: Booking): boolean {
  if (booking.status !== 'COMPLETED') return false;

  const completedAt = booking.completedAt || booking.eventDate;
  const disputeDeadline = addDays(completedAt, 7);

  return new Date() <= disputeDeadline;
}
```

### Fund Hold During Dispute
```typescript
async function openDispute(data: CreateDisputeInput) {
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { payment: true },
  });

  // Update booking status to DISPUTED
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'DISPUTED' },
  });

  // Hold payment release
  if (booking.payment) {
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: {
        status: 'HELD',
        holdReason: 'DISPUTE',
      },
    });
  }

  // Create dispute record
  const dispute = await prisma.dispute.create({
    data: {
      bookingId: data.bookingId,
      filedById: data.userId,
      type: data.type,
      description: data.description,
      evidence: data.evidence,
      status: 'OPENED',
    },
  });

  return dispute;
}
```

### Resolution with Fund Release
```typescript
async function resolveDispute(
  disputeId: string,
  resolution: ResolveDisputeInput
) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { booking: { include: { payment: true } } },
  });

  // Process refund based on outcome
  if (resolution.outcome === 'FULL_REFUND') {
    await processRefund(dispute.booking.payment.id, 100);
  } else if (resolution.outcome === 'PARTIAL_REFUND') {
    await processRefund(dispute.booking.payment.id, resolution.refundPercent);
  } else if (resolution.outcome === 'NO_REFUND') {
    // Release funds to vendor
    await releasePayment(dispute.booking.payment.id);
  }

  // Update dispute
  await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: 'RESOLVED',
      outcome: resolution.outcome,
      refundPercent: resolution.refundPercent,
      resolutionNotes: resolution.notes,
      resolvedAt: new Date(),
      resolvedById: resolution.adminId,
    },
  });

  // Update booking status
  await prisma.booking.update({
    where: { id: dispute.bookingId },
    data: { status: resolution.outcome === 'FULL_REFUND' ? 'REFUNDED' : 'COMPLETED' },
  });
}
```

## Dependencies (Completed)

- Fleet-Feast-wu8: Booking System API ✓
- Fleet-Feast-5cl: Payment & Escrow System ✓

## PRD Reference

- **F13**: Dispute Resolution
- **Business Rules**: 7-day dispute window
- **Business Rules**: No-show and late arrival policies

## Gap Checklist

After completing the task, verify:
- [ ] Only COMPLETED bookings can be disputed
- [ ] 7-day window enforced
- [ ] Funds held during dispute
- [ ] Auto-rules apply for no-show/late arrival
- [ ] Manual review for service quality
- [ ] Admin can view and resolve disputes
- [ ] Refunds processed correctly
- [ ] Booking status updated appropriately

---

*Briefing generated by MASTER Orchestrator*
