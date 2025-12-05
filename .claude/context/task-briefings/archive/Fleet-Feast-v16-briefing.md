# Task Briefing: Fleet-Feast-v16

**Generated**: 2025-12-05T04:00:00Z
**Agent**: Parker_Pages
**Task**: Messaging Interface
**Invocation**: 1

---

## Objective

Create the messaging UI: conversation list (inbox), message thread view, message composer, and flagged message indicators. Support real-time feel with optimistic updates.

## Acceptance Criteria

1. **Inbox/Conversation List** (`/messages`)
   - List all user's conversations
   - Show last message preview
   - Unread indicator/count
   - Booking context (event date, vendor/customer name)
   - Sort by most recent

2. **Message Thread** (`/messages/[bookingId]`)
   - Full conversation history
   - Messages grouped by date
   - Sender avatars and names
   - Timestamps
   - Flagged message indicators (warning icon)
   - Auto-scroll to bottom on new messages

3. **Message Composer**
   - Textarea with character limit
   - Send button (Enter or click)
   - Disabled state when booking is cancelled
   - Warning for flagged content (pre-send check)

4. **Flagged Message Display**
   - Warning icon on flagged messages
   - Tooltip explaining why it was flagged
   - Link to platform rules

## Technical Details

### File Structure
```
app/(dashboard)/messages/
├── page.tsx               # Inbox/conversation list
├── [bookingId]/page.tsx   # Message thread
└── components/
    ├── ConversationList.tsx
    ├── ConversationCard.tsx
    ├── MessageThread.tsx
    ├── MessageBubble.tsx
    ├── MessageComposer.tsx
    └── FlaggedWarning.tsx
```

### Conversation Card
```typescript
interface ConversationCardProps {
  bookingId: string;
  otherParty: {
    name: string;
    avatarUrl?: string;
  };
  booking: {
    eventDate: Date;
    status: BookingStatus;
    vendor: { businessName: string };
  };
  lastMessage: {
    content: string;
    createdAt: Date;
    isFromMe: boolean;
  };
  unreadCount: number;
}

function ConversationCard({
  bookingId,
  otherParty,
  booking,
  lastMessage,
  unreadCount
}: ConversationCardProps) {
  return (
    <Link href={`/messages/${bookingId}`}>
      <Card className={cn(
        'hover:bg-gray-50 transition-colors',
        unreadCount > 0 && 'border-l-4 border-l-primary'
      )}>
        <CardContent className="flex gap-4 p-4">
          <Avatar src={otherParty.avatarUrl} name={otherParty.name} />

          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <h4 className="font-medium truncate">{otherParty.name}</h4>
              <span className="text-sm text-gray-500">
                {formatRelativeTime(lastMessage.createdAt)}
              </span>
            </div>

            <p className="text-sm text-gray-600 truncate">
              {lastMessage.isFromMe && 'You: '}
              {lastMessage.content}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" size="sm">
                {booking.vendor.businessName}
              </Badge>
              <span className="text-xs text-gray-500">
                {format(booking.eventDate, 'MMM d')}
              </span>
            </div>
          </div>

          {unreadCount > 0 && (
            <Badge variant="primary" className="self-center">
              {unreadCount}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
```

### Message Thread with SWR
```typescript
function MessageThread({ bookingId }: { bookingId: string }) {
  const { data, error, mutate } = useSWR(
    `/api/messages/${bookingId}`,
    fetcher,
    { refreshInterval: 5000 } // Poll every 5s
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  // Mark as read when viewing
  useEffect(() => {
    fetch(`/api/messages/${bookingId}/read`, { method: 'PUT' });
  }, [bookingId]);

  if (error) return <Alert variant="error">Failed to load messages</Alert>;
  if (!data) return <Spinner />;

  const groupedMessages = groupMessagesByDate(data.messages);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date}>
            <div className="text-center text-sm text-gray-500 my-4">
              {date}
            </div>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageComposer
        bookingId={bookingId}
        onSend={() => mutate()}
        disabled={data.booking.status === 'CANCELLED'}
      />
    </div>
  );
}
```

