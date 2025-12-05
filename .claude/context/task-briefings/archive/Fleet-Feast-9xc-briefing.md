# Task Briefing: Fleet-Feast-9xc

**Generated**: 2025-12-05T04:00:00Z
**Agent**: Blake_Backend
**Task**: Violation & Penalty System
**Invocation**: 1

---

## Objective

Implement violation tracking with progressive penalties: warning → 30-day suspension → permanent ban. Track circumvention violations from messaging and apply penalties to both customers and vendors.

## Acceptance Criteria

1. **Violation Tracking**
   - `POST /api/violations` - Log violation (admin or automated)
   - `GET /api/violations/user/:userId` - Get user's violations
   - Track source (messaging, dispute, manual report)

2. **Violation Types**
   - CIRCUMVENTION_ATTEMPT (from messaging flags)
   - NO_SHOW_VENDOR
   - NO_SHOW_CUSTOMER
   - LATE_CANCELLATION
   - ABUSE_REPORT
   - FRAUD_SUSPECTED

3. **Penalty Progression**
   - 1st violation: Warning (email notification)
   - 2nd violation: 7-day restriction
   - 3rd violation: 30-day suspension
   - 4th+ violation: Permanent ban

4. **Account Status Effects**
   - Warning: Can continue using platform
   - Restricted: Can't create new bookings
   - Suspended: Account inaccessible
   - Banned: Permanent account closure

5. **Admin Management**
   - `GET /api/admin/violations` - List all violations
   - `POST /api/admin/violations/:id/appeal` - Handle appeal
   - `PUT /api/admin/users/:id/status` - Manual status change

## Technical Details

### File Structure
```
modules/violation/
├── violation.service.ts   # Business logic
├── violation.validation.ts
├── violation.types.ts
└── penalty.rules.ts       # Penalty progression

app/api/violations/
├── route.ts               # POST (create)
└── user/[userId]/route.ts # GET user violations

app/api/admin/violations/
├── route.ts               # GET (list all)
└── [id]/
    ├── route.ts           # GET, PUT
    └── appeal/route.ts    # POST (handle appeal)

app/api/admin/users/[id]/status/route.ts  # PUT (change status)
```

### Violation Types & Severity
```typescript
enum ViolationType {
  CIRCUMVENTION_ATTEMPT = 'CIRCUMVENTION_ATTEMPT',
  REPEATED_CIRCUMVENTION = 'REPEATED_CIRCUMVENTION',
  NO_SHOW_VENDOR = 'NO_SHOW_VENDOR',
  NO_SHOW_CUSTOMER = 'NO_SHOW_CUSTOMER',
  LATE_CANCELLATION = 'LATE_CANCELLATION',
  ABUSE_REPORT = 'ABUSE_REPORT',
  FRAUD_SUSPECTED = 'FRAUD_SUSPECTED',
  HARASSMENT = 'HARASSMENT',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
}

const VIOLATION_SEVERITY: Record<ViolationType, number> = {
  CIRCUMVENTION_ATTEMPT: 1,
  REPEATED_CIRCUMVENTION: 3,
  NO_SHOW_VENDOR: 2,
  NO_SHOW_CUSTOMER: 1,
  LATE_CANCELLATION: 1,
  ABUSE_REPORT: 2,
  FRAUD_SUSPECTED: 5,
  HARASSMENT: 3,
  POLICY_VIOLATION: 1,
};
```

### Penalty Calculation
```typescript
interface PenaltyThreshold {
  points: number;
  penalty: AccountStatus;
  duration?: number; // days, null for permanent
}

const PENALTY_THRESHOLDS: PenaltyThreshold[] = [
  { points: 1, penalty: 'WARNING', duration: null },
  { points: 3, penalty: 'RESTRICTED', duration: 7 },
  { points: 5, penalty: 'SUSPENDED', duration: 30 },
  { points: 8, penalty: 'BANNED', duration: null },
];

function calculatePenalty(totalPoints: number): PenaltyThreshold {
  return PENALTY_THRESHOLDS
    .slice()
    .reverse()
    .find(t => totalPoints >= t.points) || PENALTY_THRESHOLDS[0];
}
```

