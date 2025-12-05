# Fleet Feast - Component Architecture Diagram
Version: 1.0
Date: 2025-12-03
Author: Alex_Architect

---

## Table of Contents
1. [High-Level System Architecture](#high-level-system-architecture)
2. [Frontend Component Architecture](#frontend-component-architecture)
3. [Backend Service Architecture](#backend-service-architecture)
4. [Data Layer Architecture](#data-layer-architecture)
5. [External Integration Architecture](#external-integration-architecture)
6. [Deployment Architecture](#deployment-architecture)
7. [Component Interaction Patterns](#component-interaction-patterns)

---

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             EXTERNAL ACTORS                                  │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐        │
│  │ Customer │      │  Vendor  │      │  Admin   │      │  System  │        │
│  │  (User)  │      │  (User)  │      │  (User)  │      │   Cron   │        │
│  └─────┬────┘      └─────┬────┘      └─────┬────┘      └─────┬────┘        │
└────────┼─────────────────┼─────────────────┼─────────────────┼──────────────┘
         │                 │                 │                 │
         │ HTTPS           │ HTTPS           │ HTTPS           │ Internal
         ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK (CDN)                            │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Static Assets: Images, CSS, JS bundles, Fonts                     │    │
│  │  Cache: Max-Age: 31536000, stale-while-revalidate                  │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────────────┐
│                        NEXT.JS APPLICATION (Vercel)                         │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                     MIDDLEWARE LAYER                                    │ │
│ │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ │
│ │  │ Auth Check   │→ │     RBAC     │→ │ Rate Limiter │                 │ │
│ │  └──────────────┘  └──────────────┘  └──────────────┘                 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌──────────────────────────────────┬──────────────────────────────────────┐ │
│ │      FRONTEND (Pages/SSR)        │       BACKEND (API Routes)           │ │
│ │                                  │                                      │ │
│ │  ┌─────────────────────────┐    │    ┌──────────────────────────┐     │ │
│ │  │   Public Pages          │    │    │   Auth Service           │     │ │
│ │  │   - Home                │    │    │   - Login/Register       │     │ │
│ │  │   - Search              │    │    │   - Password Reset       │     │ │
│ │  │   - Vendor Profile      │    │    │   - Email Verification   │     │ │
│ │  └─────────────────────────┘    │    └──────────────────────────┘     │ │
│ │                                  │                                      │ │
│ │  ┌─────────────────────────┐    │    ┌──────────────────────────┐     │ │
│ │  │   Customer Pages        │    │    │   Booking Service        │     │ │
│ │  │   - Dashboard           │◄───┼───►│   - Create Booking       │     │ │
│ │  │   - Bookings            │    │    │   - Accept/Decline       │     │ │
│ │  │   - Messages            │    │    │   - Cancel Booking       │     │ │
│ │  │   - Reviews             │    │    └──────────────────────────┘     │ │
│ │  └─────────────────────────┘    │                                      │ │
│ │                                  │    ┌──────────────────────────┐     │ │
│ │  ┌─────────────────────────┐    │    │   Payment Service        │     │ │
│ │  │   Vendor Pages          │    │    │   - Authorize Payment    │     │ │
│ │  │   - Dashboard           │◄───┼───►│   - Release Escrow       │     │ │
│ │  │   - Bookings            │    │    │   - Process Refund       │     │ │
│ │  │   - Calendar            │    │    │   - Webhook Handler      │     │ │
│ │  │   - Profile Settings    │    │    └──────────────────────────┘     │ │
│ │  └─────────────────────────┘    │                                      │ │
│ │                                  │    ┌──────────────────────────┐     │ │
│ │  ┌─────────────────────────┐    │    │   Vendor Service         │     │ │
│ │  │   Admin Pages           │    │    │   - Apply                │     │ │
│ │  │   - Vendor Approval     │◄───┼───►│   - Approve/Reject       │     │ │
│ │  │   - Dispute Resolution  │    │    │   - Update Profile       │     │ │
│ │  │   - Analytics           │    │    │   - Document Upload      │     │ │
│ │  │   - User Management     │    │    └──────────────────────────┘     │ │
│ │  └─────────────────────────┘    │                                      │ │
│ │                                  │    ┌──────────────────────────┐     │ │
│ │                                  │    │   Messaging Service      │     │ │
│ │                                  │    │   - Send Message         │     │ │
│ │                                  │    │   - Get Conversation     │     │ │
│ │                                  │    │   - Flag Message         │     │ │
│ │                                  │    │   - Content Filter       │     │ │
│ │                                  │    └──────────────────────────┘     │ │
│ │                                  │                                      │ │
│ │                                  │    ┌──────────────────────────┐     │ │
│ │                                  │    │   Search Service         │     │ │
│ │                                  │    │   - Vendor Search        │     │ │
│ │                                  │    │   - Filters/Facets       │     │ │
│ │                                  │    │   - Full-Text Search     │     │ │
│ │                                  │    └──────────────────────────┘     │ │
│ │                                  │                                      │ │
│ │                                  │    ┌──────────────────────────┐     │ │
│ │                                  │    │   Review Service         │     │ │
│ │                                  │    │   - Create Review        │     │ │
│ │                                  │    │   - Get Reviews          │     │ │
│ │                                  │    │   - Verify Booking       │     │ │
│ │                                  │    └──────────────────────────┘     │ │
│ │                                  │                                      │ │
│ │                                  │    ┌──────────────────────────┐     │ │
│ │                                  │    │   Admin Service          │     │ │
│ │                                  │    │   - Analytics            │     │ │
│ │                                  │    │   - Resolve Disputes     │     │ │
│ │                                  │    │   - Manage Violations    │     │ │
│ │                                  │    └──────────────────────────┘     │ │
│ └──────────────────────────────────┴──────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                        BACKGROUND JOBS (Vercel Cron + Inngest)          │ │
│ │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │ │
│ │  │ Release      │  │ Send Email   │  │ Detect       │  │ Cleanup   │  │ │
│ │  │ Escrow       │  │ Reminders    │  │ Patterns     │  │ Old Data  │  │ │
│ │  │ (daily)      │  │ (daily)      │  │ (daily)      │  │ (weekly)  │  │ │
│ │  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────────────┐
│                           DATA LAYER                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │   PostgreSQL 15+     │  │     Redis 7.x        │  │   AWS S3         │  │
│  │   (Neon/Railway)     │  │   (Upstash)          │  │   (File Storage) │  │
│  │                      │  │                      │  │                  │  │
│  │  - Users             │  │  - Sessions          │  │  - Vendor Photos │  │
│  │  - Vendors           │  │  - Cache             │  │  - Documents     │  │
│  │  - Bookings          │  │  - Rate Limits       │  │  - Menu Images   │  │
│  │  - Payments          │  │  - Feature Flags     │  │                  │  │
│  │  - Messages          │  │                      │  │                  │  │
│  │  - Reviews           │  │                      │  │                  │  │
│  │  - Disputes          │  │                      │  │                  │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ Stripe Connect   │  │ SendGrid / SES   │  │ Google Maps API  │          │
│  │ - Payments       │  │ - Transactional  │  │ - Geocoding      │          │
│  │ - Escrow         │  │   Emails         │  │ - Autocomplete   │          │
│  │ - Payouts        │  │ - Notifications  │  │ - Validation     │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│  ┌──────────────────┐  ┌──────────────────┐                                │
│  │ Sentry           │  │ Better Stack     │                                │
│  │ - Error Tracking │  │ - Logs           │                                │
│  │ - Performance    │  │ - Monitoring     │                                │
│  └──────────────────┘  └──────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Component Architecture

### Page Hierarchy

```
app/
├── (public)/                      # Public routes (no auth)
│   ├── layout.tsx                 # Public layout (nav, footer)
│   ├── page.tsx                   # Homepage
│   │   ├── HeroSection
│   │   ├── FeaturedVendors
│   │   ├── HowItWorks
│   │   └── CallToAction
│   ├── search/
│   │   ├── page.tsx               # Search page
│   │   │   ├── SearchBar
│   │   │   ├── FiltersSidebar
│   │   │   │   ├── CuisineFilter
│   │   │   │   ├── PriceRangeFilter
│   │   │   │   ├── EventTypeFilter
│   │   │   │   └── AvailabilityFilter
│   │   │   └── VendorGrid
│   │   │       └── VendorCard (multiple)
│   ├── vendors/
│   │   └── [id]/
│   │       ├── page.tsx           # Vendor profile (public)
│   │       │   ├── VendorHeader
│   │       │   │   ├── VendorLogo
│   │       │   │   ├── VendorName
│   │       │   │   └── RatingBadge
│   │       │   ├── PhotoGallery
│   │       │   ├── MenuSection
│   │       │   │   └── MenuItem (multiple)
│   │       │   ├── ReviewsList
│   │       │   │   └── ReviewCard (multiple)
│   │       │   └── BookingCTA
│   └── about/
│       ├── page.tsx               # About page
│       ├── privacy/page.tsx       # Privacy policy
│       └── terms/page.tsx         # Terms of service
│
├── (auth)/                        # Auth routes
│   ├── layout.tsx                 # Auth layout (centered card)
│   ├── login/
│   │   └── page.tsx
│   │       └── LoginForm
│   │           ├── EmailInput
│   │           ├── PasswordInput
│   │           └── SubmitButton
│   ├── register/
│   │   └── page.tsx
│   │       └── RegisterForm
│   │           ├── RoleSelector
│   │           ├── EmailInput
│   │           ├── PasswordInput
│   │           └── SubmitButton
│   ├── reset-password/
│   │   └── page.tsx
│   │       └── ResetPasswordForm
│   └── verify-email/
│       └── page.tsx
│           └── VerificationMessage
│
├── (customer)/                    # Customer-only routes
│   ├── layout.tsx                 # Customer layout (sidebar nav)
│   ├── dashboard/
│   │   └── page.tsx               # Customer dashboard
│   │       ├── UpcomingBookings
│   │       ├── PastBookings
│   │       ├── FavoriteVendors
│   │       └── QuickActions
│   ├── bookings/
│   │   ├── page.tsx               # Bookings list
│   │   │   └── BookingCard (multiple)
│   │   ├── [id]/
│   │   │   └── page.tsx           # Booking details
│   │   │       ├── BookingHeader
│   │   │       ├── BookingTimeline
│   │   │       ├── VendorInfo
│   │   │       ├── EventDetails
│   │   │       ├── PaymentInfo
│   │   │       └── BookingActions
│   │   │           ├── CancelButton
│   │   │           ├── MessageButton
│   │   │           └── ReviewButton
│   │   └── new/
│   │       └── page.tsx           # Create booking
│   │           └── BookingForm
│   │               ├── VendorSelector
│   │               ├── EventDatePicker
│   │               ├── EventTimePicker
│   │               ├── LocationInput
│   │               ├── GuestCountInput
│   │               ├── EventTypeSelector
│   │               ├── SpecialRequestsTextarea
│   │               └── SubmitButton
│   ├── messages/
│   │   ├── page.tsx               # Messages list
│   │   │   └── ConversationCard (multiple)
│   │   └── [bookingId]/
│   │       └── page.tsx           # Conversation
│   │           ├── MessageHeader
│   │           ├── MessageList
│   │           │   └── MessageBubble (multiple)
│   │           └── MessageInput
│   │               ├── Textarea
│   │               ├── SendButton
│   │               └── WarningBanner
│   └── favorites/
│       └── page.tsx               # Favorite vendors
│           └── VendorCard (multiple)
│
├── (vendor)/                      # Vendor-only routes
│   ├── layout.tsx                 # Vendor layout (sidebar nav)
│   ├── dashboard/
│   │   └── page.tsx               # Vendor dashboard
│   │       ├── PendingRequests
│   │       ├── UpcomingBookings
│   │       ├── RevenueChart
│   │       └── RecentReviews
│   ├── bookings/
│   │   ├── page.tsx               # Bookings list
│   │   │   ├── BookingFilters
│   │   │   └── BookingCard (multiple)
│   │   └── [id]/
│   │       └── page.tsx           # Booking details
│   │           ├── BookingHeader
│   │           ├── CustomerInfo
│   │           ├── EventDetails
│   │           ├── BookingActions
│   │           │   ├── AcceptButton
│   │           │   ├── DeclineButton
│   │           │   └── MessageButton
│   │           └── PaymentInfo
│   ├── calendar/
│   │   └── page.tsx               # Availability calendar
│   │       ├── CalendarView
│   │       │   ├── MonthSelector
│   │       │   ├── CalendarGrid
│   │       │   └── AvailabilityToggle
│   │       └── BookingsList
│   ├── profile/
│   │   └── page.tsx               # Profile settings
│   │       ├── ProfileForm
│   │       │   ├── BusinessNameInput
│   │       │   ├── CuisineTypeSelector
│   │       │   ├── DescriptionTextarea
│   │       │   ├── PhotoUploader
│   │       │   ├── MenuEditor
│   │       │   └── SaveButton
│   │       └── DocumentUploader
│   │           ├── LicenseUpload
│   │           ├── PermitUpload
│   │           └── InsuranceUpload
│   └── analytics/
│       └── page.tsx               # Analytics
│           ├── RevenueChart
│           ├── BookingStats
│           ├── PopularMenuItems
│           └── ReviewSentiment
│
└── (admin)/                       # Admin-only routes
    ├── layout.tsx                 # Admin layout (sidebar nav)
    ├── dashboard/
    │   └── page.tsx               # Admin dashboard
    │       ├── PlatformMetrics
    │       ├── RecentVendorApplications
    │       ├── ActiveDisputes
    │       └── RevenueChart
    ├── vendors/
    │   ├── page.tsx               # Vendor management
    │   │   ├── VendorFilters
    │   │   └── VendorTable
    │   ├── pending/
    │   │   └── page.tsx           # Pending applications
    │   │       └── ApplicationCard (multiple)
    │   │           ├── VendorInfo
    │   │           ├── DocumentViewer
    │   │           └── ApprovalActions
    │   └── [id]/
    │       └── page.tsx           # Vendor details
    │           ├── VendorProfile
    │           ├── BookingHistory
    │           ├── ViolationHistory
    │           └── AdminActions
    ├── disputes/
    │   ├── page.tsx               # Disputes list
    │   │   └── DisputeCard (multiple)
    │   └── [id]/
    │       └── page.tsx           # Dispute details
    │           ├── DisputeInfo
    │           ├── BookingDetails
    │           ├── MessageHistory
    │           └── ResolutionForm
    └── analytics/
        └── page.tsx               # Platform analytics
            ├── GMVChart
            ├── UserGrowthChart
            ├── BookingVolumeChart
            └── DisputeRateChart
```

### Shared Component Library

```
src/components/
├── ui/                            # Base UI components (shadcn/ui style)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Textarea.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   └── Spinner.tsx
│
├── forms/                         # Form components
│   ├── FormField.tsx
│   ├── FormError.tsx
│   ├── FormLabel.tsx
│   ├── DatePicker.tsx
│   ├── TimePicker.tsx
│   ├── FileUploader.tsx
│   └── RichTextEditor.tsx
│
├── layout/                        # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   ├── Container.tsx
│   └── Section.tsx
│
├── features/                      # Feature-specific components
│   ├── booking/
│   │   ├── BookingCard.tsx
│   │   ├── BookingForm.tsx
│   │   ├── BookingTimeline.tsx
│   │   └── CancellationModal.tsx
│   ├── vendor/
│   │   ├── VendorCard.tsx
│   │   ├── VendorProfile.tsx
│   │   ├── MenuEditor.tsx
│   │   └── AvailabilityCalendar.tsx
│   ├── messaging/
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   └── ConversationList.tsx
│   ├── review/
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewForm.tsx
│   │   ├── StarRating.tsx
│   │   └── ReviewsList.tsx
│   └── payment/
│       ├── PaymentForm.tsx
│       ├── StripeCheckout.tsx
│       └── PaymentReceipt.tsx
│
└── providers/                     # Context providers
    ├── AuthProvider.tsx
    ├── ToastProvider.tsx
    ├── QueryClientProvider.tsx
    └── ThemeProvider.tsx
```

---

## Backend Service Architecture

### Service Layer Structure

```
src/modules/
├── auth/
│   ├── auth.service.ts            # Authentication logic
│   │   ├── login()
│   │   ├── register()
│   │   ├── verifyEmail()
│   │   ├── resetPassword()
│   │   └── refreshToken()
│   ├── auth.middleware.ts         # Auth middleware
│   │   ├── requireAuth()
│   │   └── requireRole()
│   └── auth.utils.ts              # JWT, bcrypt helpers
│
├── booking/
│   ├── booking.service.ts         # Booking business logic
│   │   ├── createBooking()
│   │   ├── acceptBooking()
│   │   ├── declineBooking()
│   │   ├── cancelBooking()
│   │   ├── checkCancellationPolicy()
│   │   └── getBookingById()
│   ├── booking.validation.ts      # Zod schemas
│   └── booking.types.ts           # TypeScript types
│
├── payment/
│   ├── payment.service.ts         # Payment business logic
│   │   ├── authorizePayment()
│   │   ├── capturePayment()
│   │   ├── releaseEscrow()
│   │   ├── processRefund()
│   │   └── handleWebhook()
│   ├── stripe.client.ts           # Stripe API wrapper
│   ├── escrow.service.ts          # Escrow logic
│   │   ├── checkEscrowRelease()
│   │   └── calculatePlatformFee()
│   └── payment.types.ts
│
├── messaging/
│   ├── messaging.service.ts       # Messaging business logic
│   │   ├── sendMessage()
│   │   ├── getConversation()
│   │   ├── flagMessage()
│   │   └── checkContentFilter()
│   ├── content-filter.service.ts  # Anti-circumvention
│   │   ├── detectContactInfo()
│   │   ├── applyPatternDetection()
│   │   └── createViolation()
│   └── messaging.types.ts
│
├── vendor/
│   ├── vendor.service.ts          # Vendor business logic
│   │   ├── applyAsVendor()
│   │   ├── approveVendor()
│   │   ├── rejectVendor()
│   │   ├── updateProfile()
│   │   ├── uploadDocument()
│   │   └── getVendorById()
│   ├── onboarding.service.ts      # Stripe Connect onboarding
│   │   ├── createStripeAccount()
│   │   └── checkOnboardingStatus()
│   └── vendor.types.ts
│
├── search/
│   ├── search.service.ts          # Search business logic
│   │   ├── searchVendors()
│   │   ├── applyFilters()
│   │   ├── sortResults()
│   │   └── cacheResults()
│   └── search.types.ts
│
├── review/
│   ├── review.service.ts          # Review business logic
│   │   ├── createReview()
│   │   ├── getReviews()
│   │   ├── verifyBooking()
│   │   └── calculateRating()
│   └── review.types.ts
│
└── admin/
    ├── admin.service.ts           # Admin business logic
    │   ├── getPlatformMetrics()
    │   ├── resolveDispute()
    │   ├── manageViolation()
    │   └── generateReport()
    ├── analytics.service.ts       # Analytics calculations
    │   ├── calculateGMV()
    │   ├── getUserGrowth()
    │   └── getDisputeRate()
    └── admin.types.ts
```

### API Route Structure

```
app/api/
├── auth/
│   ├── [...nextauth]/route.ts     # NextAuth.js
│   ├── register/route.ts          # POST
│   ├── verify-email/route.ts      # GET
│   └── reset-password/route.ts    # POST
│
├── bookings/
│   ├── route.ts                   # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts               # GET, PATCH, DELETE
│       ├── accept/route.ts        # POST
│       ├── decline/route.ts       # POST
│       └── cancel/route.ts        # POST
│
├── payments/
│   ├── authorize/route.ts         # POST
│   ├── release/route.ts           # POST (cron)
│   ├── refund/route.ts            # POST
│   └── webhook/route.ts           # POST (Stripe)
│
├── vendors/
│   ├── route.ts                   # GET (search), POST (apply)
│   └── [id]/
│       ├── route.ts               # GET, PATCH, DELETE
│       ├── approve/route.ts       # POST (admin)
│       ├── documents/route.ts     # POST (upload)
│       └── stripe/
│           ├── onboard/route.ts   # POST
│           └── status/route.ts    # GET
│
├── messages/
│   ├── route.ts                   # GET (list), POST (send)
│   └── [id]/
│       ├── route.ts               # GET
│       └── flag/route.ts          # POST
│
├── reviews/
│   ├── route.ts                   # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts               # GET, PATCH, DELETE
│       └── verify/route.ts        # GET (check eligibility)
│
├── admin/
│   ├── vendors/
│   │   ├── pending/route.ts       # GET
│   │   └── [id]/
│   │       └── approve/route.ts   # POST
│   ├── disputes/
│   │   ├── route.ts               # GET (list)
│   │   └── [id]/
│   │       └── resolve/route.ts   # POST
│   └── analytics/
│       ├── gmv/route.ts           # GET
│       ├── users/route.ts         # GET
│       └── bookings/route.ts      # GET
│
└── upload/
    └── presigned-url/route.ts     # POST (generate S3 URL)
```

---

## Data Layer Architecture

### Database Component Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                        │
│                                                               │
│  ┌─────────────────────┐        ┌─────────────────────┐     │
│  │      Users          │        │      Vendors        │     │
│  │  - id (UUID)        │◄───────│  - id (UUID)        │     │
│  │  - email            │  1:1   │  - user_id (FK)     │     │
│  │  - password_hash    │        │  - business_name    │     │
│  │  - role (enum)      │        │  - cuisine_type     │     │
│  │  - created_at       │        │  - status           │     │
│  └─────────┬───────────┘        │  - approved_at      │     │
│            │                    │  - stripe_account_id│     │
│            │                    └──────────┬──────────┘     │
│            │                               │                │
│            │                               │ 1:N            │
│            │                               ▼                │
│            │                    ┌─────────────────────┐     │
│            │                    │  VendorDocuments    │     │
│            │                    │  - id               │     │
│            │                    │  - vendor_id (FK)   │     │
│            │                    │  - type             │     │
│            │                    │  - file_url         │     │
│            │                    │  - verified         │     │
│            │                    └─────────────────────┘     │
│            │                                                │
│            │ 1:N                              1:N           │
│            ▼                                  ▼             │
│  ┌─────────────────────┐        ┌─────────────────────┐     │
│  │     Bookings        │◄───────│   Availability      │     │
│  │  - id (UUID)        │  N:1   │  - id               │     │
│  │  - customer_id (FK) │        │  - vendor_id (FK)   │     │
│  │  - vendor_id (FK)   │        │  - date             │     │
│  │  - event_date       │        │  - is_available     │     │
│  │  - event_time       │        └─────────────────────┘     │
│  │  - location         │                                    │
│  │  - guest_count      │                                    │
│  │  - status (enum)    │                                    │
│  │  - total_amount     │                                    │
│  │  - created_at       │                                    │
│  └─────────┬───────────┘                                    │
│            │                                                │
│            │ 1:1                                            │
│            ▼                                                │
│  ┌─────────────────────┐                                    │
│  │     Payments        │                                    │
│  │  - id (UUID)        │                                    │
│  │  - booking_id (FK)  │                                    │
│  │  - stripe_intent_id │                                    │
│  │  - amount           │                                    │
│  │  - status (enum)    │                                    │
│  │  - captured_at      │                                    │
│  │  - released_at      │                                    │
│  │  - created_at       │                                    │
│  └─────────────────────┘                                    │
│            ▲                                                │
│            │                                                │
│            │ N:1                                            │
│            │                                                │
│  ┌─────────┴───────────┐        ┌─────────────────────┐     │
│  │     Messages        │        │      Reviews        │     │
│  │  - id (UUID)        │        │  - id               │     │
│  │  - booking_id (FK)  │        │  - booking_id (FK)  │     │
│  │  - sender_id (FK)   │        │  - reviewer_id (FK) │     │
│  │  - content          │        │  - reviewee_id (FK) │     │
│  │  - flagged          │        │  - rating (1-5)     │     │
│  │  - created_at       │        │  - content          │     │
│  └─────────────────────┘        │  - created_at       │     │
│                                 └─────────────────────┘     │
│  ┌─────────────────────┐        ┌─────────────────────┐     │
│  │    Violations       │        │     Disputes        │     │
│  │  - id               │        │  - id               │     │
│  │  - user_id (FK)     │        │  - booking_id (FK)  │     │
│  │  - type             │        │  - initiator_id (FK)│     │
│  │  - severity         │        │  - reason           │     │
│  │  - action_taken     │        │  - status           │     │
│  │  - created_at       │        │  - resolution       │     │
│  └─────────────────────┘        │  - resolved_at      │     │
│                                 └─────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### Redis Cache Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Redis Cache (Upstash)                    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Sessions (TTL: 30 days)                            │     │
│  │  - Key: session:{token}                             │     │
│  │  - Value: { userId, role, expiresAt }               │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Search Results (TTL: 5 minutes)                    │     │
│  │  - Key: search:{hash(query)}                        │     │
│  │  - Value: [vendor_ids]                              │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Vendor Profiles (TTL: 1 hour)                      │     │
│  │  - Key: vendor:{id}                                 │     │
│  │  - Value: { ...vendorData }                         │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Rate Limits (TTL: 1 hour)                          │     │
│  │  - Key: ratelimit:{userId|ip}:{endpoint}           │     │
│  │  - Value: request_count                             │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Feature Flags (TTL: 1 hour)                        │     │
│  │  - Key: flags                                       │     │
│  │  - Value: { feature: enabled }                      │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

---

## External Integration Architecture

### Stripe Connect Integration Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Stripe Connect Integration                 │
│                                                               │
│  ┌─────────────┐                                             │
│  │   Vendor    │                                             │
│  │  Applies    │                                             │
│  └──────┬──────┘                                             │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Admin Approves Vendor                              │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Create Stripe Connect Account (Standard)          │     │
│  │  POST /api/vendors/:id/stripe/onboard               │     │
│  │  - Stripe API: accounts.create()                    │     │
│  │  - Generate onboarding link                         │     │
│  │  - Send email to vendor                             │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Vendor Completes Stripe Onboarding                │     │
│  │  (External Stripe-hosted flow)                      │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Stripe Webhook: account.updated                   │     │
│  │  POST /api/payments/webhook                         │     │
│  │  - Update vendor: stripe_connected = true           │     │
│  │  - Enable booking acceptance                        │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────┐                                             │
│  │  Customer   │                                             │
│  │  Books      │                                             │
│  │  Vendor     │                                             │
│  └──────┬──────┘                                             │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Authorize Payment (Escrow)                         │     │
│  │  POST /api/payments/authorize                       │     │
│  │  - Stripe API: paymentIntents.create()              │     │
│  │    - amount: $1000                                  │     │
│  │    - application_fee: $150 (15%)                    │     │
│  │    - transfer_destination: vendor_stripe_account    │     │
│  │    - capture_method: manual                         │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Customer Confirms Payment (Stripe Elements)       │     │
│  │  - Card tokenized by Stripe (PCI compliant)         │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Stripe Webhook: payment_intent.succeeded          │     │
│  │  - Update payment status: AUTHORIZED                │     │
│  │  - Funds authorized, NOT captured yet (escrow)      │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Event Occurs + 7 Day Dispute Window                │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Release Escrow (Daily Cron Job)                    │     │
│  │  POST /api/payments/release                         │     │
│  │  - Check: event_date + 7 days < today               │     │
│  │  - Check: no active disputes                        │     │
│  │  - Stripe API: paymentIntents.capture()             │     │
│  │  - Platform captures payment                        │     │
│  │  - Stripe auto-transfers to vendor (minus 15%)      │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Vendor Receives Payout                             │     │
│  │  - Stripe deposits to vendor's bank account         │     │
│  │  - Platform retains 15% commission                  │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### Email Integration Flow

```
┌──────────────────────────────────────────────────────────────┐
│                 Email Service Integration                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Trigger Event (e.g., Booking Created)             │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Email Service                                      │     │
│  │  src/modules/email/email.service.ts                 │     │
│  │  - Select template                                  │     │
│  │  - Populate data                                    │     │
│  │  - Add personalization                              │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Primary: SendGrid API                              │     │
│  │  POST https://api.sendgrid.com/v3/mail/send        │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                    Success│        Error                     │
│                         ▼             ▼                      │
│  ┌─────────────────┐   │   ┌─────────────────────────┐      │
│  │  Email Sent     │   │   │  Circuit Breaker        │      │
│  │  Log Success    │   │   │  (3 failures/5 min)     │      │
│  └─────────────────┘   │   └──────────┬──────────────┘      │
│                        │              │                      │
│                        │              ▼                      │
│                        │   ┌─────────────────────────┐      │
│                        │   │  Fallback: AWS SES      │      │
│                        │   │  SMTP: ses.amazonaws    │      │
│                        │   └──────────┬──────────────┘      │
│                        │              │                      │
│                        ▼              ▼                      │
│                   ┌─────────────────────────┐               │
│                   │  Track Delivery Status  │               │
│                   │  - Webhook from SendGrid │               │
│                   │  - Log to database       │               │
│                   └─────────────────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Production Deployment Topology

```
┌──────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                         │
│                    (Source Code + CI/CD Config)                   │
└─────────────────────────────┬────────────────────────────────────┘
                              │ Push to main branch
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      GitHub Actions CI/CD                         │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  1. Run Tests (Vitest + Playwright)                    │      │
│  │  2. Build Next.js App                                  │      │
│  │  3. Run Database Migrations (Prisma)                   │      │
│  │  4. Deploy to Vercel                                   │      │
│  └────────────────────────────────────────────────────────┘      │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                          Vercel Platform                          │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  Edge Network (CDN)                                    │      │
│  │  - Static assets cached globally                       │      │
│  │  - Automatic HTTPS                                     │      │
│  │  - DDoS protection                                     │      │
│  └────────────────────────────────────────────────────────┘      │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  Serverless Functions (API Routes)                     │      │
│  │  - Auto-scaling                                        │      │
│  │  - Region: US East (iad1)                              │      │
│  │  - Memory: 1024 MB                                     │      │
│  │  - Timeout: 10 seconds                                 │      │
│  └────────────────────────────────────────────────────────┘      │
└─────────────────────────────┬────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Neon Postgres │  │  Upstash Redis │  │    AWS S3      │
│  (Database)    │  │   (Cache)      │  │ (File Storage) │
│  - Serverless  │  │  - Serverless  │  │  - CloudFront  │
│  - Auto-scale  │  │  - Global      │  │    CDN         │
│  - Backups     │  │  - Pay-per-use │  │  - Signed URLs │
└────────────────┘  └────────────────┘  └────────────────┘

┌────────────────────────────────────────────────────────────┐
│             External Services (via HTTPS)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Stripe     │  │   SendGrid   │  │ Google Maps  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│             Monitoring & Observability                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Sentry     │  │ Better Stack │  │   Vercel     │    │
│  │  (Errors)    │  │   (Logs)     │  │ (Analytics)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Patterns

### Request Flow: Customer Creates Booking

```
Customer Browser
     │
     │ POST /api/bookings
     │ { vendorId, eventDate, location, guestCount, ... }
     ▼
Next.js Middleware
     │
     ├─► requireAuth() → Verify JWT token
     │   └─► Attach user to request context
     │
     ├─► requireRole('customer') → Check role
     │
     └─► rateLimit() → Check rate limit (Redis)
         └─► Allow if < 100 requests/min
     │
     ▼
API Route: /api/bookings/route.ts
     │
     ├─► Validate request body (Zod schema)
     │
     ├─► Call BookingService.createBooking()
     │   │
     │   ▼
     │   BookingService
     │   │
     │   ├─► Check vendor availability (DB query)
     │   │
     │   ├─► Create booking record (Prisma)
     │   │
     │   ├─► Send notification to vendor (Email)
     │   │
     │   └─► Return booking object
     │
     ├─► Return 201 Created
     │   { booking: { id, status, ... } }
     │
     ▼
Customer Browser
     │
     └─► Display success message
         └─► Navigate to booking details page
```

### Request Flow: Vendor Accepts Booking → Payment Authorization

```
Vendor Browser
     │
     │ POST /api/bookings/:id/accept
     ▼
Next.js Middleware
     │
     ├─► requireAuth()
     ├─► requireRole('vendor')
     └─► rateLimit()
     │
     ▼
API Route: /api/bookings/[id]/accept/route.ts
     │
     ├─► Validate booking ownership (vendor_id matches)
     │
     ├─► Call BookingService.acceptBooking()
     │   │
     │   ▼
     │   BookingService
     │   │
     │   ├─► Update booking status: ACCEPTED
     │   │
     │   ├─► Notify customer (Email)
     │   │
     │   └─► Trigger payment authorization
     │       │
     │       ▼
     │       PaymentService.authorizePayment()
     │       │
     │       ├─► Calculate total amount
     │       │
     │       ├─► Create Stripe PaymentIntent
     │       │   │
     │       │   └─► POST https://api.stripe.com/v1/payment_intents
     │       │       {
     │       │         amount: 100000,  // $1000.00
     │       │         application_fee: 15000,  // 15%
     │       │         transfer_destination: vendor_stripe_account,
     │       │         capture_method: 'manual'  // Escrow
     │       │       }
     │       │
     │       ├─► Save payment record (DB)
     │       │   { booking_id, stripe_intent_id, status: AUTHORIZED }
     │       │
     │       └─► Return payment intent client_secret
     │
     ├─► Return 200 OK
     │   {
     │     booking: { id, status: 'ACCEPTED', ... },
     │     payment: { clientSecret: '...' }
     │   }
     │
     ▼
Vendor Browser → Customer Browser (via email notification)
     │
     │ Customer clicks payment link
     ▼
Payment Page
     │
     │ Stripe Elements (client-side)
     │ Customer enters card details
     │ Stripe tokenizes card (PCI compliant)
     │
     │ POST https://api.stripe.com/v1/payment_intents/:id/confirm
     ▼
Stripe Webhook → /api/payments/webhook
     │
     │ Event: payment_intent.succeeded
     │
     ├─► Verify webhook signature
     │
     ├─► Update payment status: AUTHORIZED
     │
     ├─► Update booking status: PAYMENT_CONFIRMED
     │
     ├─► Notify customer + vendor (Email)
     │
     └─► Start 7-day escrow period
```

### Cron Job Flow: Release Escrow

```
Daily Cron Job (Vercel Cron / Inngest)
     │
     │ Trigger: Every day at 2:00 AM UTC
     ▼
API Route: /api/payments/release/route.ts
     │
     ├─► Authenticate (internal API key)
     │
     ├─► Query eligible payments
     │   SELECT * FROM payments
     │   WHERE status = 'AUTHORIZED'
     │     AND created_at < NOW() - INTERVAL '7 days'
     │     AND NOT EXISTS (
     │       SELECT 1 FROM disputes
     │       WHERE booking_id = payments.booking_id
     │       AND status = 'OPEN'
     │     )
     │
     ├─► For each eligible payment:
     │   │
     │   ▼
     │   PaymentService.releaseEscrow(payment)
     │   │
     │   ├─► Capture Stripe PaymentIntent
     │   │   POST https://api.stripe.com/v1/payment_intents/:id/capture
     │   │
     │   ├─► Stripe automatically transfers to vendor
     │   │   - Vendor receives 85% ($850)
     │   │   - Platform retains 15% ($150)
     │   │
     │   ├─► Update payment status: RELEASED
     │   │
     │   ├─► Update booking status: COMPLETED
     │   │
     │   ├─► Notify vendor (Email: "Payment received")
     │   │
     │   └─► Notify customer (Email: "Review reminder")
     │
     ├─► Log results
     │   { released: 47, failed: 2, skipped: 3 }
     │
     └─► Return 200 OK
```

---

*Document maintained by: Alex_Architect*
*Last updated: 2025-12-03*
*Version: 1.0*
