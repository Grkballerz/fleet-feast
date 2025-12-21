# Booking Components

This directory contains reusable components for the booking and proposal workflow in Fleet Feast.

## Components

### InquiryForm

A customer-facing form component for submitting booking inquiries without price calculation or payment.

**Location**: `components/booking/InquiryForm.tsx`

**Purpose**: Allows customers to request a custom quote from vendors by providing event details.

#### Features

- **Event Date/Time**: Date picker (minimum tomorrow) and time selection
- **Event Type**: Dropdown for event categories (Corporate, Wedding, Birthday, Festival, Private Party, Other)
- **Location**: Single address field for event location
- **Guest Count**: Number input with vendor capacity validation
- **Special Requests**: Optional textarea for dietary requirements, setup preferences, etc.
- **Quote Request Messaging**: Clear explanation that vendor will send a custom proposal
- **Success State**: Confirmation message after submission
- **Validation**: Comprehensive client-side validation with inline error messages
- **Accessibility**: Full WCAG 2.1 AA compliance

#### Usage

```tsx
import { InquiryForm } from "@/components/booking";

function BookingPage({ vendorId }) {
  const [vendor, setVendor] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (inquiry) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          ...inquiry,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit inquiry");

      const data = await response.json();
      router.push(`/inquiries/${data.id}/confirmation`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <InquiryForm
      vendor={vendor}
      onSubmit={handleSubmit}
      isLoading={submitting}
    />
  );
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `vendor` | `VendorInfo` | Yes | Vendor details for capacity validation and display |
| `onSubmit` | `(data: InquiryRequestData) => Promise<void>` | Yes | Callback when inquiry is submitted |
| `isLoading` | `boolean` | No | Loading state during submission (default: false) |

#### Type Definitions

```typescript
interface VendorInfo {
  id: string;
  businessName: string;
  cuisineType: CuisineType;
  capacityMin: number;
  capacityMax: number;
}

interface InquiryRequestData {
  eventDate: string;
  eventTime: string;
  eventType: EventType;
  location: string;
  guestCount: number;
  specialRequests?: string;
}

type EventType = "CORPORATE" | "WEDDING" | "BIRTHDAY" | "FESTIVAL" | "PRIVATE_PARTY" | "OTHER";
```

#### Validation Rules

- Event date must be at least 1 day in advance
- Event time is required
- Location cannot be empty
- Guest count must be within vendor capacity range
- Special requests are optional (max 1000 characters)
- Errors clear automatically when fields are corrected

#### Key Differences from BookingClient

This component replaces the price calculator approach:

- **No price calculation**: Removed live price breakdown
- **No payment flow**: Inquiry-only, no immediate payment
- **Simplified location**: Single address field instead of structured address
- **Quote messaging**: Clear explanation that vendor sends custom proposal
- **Success state**: In-form success message instead of redirect

#### Accessibility

- Proper ARIA labels on all form controls
- Required field indicators with `aria-label="required"`
- Keyboard navigation support (Tab, Enter, Space)
- Screen reader announcements for errors (`role="alert"`, `aria-live="polite"`)
- Error messages linked via `aria-describedby`
- Invalid fields marked with `aria-invalid="true"`
- Helper text for guest count and character limits

#### Testing

Comprehensive test suite with 45+ test cases covering:

- Component rendering
- Form validation (all fields)
- Guest count capacity validation
- Date validation (must be future)
- Form submission flow
- Success/error states
- Loading states
- Accessibility features
- Event type selection
- Character count for special requests

**Run tests**:
```bash
npm test -- InquiryForm.test.tsx
```

#### Examples

See `InquiryForm.example.tsx` for usage examples including:

1. Basic usage in a booking page
2. Custom success handling with modal
3. Error handling with retry logic
4. Pre-filled form data
5. Analytics tracking integration

---

### ProposalBuilder

A comprehensive form component for vendors to create detailed proposals for customer inquiries.

**Location**: `components/booking/ProposalBuilder.tsx`

**Purpose**: Allows vendors to create itemized proposals with line items, inclusions, terms, and automatic fee calculations.

#### Features

- **Dynamic Line Items**: Add/remove items with quantity and unit price
- **Real-time Calculations**: Automatic subtotal, platform fee (5%), and vendor payout calculations
- **Inclusions Manager**: Predefined and custom inclusions with multi-select
- **Terms Editor**: Optional terms and conditions textarea
- **Expiration Selector**: Choose proposal validity period (3-30 days)
- **Fee Transparency**: Clear breakdown showing customer total and vendor payout
- **Validation**: Comprehensive client-side validation with inline error messages
- **Confirmation Flow**: Modal confirmation before sending proposal

#### Usage

```tsx
import { ProposalBuilder } from "@/components/booking";

