# Task Briefing: Fleet-Feast-2f0

**Generated**: 2025-12-05T03:45:00Z
**Agent**: Blake_Backend
**Task**: Messaging System with Anti-Circumvention
**Invocation**: 1

---

## Objective

Implement in-app messaging tied to bookings with anti-circumvention detection. Messages are preserved, external contact exchange is blocked, and suspicious patterns are flagged.

## Acceptance Criteria

1. **Messaging API**
   - `POST /api/messages` - Send message (booking-scoped)
   - `GET /api/messages/:bookingId` - Get conversation for booking
   - `GET /api/messages/inbox` - Get all user's conversations
   - `PUT /api/messages/:id/read` - Mark as read

2. **Booking-Scoped Messages**
   - Messages only allowed for active bookings (PENDING → COMPLETED)
   - Both customer and vendor can message
   - History preserved for dispute resolution

3. **Anti-Circumvention Detection**
   - Scan for phone numbers: `\b\d{3}[-.]?\d{3}[-.]?\d{4}\b`
   - Scan for emails: `\b[\w.-]+@[\w.-]+\.\w+\b`
   - Scan for social handles: `@\w+`, Instagram, Facebook, WhatsApp mentions
   - Scan for coded messages: "call me", "text me", "my number is"

4. **Suspicious Content Handling**
   - Flag message but still deliver
   - Log to `SuspiciousActivity` table
   - Notify admin for review
   - Increment user's warning count

## Technical Details

### File Structure
```
modules/messaging/
├── messaging.service.ts     # Business logic
├── messaging.validation.ts  # Zod schemas
├── messaging.types.ts       # TypeScript types
└── anti-circumvention.ts    # Detection patterns

app/api/messages/
├── route.ts                 # POST (send), GET (inbox)
├── [bookingId]/route.ts     # GET conversation
└── [id]/read/route.ts       # PUT mark read
```

### Message Schema
```typescript
interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  content: string;
  flagged: boolean;
  flagReason?: string;
  readAt?: Date;
  createdAt: Date;
}

interface SuspiciousActivity {
  id: string;
  userId: string;
  messageId: string;
  pattern: string;
  detectedContent: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  reviewed: boolean;
  createdAt: Date;
}
```

### Anti-Circumvention Patterns
```typescript
const CIRCUMVENTION_PATTERNS = [
  // Phone numbers
  { pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, type: 'PHONE', severity: 'HIGH' },
  { pattern: /\b\d{10,11}\b/g, type: 'PHONE', severity: 'MEDIUM' },

  // Emails
  { pattern: /\b[\w.-]+@[\w.-]+\.\w{2,}\b/gi, type: 'EMAIL', severity: 'HIGH' },

  // Social handles
  { pattern: /@[\w]{3,}/g, type: 'SOCIAL_HANDLE', severity: 'MEDIUM' },
  { pattern: /\b(instagram|insta|ig|facebook|fb|whatsapp|telegram)\b/gi, type: 'SOCIAL_PLATFORM', severity: 'MEDIUM' },

  // Coded language
  { pattern: /\b(call me|text me|my number|reach me at|contact me|off platform)\b/gi, type: 'CODED', severity: 'LOW' },

  // URLs (except whitelisted)
  { pattern: /https?:\/\/(?!fleetfeast\.com)[\w.-]+\.\w{2,}/gi, type: 'EXTERNAL_URL', severity: 'MEDIUM' },
];

function scanForCircumvention(content: string): CircumventionResult[] {
  const results: CircumventionResult[] = [];

  for (const { pattern, type, severity } of CIRCUMVENTION_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      results.push({
        type,
        severity,
        matches,
        positions: [...content.matchAll(pattern)].map(m => m.index),
      });
    }
  }

  return results;
}
```

### Message Service
```typescript
async function sendMessage(
  senderId: string,
  bookingId: string,
  content: string
): Promise<Message> {
  // Verify booking access
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new NotFoundError('Booking not found');
  if (booking.customerId !== senderId && booking.vendorId !== senderId) {
    throw new ForbiddenError('Not authorized for this booking');
  }

  // Check booking status allows messaging
  const allowedStatuses = ['PENDING', 'ACCEPTED', 'CONFIRMED', 'COMPLETED'];
  if (!allowedStatuses.includes(booking.status)) {
    throw new BadRequestError('Messaging not allowed for this booking status');
  }

  // Scan for circumvention
  const circumventionResults = scanForCircumvention(content);
  const isFlagged = circumventionResults.length > 0;

  const receiverId = booking.customerId === senderId
    ? booking.vendorId
    : booking.customerId;

  // Create message
  const message = await prisma.message.create({
    data: {
      bookingId,
      senderId,
      receiverId,
      content,
      flagged: isFlagged,
      flagReason: isFlagged
        ? circumventionResults.map(r => r.type).join(', ')
        : null,
    },
  });

  // Log suspicious activity if flagged
  if (isFlagged) {
    for (const result of circumventionResults) {
      await prisma.suspiciousActivity.create({
        data: {
          userId: senderId,
          messageId: message.id,
          pattern: result.type,
          detectedContent: result.matches.join(', '),
          severity: result.severity,
        },
      });
    }

    // Increment user warning count
    await prisma.user.update({
      where: { id: senderId },
      data: { warningCount: { increment: 1 } },
    });
  }

  return message;
}
```

### Inbox with Unread Count
```typescript
async function getInbox(userId: string) {
  const conversations = await prisma.message.groupBy({
    by: ['bookingId'],
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    },
    _max: { createdAt: true },
  });

  // Get full conversation details with unread counts
  const inbox = await Promise.all(
    conversations.map(async (conv) => {
      const booking = await prisma.booking.findUnique({
        where: { id: conv.bookingId },
        include: { vendor: true, customer: true },
      });

      const unreadCount = await prisma.message.count({
        where: {
          bookingId: conv.bookingId,
          receiverId: userId,
          readAt: null,
        },
      });

      const lastMessage = await prisma.message.findFirst({
        where: { bookingId: conv.bookingId },
        orderBy: { createdAt: 'desc' },
      });

      return {
        bookingId: conv.bookingId,
        booking,
        unreadCount,
        lastMessage,
        lastMessageAt: conv._max.createdAt,
      };
    })
  );

  return inbox.sort((a, b) =>
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}
```

## Dependencies (Completed)

- Fleet-Feast-wu8: Booking System API ✓
- Fleet-Feast-igb: Authentication System ✓

## PRD Reference

- **F9**: In-App Messaging
- **F14**: Anti-Circumvention Measures
- **Business Rules**: Message content scanning

## Gap Checklist

After completing the task, verify:
- [ ] Messages scoped to valid bookings only
- [ ] Both parties can send messages
- [ ] Anti-circumvention patterns detect contacts
- [ ] Flagged messages still delivered
- [ ] Suspicious activity logged
- [ ] Warning count incremented
- [ ] Inbox shows unread counts
- [ ] Message history preserved
- [ ] Read receipts work

---

*Briefing generated by MASTER Orchestrator*