### Auto-Violation from Messaging
```typescript
// Called when messaging flags suspicious content
async function processCircumventionViolation(userId: string, messageId: string) {
  // Get existing violations in last 30 days
  const recentViolations = await prisma.violation.findMany({
    where: {
      userId,
      type: { in: ['CIRCUMVENTION_ATTEMPT', 'REPEATED_CIRCUMVENTION'] },
      createdAt: { gte: subDays(new Date(), 30) },
    },
  });

  const isRepeat = recentViolations.length > 0;
  const type = isRepeat ? 'REPEATED_CIRCUMVENTION' : 'CIRCUMVENTION_ATTEMPT';

  await createViolation({
    userId,
    type,
    source: 'MESSAGING_SYSTEM',
    sourceId: messageId,
    description: isRepeat
      ? 'Repeated attempt to share contact information'
      : 'Attempted to share contact information outside platform',
    automated: true,
  });
}
```

### Violation Service
```typescript
async function createViolation(data: CreateViolationInput): Promise<Violation> {
  const violation = await prisma.violation.create({
    data: {
      userId: data.userId,
      type: data.type,
      source: data.source,
      sourceId: data.sourceId,
      description: data.description,
      severity: VIOLATION_SEVERITY[data.type],
      automated: data.automated ?? false,
    },
  });

  // Calculate new penalty status
  const totalPoints = await prisma.violation.aggregate({
    where: {
      userId: data.userId,
      appealed: false,
      createdAt: { gte: subDays(new Date(), 365) }, // Rolling year
    },
    _sum: { severity: true },
  });

  const penalty = calculatePenalty(totalPoints._sum.severity || 0);

  // Update user status if needed
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (getStatusPriority(penalty.penalty) > getStatusPriority(user.accountStatus)) {
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        accountStatus: penalty.penalty,
        statusExpiresAt: penalty.duration
          ? addDays(new Date(), penalty.duration)
          : null,
      },
    });

    // Send notification
    await sendViolationNotification(user, violation, penalty);
  }

  return violation;
}
```

### Appeal Handling
```typescript
async function handleAppeal(
  violationId: string,
  adminId: string,
  decision: 'APPROVED' | 'REJECTED',
  notes: string
) {
  const violation = await prisma.violation.update({
    where: { id: violationId },
    data: {
      appealed: decision === 'APPROVED',
      appealDecision: decision,
      appealNotes: notes,
      appealReviewedBy: adminId,
      appealReviewedAt: new Date(),
    },
  });

  if (decision === 'APPROVED') {
    // Recalculate user's penalty status
    await recalculateUserStatus(violation.userId);
  }

  return violation;
}
```

### Status Expiry Job
```typescript
// Run daily to expire temporary penalties
async function expirePenalties() {
  const expiredUsers = await prisma.user.findMany({
    where: {
      accountStatus: { in: ['RESTRICTED', 'SUSPENDED'] },
      statusExpiresAt: { lte: new Date() },
    },
  });

  for (const user of expiredUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accountStatus: 'ACTIVE',
        statusExpiresAt: null,
      },
    });
  }
}
```

## Dependencies (Completed)

- Fleet-Feast-2f0: Messaging System with Anti-Circumvention ✓
- Fleet-Feast-igb: Authentication System ✓

## PRD Reference

- **F15**: Anti-Circumvention Measures
- **Business Rules**: Penalty Progression
- **Business Rules**: Account Status Effects

## Gap Checklist

After completing the task, verify:
- [ ] Violations logged with severity points
- [ ] Penalty progression calculates correctly
- [ ] Account status updated appropriately
- [ ] Circumvention flags create violations
- [ ] Admin can view all violations
- [ ] Appeal process works
- [ ] Temporary penalties have expiry
- [ ] Notifications sent for status changes

---

*Briefing generated by MASTER Orchestrator*
