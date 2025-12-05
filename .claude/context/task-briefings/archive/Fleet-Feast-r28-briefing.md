# Task Briefing: Fleet-Feast-r28

**Generated**: 2025-12-05T04:00:00Z
**Agent**: Parker_Pages
**Task**: Booking Flow Pages
**Invocation**: 1

---

## Objective

Create the complete booking flow: request form with event details, payment checkout with Stripe Elements, confirmation page, and booking details/management page.

## Acceptance Criteria

1. **Booking Request Form** (`/booking`)
   - Select food truck (from URL param or search)
   - Event details: date, time, duration
   - Location: address, venue name
   - Guest count (with min/max from vendor)
   - Event type selection
   - Special requests textarea
   - Price calculation display

2. **Payment Checkout** (`/booking/[id]/payment`)
   - Order summary with breakdown
   - Stripe Elements for card input
   - Platform fee disclosure
   - Terms acceptance checkbox
   - Secure payment submission

3. **Booking Confirmation** (`/booking/[id]/confirmation`)
   - Success message with booking ID
   - Event details summary
   - Next steps (vendor will respond in 48hrs)
   - Add to calendar button
   - Share/print options

4. **Booking Details** (`/bookings/[id]`)
   - Full booking information
   - Status indicator with timeline
   - Vendor contact (if accepted)
   - Cancel booking option
   - Messaging link (if available)

## Technical Details

### File Structure
```
app/(customer)/booking/
├── page.tsx               # Booking request form
├── [id]/
│   ├── payment/page.tsx   # Stripe checkout
│   └── confirmation/page.tsx

app/(customer)/bookings/
├── page.tsx               # List user's bookings
└── [id]/page.tsx          # Booking details
```

### Booking Form State
```typescript
interface BookingFormState {
  vendorId: string;
  eventDate: Date;
  eventTime: string; // HH:MM
  duration: number; // hours
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    venueName?: string;
  };
  guestCount: number;
  eventType: EventType;
  specialRequests?: string;
}

type EventType =
  | 'CORPORATE'
  | 'WEDDING'
  | 'BIRTHDAY'
  | 'FESTIVAL'
  | 'PRIVATE_PARTY'
  | 'OTHER';
```

### Price Calculation Display
```typescript
interface PriceBreakdown {
  basePrice: number;        // Vendor's base rate
  guestSurcharge: number;   // If over minimum
  durationFee: number;      // Per-hour rate
  travelFee: number;        // Distance-based
  subtotal: number;
  platformFee: number;      // 15%
  total: number;
}

function PriceBreakdown({ breakdown }: { breakdown: PriceBreakdown }) {
  return (
    <Card>
      <CardHeader>Price Breakdown</CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Base Price</span>
          <span>${breakdown.basePrice}</span>
        </div>
        {breakdown.guestSurcharge > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Additional Guests</span>
            <span>+${breakdown.guestSurcharge}</span>
          </div>
        )}
        {breakdown.durationFee > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Extended Duration</span>
            <span>+${breakdown.durationFee}</span>
          </div>
        )}
        <Divider />
        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>${breakdown.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Service Fee (15%)</span>
          <span>+${breakdown.platformFee}</span>
        </div>
        <Divider />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${breakdown.total}</span>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Stripe Elements Integration
```typescript
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ bookingId, clientSecret }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      }
    );

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent?.status === 'requires_capture') {
      // Redirect to confirmation
      router.push(`/booking/${bookingId}/confirmation`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#9e2146' },
          },
        }}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Button type="submit" disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
}

export default function PaymentPage({ params }: { params: { id: string } }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    // Fetch booking and create payment intent
    async function initPayment() {
      const bookingRes = await fetch(`/api/bookings/${params.id}`);
      const bookingData = await bookingRes.json();
      setBooking(bookingData);

      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: params.id }),
      });
      const { clientSecret } = await paymentRes.json();
      setClientSecret(clientSecret);
    }
    initPayment();
  }, [params.id]);

  if (!clientSecret || !booking) return <Spinner />;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm bookingId={params.id} clientSecret={clientSecret} />
    </Elements>
  );
}
```

### Booking Status Timeline
```typescript
const STATUS_STEPS = [
  { status: 'PENDING', label: 'Request Sent', description: 'Awaiting vendor response' },
  { status: 'ACCEPTED', label: 'Accepted', description: 'Vendor accepted, proceed to payment' },
  { status: 'CONFIRMED', label: 'Confirmed', description: 'Payment received' },
  { status: 'COMPLETED', label: 'Completed', description: 'Event finished' },
];

function BookingTimeline({ currentStatus }: { currentStatus: BookingStatus }) {
  const currentIndex = STATUS_STEPS.findIndex(s => s.status === currentStatus);

  return (
    <div className="flex flex-col space-y-4">
      {STATUS_STEPS.map((step, index) => (
        <div key={step.status} className="flex items-start gap-4">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            index <= currentIndex ? 'bg-green-500 text-white' : 'bg-gray-200'
          )}>
            {index < currentIndex ? '✓' : index + 1}
          </div>
          <div>
            <h4 className="font-medium">{step.label}</h4>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Add to Calendar
```typescript
function generateCalendarLinks(booking: Booking) {
  const event = {
    title: `Food Truck Event - ${booking.vendor.businessName}`,
    start: booking.eventDate,
    end: addHours(booking.eventDate, booking.duration),
    location: `${booking.location.address}, ${booking.location.city}`,
    description: `Booking #${booking.id}`,
  };

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatGoogleDate(event.start)}/${formatGoogleDate(event.end)}&location=${encodeURIComponent(event.location)}`;

  const icsContent = generateICS(event);
  const icsUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

  return { googleUrl, icsUrl };
}
```

## UI Components Available

From components/ui/:
- Button, Card, Input, Select, Textarea, Alert, Badge, Spinner
- DatePicker, TimePicker (if available)

From components/layout/:
- MainLayout, CustomerLayout

## Dependencies (Completed)

- Fleet-Feast-wu8: Booking System API ✓
- Fleet-Feast-5cl: Payment & Escrow System ✓
- Fleet-Feast-bxt: UI Component Library ✓
- Fleet-Feast-5ub: Navigation & Layout System ✓

## PRD Reference

- **F7**: Request-to-Book Flow
- **F8**: Secure Payment Processing
- Event details collection

## Gap Checklist

After completing the task, verify:
- [ ] Booking form collects all required fields
- [ ] Price calculation updates dynamically
- [ ] Date picker prevents past dates
- [ ] Guest count respects vendor limits
- [ ] Stripe Elements loads correctly
- [ ] Payment errors displayed clearly
- [ ] Confirmation shows all details
- [ ] Add to calendar generates correct links
- [ ] Booking details show status timeline
- [ ] Cancel booking works with policy display
- [ ] Mobile responsive design

---

*Briefing generated by MASTER Orchestrator*
