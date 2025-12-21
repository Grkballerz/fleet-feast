# Booking Components

This directory contains reusable components for the booking and proposal workflow in Fleet Feast.

## Components

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