### Message Bubble
```typescript
interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    createdAt: Date;
    flagged: boolean;
    flagReason?: string;
    senderId: string;
    senderName: string;
  };
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn(
      'flex gap-2 max-w-[80%]',
      isOwn ? 'ml-auto flex-row-reverse' : ''
    )}>
      {!isOwn && <Avatar size="sm" name={message.senderName} />}

      <div>
        <div className={cn(
          'rounded-2xl px-4 py-2',
          isOwn
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-gray-100 rounded-bl-none'
        )}>
          {message.flagged && (
            <FlaggedWarning reason={message.flagReason} />
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className={cn(
          'text-xs text-gray-500 mt-1',
          isOwn ? 'text-right' : ''
        )}>
          {format(message.createdAt, 'h:mm a')}
        </span>
      </div>
    </div>
  );
}
```

### Flagged Warning Component
```typescript
function FlaggedWarning({ reason }: { reason?: string }) {
  return (
    <div className="flex items-center gap-1 text-amber-600 text-sm mb-1">
      <AlertTriangle className="w-4 h-4" />
      <span>This message was flagged</span>
      <Tooltip content={
        <div className="max-w-xs">
          <p className="font-medium">Why was this flagged?</p>
          <p className="text-sm">{reason || 'Potential contact information detected'}</p>
          <p className="text-sm mt-2">
            Sharing contact information outside the platform violates our
            <a href="/terms" className="underline ml-1">Terms of Service</a>.
          </p>
        </div>
      }>
        <Info className="w-4 h-4 cursor-help" />
      </Tooltip>
    </div>
  );
}
```

### Message Composer with Pre-send Check
```typescript
function MessageComposer({
  bookingId,
  onSend,
  disabled
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [warning, setWarning] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const MAX_LENGTH = 1000;

  // Client-side pattern check (mirrors backend)
  const checkForFlags = (text: string) => {
    const patterns = [
      { regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, type: 'phone number' },
      { regex: /\b[\w.-]+@[\w.-]+\.\w{2,}\b/i, type: 'email address' },
      { regex: /@\w{3,}/g, type: 'social media handle' },
    ];

    for (const { regex, type } of patterns) {
      if (regex.test(text)) {
        return `Your message appears to contain a ${type}. Sharing contact information is against our policies.`;
      }
    }
    return null;
  };

  const handleChange = (value: string) => {
    setContent(value);
    setWarning(checkForFlags(value));
  };

  const handleSend = async () => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, content }),
      });
      setContent('');
      setWarning(null);
      onSend?.();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (disabled) {
    return (
      <div className="p-4 bg-gray-50 text-center text-gray-500">
        Messaging is disabled for this booking
      </div>
    );
  }

  return (
    <div className="border-t p-4">
      {warning && (
        <Alert variant="warning" className="mb-2">
          {warning}
        </Alert>
      )}

      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={MAX_LENGTH}
          rows={2}
          className="flex-1 resize-none"
        />
        <Button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className="self-end"
        >
          {isSending ? <Spinner size="sm" /> : <Send className="w-5 h-5" />}
        </Button>
      </div>

      <div className="text-xs text-gray-500 text-right mt-1">
        {content.length}/{MAX_LENGTH}
      </div>
    </div>
  );
}
```

## UI Components Available

From components/ui/:
- Button, Card, Badge, Alert, Spinner, Textarea, Avatar, Tooltip

From components/layout/:
- DashboardLayout

## Dependencies (Completed)

- Fleet-Feast-2f0: Messaging System with Anti-Circumvention ✓
- Fleet-Feast-bxt: UI Component Library ✓
- Fleet-Feast-5ub: Navigation & Layout System ✓

## PRD Reference

- **F9**: In-App Messaging
- **F14**: Anti-Circumvention (flagged message display)

## Gap Checklist

After completing the task, verify:
- [ ] Inbox shows all conversations
- [ ] Unread count displayed correctly
- [ ] Messages grouped by date
- [ ] Message bubbles styled correctly (own vs other)
- [ ] Flagged messages show warning icon
- [ ] Tooltip explains flag reason
- [ ] Composer validates content pre-send
- [ ] Enter key sends message
- [ ] Auto-scroll to new messages
- [ ] Disabled state for cancelled bookings
- [ ] Mobile responsive design

---

*Briefing generated by MASTER Orchestrator*
