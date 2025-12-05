# MASTER Component Registry

Track all UI components, design tokens, and styling utilities for Fleet Feast.

---

## Design System Components

### Global Styles & Theme (Task 2.25)
**Status**: Complete
**Files**:
- `tailwind.config.ts` - Enhanced Tailwind configuration
- `app/globals.css` - Global styles with CSS custom properties
- `styles/theme.css` - Component-level tokens and theme utilities
- `styles/README.md` - Complete design system documentation

**Design Tokens**:
- Colors: Primary (#B91C1C), Success (#059669), Warning (#D97706), Error (#DC2626)
- Typography: Inter font, 9 size scales (12px-48px), 4 weights (400-700)
- Spacing: 4px base scale (0-256px)
- Border Radius: 4px-full (sm, md, lg, xl, 2xl, full)
- Shadows: 6 elevation levels (sm, default, md, lg, xl, 2xl)
- Animations: 10+ keyframe animations (fade, slide, scale, shimmer, pulse)

**Component Classes**:
- Typography: `.heading-1` through `.heading-4`, `.body-text`, `.small-text`, `.caption-text`
- Buttons: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-destructive` with size variants
- Cards: `.card`, `.card-interactive`, `.card-compact`, `.card-spacious`
- Inputs: `.input`, `.textarea`, `.select`, `.label`, `.input-error`, `.error-message`
- Badges: `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-neutral`, `.badge-primary`
- Containers: `.container-custom`, `.container-narrow`, `.container-wide`
- Loading: `.spinner`, `.skeleton`, `.skeleton-text`, `.skeleton-circle`
- Utilities: `.divider`, `.focus-ring`, `.truncate-2`, `.truncate-3`, `.gradient-primary`, `.glass`

**Accessibility Features**:
- Focus ring styles on all interactive elements
- Reduced motion support (@media prefers-reduced-motion)
- Screen reader utilities (`.sr-only`, `.sr-only-focusable`)
- Skip link (`.skip-link`)
- WCAG AA color contrast (4.5:1 minimum)

**Dark Mode Foundation**:
- CSS variables for light/dark themes
- `.dark` class support ready
- Component-specific dark mode overrides

**Dependencies**:
- `tailwindcss`: ^3.4.13
- `tailwindcss-animate`: ^1.0.7
- `@tailwindcss/container-queries`: ^0.1.1

**Used In**: All components, pages, and layouts

**Maintained By**: Sam_Styler

---

## Component Template

```markdown
### [Component Name] (Task X.X)
**Status**: [Pending | In Progress | Complete]
**Path**: `path/to/component.tsx`
**Description**: Brief description

**Props**:
- `propName` (type): Description

**Variants**: List variants

**Used In**: List pages/components

**Dependencies**: List dependencies
```

---

## Vendor Application Components (Task Fleet-Feast-qm9)
**Status**: Complete
**Agent**: Parker_Pages
**Date**: 2025-12-05

### Multi-Step Application Form
**Path**: `app/(vendor)/apply/`
**Description**: Complete vendor application flow with 5 steps, progress tracking, and auto-save functionality

**Components**:
- `ApplicationForm.tsx` - Parent component with state management and validation
- `ProgressIndicator.tsx` - Step indicator with mobile/desktop layouts
- `Step1BusinessInfo.tsx` - Business information form
- `Step2Documents.tsx` - Document upload with drag-and-drop
- `Step3Menu.tsx` - Menu item CRUD interface
- `Step4Availability.tsx` - Availability calendar and pricing model
- `Step5Preview.tsx` - Review and submit with terms acceptance

**Features**:
- 5-step multi-form with progress indicator
- Client-side validation per step
- Auto-save to localStorage
- Server-side draft persistence (PUT /api/vendor/profile)
- Drag-and-drop file upload
- Real-time file upload with progress
- Menu item CRUD with modal
- Interactive 90-day calendar
- Recurring availability patterns
- Complete application preview
- Terms acceptance checkbox
- Error handling and validation feedback

**Type Definitions**: `types/vendor-application.ts`
- ApplicationState, BusinessInfoData, DocumentData
- MenuItemData, AvailabilityData, ValidationErrors
- DocumentType, PricingModel, DietaryTag, AvailabilityPattern enums

**Pages**:
- `app/(vendor)/apply/page.tsx` - Main application page
- `app/(vendor)/apply/layout.tsx` - Layout with DashboardLayout
- `app/(vendor)/apply/success/page.tsx` - Success confirmation page

**API Integration**:
- POST `/api/vendor/apply` - Submit application
- POST `/api/vendor/documents` - Upload documents
- PUT `/api/vendor/profile` - Save draft
- GET `/api/vendor/profile` - Load existing data

**Dependencies**:
- DashboardLayout component
- UI components: Button, Input, Card, Alert, Spinner, Badge, Modal
- Next.js 14 App Router
- React hooks for state management

**Used In**: Vendor onboarding flow

**Maintained By**: Parker_Pages

---

## Booking Flow Pages (Task Fleet-Feast-r28)
**Status**: Complete
**Agent**: Parker_Pages
**Date**: 2025-12-05

### Booking Request Form
**Path**: `app/(customer)/booking/page.tsx`
**Description**: Complete booking request form with event details, location, guest count, and dynamic price calculation

**Features**:
- Vendor selection via URL parameter
- Event date/time selection with past date prevention
- Duration selector (1-12 hours)
- Guest count with min/max validation
- Event type selection (Corporate, Wedding, Birthday, Festival, Private Party, Other)
- Location form (address, city, state, ZIP, optional venue name)
- Special requests textarea
- Real-time price calculation and breakdown display
- Form validation with error messages
- Responsive mobile/desktop layout

**Price Breakdown Display**:
- Base price
- Guest surcharge (if over minimum)
- Extended duration fee
- Travel fee (distance-based)
- Subtotal
- Platform fee (15%)
- Total amount

**API Integration**:
- GET `/api/vendors/{id}` - Fetch vendor details
- POST `/api/bookings/calculate-price` - Dynamic price calculation
- POST `/api/bookings` - Create booking

**Dependencies**: Button, Card, Input, Alert, Spinner, lucide-react icons

---

### Payment Checkout Page
**Path**: `app/(customer)/booking/[id]/payment/page.tsx`
**Description**: Secure payment checkout with Stripe Elements integration

**Features**:
- Stripe Elements card input
- Order summary with full event details
- Price breakdown display
- Platform fee disclosure
- Terms and conditions acceptance checkbox
- Payment processing with error handling
- Secure payment intent creation
- Redirect to confirmation on success
- Loading states and validation

**Stripe Integration**:
- `@stripe/stripe-js` for client-side
- `@stripe/react-stripe-js` for Elements components
- Payment intent creation via API
- Card payment confirmation
- Escrow payment flow

**API Integration**:
- GET `/api/bookings/{id}` - Fetch booking details
- POST `/api/payments` - Create payment intent

**Dependencies**: Stripe Elements, Button, Card, Alert, Spinner, Badge, lucide-react icons

---

### Booking Confirmation Page
**Path**: `app/(customer)/booking/[id]/confirmation/page.tsx`
**Description**: Success confirmation with booking details and calendar integration

**Features**:
- Success message with booking reference
- "What Happens Next" timeline (3 steps)
- Complete event details display
- Vendor information
- Total amount paid
- Add to calendar functionality (Google Calendar + ICS download)
- Share booking (Web Share API + clipboard fallback)
- Print booking
- Quick actions (View Details, Message Vendor)
- Copy booking ID to clipboard
- Important reminder about vendor response time

**Calendar Integration**:
- Google Calendar link generation
- ICS file generation and download
- Event details formatting (title, location, description, times)

**Actions**:
- Add to Google Calendar
- Download ICS file
- Share booking
- Print page
- View booking details
- Send message to vendor
- Book another truck

**Dependencies**: Button, Card, Alert, Spinner, Badge, Modal, date-fns, lucide-react icons

---

### Booking Details Page
**Path**: `app/(customer)/bookings/[id]/page.tsx`
**Description**: Comprehensive booking details with status timeline and management options

**Features**:
- Booking reference display
- Status badge with color coding
- Visual status timeline (4 steps: Pending → Accepted → Confirmed → Completed)
- Full event information
- Vendor contact information (email, phone, messaging)
- Complete price breakdown
- Cancel booking functionality with policy display
- Cancellation confirmation modal
- Refund calculation based on policy
- Mobile responsive layout

**Status Timeline**:
- Request Sent (Pending)
- Accepted by Vendor
- Payment Confirmed
- Event Completed
- Visual progress indicator with icons

**Cancellation Flow**:
- Cancel button (only for Pending/Accepted)
- Cancellation policy display
- Refund percentage calculation
- Confirmation modal with warning
- API call to cancel booking

**API Integration**:
- GET `/api/bookings/{id}` - Fetch booking details
- POST `/api/bookings/{id}/cancel` - Cancel booking

**Dependencies**: Button, Card, Alert, Spinner, Badge, Modal, date-fns, lucide-react icons

---

### Bookings List Page
**Path**: `app/(customer)/bookings/page.tsx`
**Description**: User's bookings dashboard with search, filtering, and grouped display

**Features**:
- Search by vendor name, event type, location, or booking ID
- Filter by status (All, Pending, Accepted, Confirmed, Completed, Cancelled)
- Grouped display (Upcoming Events / Past Events)
- Booking cards with key details
- Click to view full booking details
- Empty state with CTA
- No results state with clear filters option
- Mobile responsive cards
- Count badges for each group

**Booking Card Display**:
- Vendor name and event type
- Status badge
- Date and time
- Location (city, state)
- Guest count
- Total amount
- Booking creation date
- Interactive hover effect
- Right chevron for navigation

**Empty States**:
- No bookings: Browse food trucks CTA
- No results: Clear filters CTA

**API Integration**:
- GET `/api/bookings` - Fetch all user bookings

**Dependencies**: Button, Card, Alert, Spinner, Badge, date-fns, lucide-react icons

---

**Type Definitions**: Extended `types/index.ts` with booking types
- EventType enum
- BookingFormData interface
- PriceBreakdown interface
- BookingStatus enum
- BookingDetails interface
- BookingSummary interface

**Design Patterns**:
- Mobile-first responsive design
- Consistent card-based layouts
- Progressive disclosure of information
- Loading states for async operations
- Error handling with user-friendly messages
- Form validation with inline errors
- Accessible keyboard navigation
- ARIA labels and semantic HTML

**Used In**: Customer booking workflow

**Maintained By**: Parker_Pages

---

## Messaging System Components (Task Fleet-Feast-v16)
**Status**: Complete
**Agent**: Parker_Pages
**Date**: 2025-12-05

### UI Components Added
**Path**: `components/ui/`

#### Textarea Component
**Path**: `components/ui/Textarea.tsx`
**Description**: Multi-line text input with label, error states, helper text, and character count

**Props**:
- `label` (string): Label text above textarea
- `error` (string): Error message to display
- `helperText` (string): Helper text when no error
- `showCharCount` (boolean): Display character counter
- `maxLength` (number): Maximum character limit
- All standard textarea HTML attributes

**Features**:
- Character counter with maxLength
- Error state styling
- Helper text support
- ARIA attributes for accessibility
- Disabled state support

**Used In**: MessageComposer

#### Tooltip Component
**Path**: `components/ui/Tooltip.tsx`
**Description**: Hover/focus tooltip using Radix UI primitives

**Components**:
- `TooltipProvider` - Context provider for tooltips
- `Tooltip` - Main tooltip component
- `SimpleTooltip` - Convenience wrapper with provider

**Props**:
- `content` (React.ReactNode): Tooltip content
- `children` (React.ReactNode): Trigger element
- `side` (top | right | bottom | left): Tooltip position
- `delayDuration` (number): Delay before showing (ms)

**Features**:
- Radix UI primitives for accessibility
- Customizable positioning
- Arrow indicator
- Smooth animations
- Portal rendering

**Dependencies**: @radix-ui/react-tooltip

**Used In**: FlaggedWarning, throughout app

### Messaging Components
**Path**: `components/messages/`

#### FlaggedWarning Component
**Path**: `components/messages/FlaggedWarning.tsx`
**Description**: Warning indicator for flagged messages with tooltip

**Props**:
- `reason` (string): Why message was flagged

**Features**:
- Alert triangle icon
- Tooltip with detailed explanation
- Link to Terms of Service
- Accessible design

**Used In**: MessageBubble

#### MessageBubble Component
**Path**: `components/messages/MessageBubble.tsx`
**Description**: Single message display with sender info, timestamp, and flagged indicator

**Props**:
- `message` (object): Message data with id, content, createdAt, flagged, sender info
- `isOwn` (boolean): Whether message is from current user

**Features**:
- Different styling for own vs other messages
- Avatar display for other party
- Timestamp formatting
- Flagged message warnings
- Responsive max-width (80%)

**Used In**: MessageThread

#### MessageComposer Component
**Path**: `components/messages/MessageComposer.tsx`
**Description**: Message input with client-side validation and pre-send warnings

**Props**:
- `bookingId` (string): Booking ID for conversation
- `onSend` (function): Callback when message sent
- `disabled` (boolean): Disable composer (e.g., cancelled booking)

**Features**:
- Client-side pattern detection for:
  - Phone numbers
  - Email addresses
  - Social media handles
- Character limit (1000 chars)
- Character counter
- Warning alerts for flagged content
- Enter to send, Shift+Enter for new line
- Loading state during send
- Error handling
- Disabled state UI

**API Integration**: POST /api/messages

**Used In**: MessageThread

#### ConversationCard Component
**Path**: `components/messages/ConversationCard.tsx`
**Description**: Conversation preview for inbox list

**Props**:
- `bookingId` (string): Booking ID
- `otherParty` (object): Name and avatar
- `booking` (object): Event date, status, vendor info
- `lastMessage` (object): Content, timestamp, isFromMe
- `unreadCount` (number): Unread message count

**Features**:
- Avatar display
- Last message preview with "You:" prefix
- Booking context (vendor name, event date, status)
- Unread indicator (left border + badge)
- Status badge (confirmed/pending/cancelled)
- Relative time display
- Clickable card to thread
- Hover effects

**Used In**: Messages inbox pages

#### MessageThread Component
**Path**: `components/messages/MessageThread.tsx`
**Description**: Full conversation display with date grouping

**Props**:
- `bookingId` (string): Booking ID
- `messages` (array): Message data
- `currentUserId` (string): Current user ID
- `bookingStatus` (string): Booking status
- `isLoading` (boolean): Loading state
- `error` (string): Error message
- `onRefresh` (function): Refresh callback

**Features**:
- Messages grouped by date (Today, Yesterday, specific dates)
- Date separators
- Auto-scroll to latest message
- Auto-mark as read on view
- Empty state
- Loading state
- Error state
- Integrates MessageBubble and MessageComposer

**Used In**: Message thread pages

### Pages
**Paths**:
- `app/(customer)/messages/page.tsx` - Customer inbox
- `app/(customer)/messages/[bookingId]/page.tsx` - Customer thread
- `app/(vendor)/messages/page.tsx` - Vendor inbox
- `app/(vendor)/messages/[bookingId]/page.tsx` - Vendor thread

**Features**:
- Conversation list with real-time polling (30s)
- Message thread with real-time polling (5s)
- Loading and error states
- Empty states
- Back navigation
- Booking context in header
- Status badges
- Responsive design

**API Integration**:
- GET `/api/messages` - Fetch inbox
- GET `/api/messages/[bookingId]` - Fetch conversation
- POST `/api/messages` - Send message
- PUT `/api/messages/[bookingId]/read` - Mark as read

**Dependencies**:
- UI components: Button, Card, Badge, Alert, Spinner, Avatar, Textarea, Tooltip
- Messaging components: All listed above
- date-fns: Date formatting
- lucide-react: Icons (Send, ArrowLeft, AlertTriangle, Info)
- Next.js 14 App Router
- @radix-ui/react-tooltip

**Used In**: Both customer and vendor dashboards

**Maintained By**: Parker_Pages

---

*Last Updated: 2025-12-05*