function CreateProposal({ inquiryId }) {
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (proposalData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalData),
      });

      if (!response.ok) throw new Error("Failed to create proposal");

      const result = await response.json();
      router.push(`/vendor/proposals/${result.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create proposal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProposalBuilder
      inquiry={inquiry}
      onSubmit={handleSubmit}
      isLoading={loading}
    />
  );
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `inquiry` | `InquiryData` | Yes | Customer inquiry details (event info, guest count, location) |
| `onSubmit` | `(data: ProposalData) => Promise<void>` | Yes | Callback when proposal is submitted |
| `isLoading` | `boolean` | No | Loading state during submission (default: false) |

#### Type Definitions

```typescript
interface InquiryData {
  eventDate: string;
  eventTime: string;
  guestCount: number;
  eventType: EventType;
  location: string;
  specialRequests?: string;
}

interface ProposalData {
  lineItems: LineItem[];
  inclusions: string[];
  terms: string;
  expirationDays: number;
  subtotal: number;
  platformFee: number;
  customerTotal: number;
  vendorReceives: number;
}

interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}
```

#### Fee Structure

The component uses a **5% platform fee model**:

- **Subtotal**: Sum of all line items (quantity × unit price)
- **Platform Fee (5%)**: Deducted from subtotal (vendor portion)
- **Customer Total**: Subtotal + 5% service fee
- **Vendor Receives**: Subtotal - 5% platform fee

**Example**:
- Subtotal: $1,000
- Platform Fee: -$50 (5% vendor pays)
- Customer Total: $1,050 (subtotal + 5% customer pays)
- **Vendor Receives**: $950

#### Validation Rules

- At least one line item required
- All line items must have:
  - Non-empty name
  - Price greater than $0
- Total must be greater than $0
- Errors clear automatically when fields are corrected

#### Accessibility

- Proper ARIA labels on all interactive elements
- Keyboard navigation support (Tab, Enter, Space)
- Screen reader announcements for errors
- Required field indicators
- Focus management
- Error alerts with `role="alert"`

#### Testing

Comprehensive test suite with 50+ test cases covering:

- Component rendering
- Line item management (add, remove, update)
- Fee calculations
- Inclusions (predefined and custom)
- Terms editor
- Expiration picker
- Validation logic
- Submission flow
- Accessibility features

**Run tests**:
```bash
npm test -- ProposalBuilder.test.tsx
```

#### Examples

See `ProposalBuilder.example.tsx` for usage examples including:

1. Basic usage
2. API integration with inquiry fetch
3. Custom validation logic
4. Draft saving with localStorage
5. Modal presentation

## Design Patterns

All components in this directory follow these patterns:

- **Mobile-First**: Responsive design for all screen sizes
- **Accessibility**: WCAG 2.1 AA compliance
- **Type Safety**: Full TypeScript coverage
- **Validation**: Client-side validation with clear error messages
- **Loading States**: Visual feedback during async operations
- **Error Handling**: User-friendly error messages
- **Component Composition**: Reuses UI components from `@/components/ui`

## Dependencies

- React 18+
- Next.js 14+
- @prisma/client (EventType enum)
- lucide-react (icons)
- Tailwind CSS
- UI components from `@/components/ui`

## Related Documentation

- [MASTER Component Registry](/.claude/context/MASTER_Component_Registry.md)
- [Design System](/../styles/README.md)
- [API Documentation](/docs/api/)
- [Prisma Schema](/prisma/schema.prisma)

## Maintenance

**Owner**: Casey_Components

**Last Updated**: 2025-12-20

For questions or issues, see the main component registry or contact the component owner.
