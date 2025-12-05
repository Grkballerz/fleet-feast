# Fleet Feast - Data Flow Diagrams
Version: 1.0
Date: 2025-12-03
Author: Alex_Architect

---

## Table of Contents
1. [User Journey Overview](#user-journey-overview)
2. [Customer Booking Journey](#customer-booking-journey)
3. [Vendor Onboarding Journey](#vendor-onboarding-journey)
4. [Payment & Escrow Flow](#payment--escrow-flow)
5. [Messaging & Anti-Circumvention Flow](#messaging--anti-circumvention-flow)
6. [Review & Rating Flow](#review--rating-flow)
7. [Dispute Resolution Flow](#dispute-resolution-flow)
8. [Admin Vendor Approval Flow](#admin-vendor-approval-flow)
9. [Data Flow Patterns](#data-flow-patterns)

---

## User Journey Overview

This document maps all major user journeys through the Fleet Feast platform, showing how data flows between components, services, and external systems.

**Key:**
- `[Actor]` = User or system initiating action
- `→` = Data flow direction
- `{Service}` = Backend service processing data
- `[DB]` = Database operation
- `[External]` = External API/service
- `⚠️` = Security checkpoint
- `✉️` = Email notification

---

## Customer Booking Journey

### Journey: Customer searches for vendor → Books event → Pays → Event occurs → Leaves review

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 1: SEARCH & DISCOVERY                          │
└─────────────────────────────────────────────────────────────────────────┘

[Customer] (Unauthenticated)
     │
     │ Navigate to /search
     ▼
┌──────────────────────────────────────┐
│  Search Page (SSR)                   │
│  - Load search form                  │
│  - Display filters                   │
└─────────────┬────────────────────────┘
              │
              │ User enters search criteria:
              │ - Cuisine: "Mexican"
              │ - Date: "2025-12-15"
              │ - Guest count: 50
              │ - Location: "Manhattan, NY"
              ▼
┌──────────────────────────────────────┐
│  Client-side Form Submission         │
│  GET /api/vendors?cuisine=mexican&   │
│      date=2025-12-15&guests=50&...   │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {SearchService}                                             │
│                                                              │
│  1. Check Redis cache for search results                    │
│     Key: search:hash(query_params)                          │
│     └─► Cache HIT → Return cached results                   │
│     └─► Cache MISS → Query database                         │
│                                                              │
│  2. Query PostgreSQL:                                       │
│     SELECT v.*, AVG(r.rating) as avg_rating                 │
│     FROM vendors v                                          │
│     LEFT JOIN reviews r ON r.reviewee_id = v.id             │
│     WHERE v.cuisine_type = 'mexican'                        │
│       AND v.capacity_min <= 50                              │
│       AND v.capacity_max >= 50                              │
│       AND v.status = 'ACTIVE'                               │
│       AND EXISTS (                                          │
│         SELECT 1 FROM availability a                        │
│         WHERE a.vendor_id = v.id                            │
│         AND a.date = '2025-12-15'                           │
│         AND a.is_available = true                           │
│       )                                                     │
│     GROUP BY v.id                                           │
│     ORDER BY avg_rating DESC, v.created_at DESC             │
│     LIMIT 20                                                │
│                                                              │
│  3. Cache results in Redis (TTL: 5 minutes)                 │
│                                                              │
│  4. Return vendor list                                      │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  Client receives results             │
│  - Display vendor cards              │
│  - Show ratings, photos, pricing     │
└─────────────┬────────────────────────┘
              │
              │ Customer clicks vendor card
              ▼
┌──────────────────────────────────────┐
│  Navigate to /vendors/[id]           │
│  (Public vendor profile)             │
│                                      │
│  Server-side data fetching:          │
│  1. GET vendor details               │
│  2. GET vendor reviews               │
│  3. GET vendor availability          │
│  4. GET vendor menu                  │
│                                      │
│  Display:                            │
│  - Photos, description               │
│  - Menu with pricing                 │
│  - Reviews (paginated)               │
│  - Availability calendar             │
│  - "Request Booking" CTA             │
└─────────────┬────────────────────────┘
              │
              │ Customer clicks "Request Booking"
              ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                  PHASE 2: AUTHENTICATION (if needed)                    │
└─────────────────────────────────────────────────────────────────────────┘

⚠️ Check Authentication
     │
     ├─► Authenticated? → Skip to booking form
     │
     └─► Not authenticated? → Redirect to /login
         │
         ▼
┌──────────────────────────────────────┐
│  Login Page                          │
│  - Email input                       │
│  - Password input                    │
│  - "Don't have account?" → Register  │
└─────────────┬────────────────────────┘
              │
              │ Submit login form
              │ POST /api/auth/login
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {AuthService}                                               │
│                                                              │
│  1. Validate email format                                   │
│  2. Query user by email:                                    │
│     SELECT * FROM users WHERE email = ?                     │
│  3. Verify password (bcrypt.compare)                        │
│  4. Generate JWT token                                      │
│  5. Store session in Redis:                                 │
│     Key: session:{token_id}                                 │
│     Value: { userId, role, expiresAt }                      │
│     TTL: 30 days                                            │
│  6. Set HTTP-only secure cookie                             │
│  7. Return user data                                        │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  Client stores user in state         │
│  Redirect to booking form            │
└─────────────┬────────────────────────┘
              │
              ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                   PHASE 3: CREATE BOOKING REQUEST                       │
└─────────────────────────────────────────────────────────────────────────┘

[Customer] (Authenticated)
     │
     │ Navigate to /bookings/new?vendorId={id}
     ▼
┌──────────────────────────────────────┐
│  Booking Form                        │
│  - Pre-filled vendor                 │
│  - Event date picker                 │
│  - Event time picker                 │
│  - Location (Google Maps API)        │
│  - Guest count                       │
│  - Event type (dropdown)             │
│  - Special requests (textarea)       │
└─────────────┬────────────────────────┘
              │
              │ Submit booking request
              │ POST /api/bookings
              │ {
              │   vendorId: "uuid",
              │   eventDate: "2025-12-15",
              │   eventTime: "18:00",
              │   location: "Central Park, NY",
              │   guestCount: 50,
              │   eventType: "corporate",
              │   specialRequests: "Vegetarian options"
              │ }
              ▼
⚠️ Middleware: requireAuth(), requireRole('customer'), rateLimit()
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {BookingService}                                            │
│                                                              │
│  1. Validate request (Zod schema)                           │
│  2. Check vendor exists and is active                       │
│  3. Check vendor availability for date                      │
│  4. Check vendor capacity (min/max guests)                  │
│  5. Validate location (Google Maps Geocoding API)           │
│     [External] POST https://maps.googleapis.com/geocode     │
│     → Confirm within NYC bounds                             │
│  6. Calculate estimated price (vendor pricing model)        │
│  7. Create booking record:                                  │
│     [DB] INSERT INTO bookings (                             │
│       id, customer_id, vendor_id, event_date,               │
│       event_time, location, guest_count,                    │
│       event_type, special_requests, status,                 │
│       total_amount, created_at                              │
│     ) VALUES (...)                                          │
│     Status: PENDING                                         │
│  8. Update vendor availability:                             │
│     [DB] UPDATE availability                                │
│     SET is_available = false                                │
│     WHERE vendor_id = ? AND date = ?                        │
│  9. Send notification to vendor:                            │
│     ✉️ {EmailService}.sendBookingRequest(booking)           │
│     [External] POST https://api.sendgrid.com/v3/mail/send   │
│     Template: "booking-request"                             │
│     To: vendor.email                                        │
│     Data: { customerName, eventDate, guestCount, ... }      │
│ 10. Return booking object                                   │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  Client receives booking             │
│  - Show success message              │
│  - Navigate to /bookings/[id]        │
│  - Status: "Pending Vendor Approval" │
└──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                   PHASE 4: VENDOR ACCEPTS BOOKING                       │
└─────────────────────────────────────────────────────────────────────────┘

[Vendor] (Receives email notification)
     │
     │ Clicks "View Booking Request" in email
     │ → Redirects to /vendor/bookings/[id]
     ▼
┌──────────────────────────────────────┐
│  Vendor Booking Details Page         │
│  - Customer info                     │
│  - Event details                     │
│  - Pricing estimate                  │
│  - Accept / Decline buttons          │
└─────────────┬────────────────────────┘
              │
              │ Vendor clicks "Accept"
              │ POST /api/bookings/[id]/accept
              ▼
⚠️ Middleware: requireAuth(), requireRole('vendor')
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {BookingService}                                            │
│                                                              │
│  1. Validate vendor owns this booking                       │
│  2. Check booking status is PENDING                         │
│  3. Update booking:                                         │
│     [DB] UPDATE bookings                                    │
│     SET status = 'ACCEPTED', accepted_at = NOW()            │
│     WHERE id = ?                                            │
│  4. Notify customer:                                        │
│     ✉️ {EmailService}.sendBookingAcceptance(booking)        │
│     Template: "booking-accepted"                            │
│     To: customer.email                                      │
│     Data: { vendorName, eventDate, paymentLink, ... }       │
│  5. Trigger payment authorization:                          │
│     → {PaymentService}.authorizePayment(booking)            │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                     PHASE 5: PAYMENT AUTHORIZATION                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  {PaymentService}.authorizePayment(booking)                  │
│                                                              │
│  1. Calculate total amount:                                 │
│     basePrice = booking.vendor.pricePerGuest * guestCount   │
│     platformFee = basePrice * 0.15                          │
│     totalAmount = basePrice + platformFee                   │
│                                                              │
│  2. Create Stripe PaymentIntent:                            │
│     [External] POST https://api.stripe.com/v1/payment_intents│
│     {                                                        │
│       amount: totalAmount * 100,  // cents                  │
│       currency: "usd",                                      │
│       application_fee_amount: platformFee * 100,            │
│       transfer_data: {                                      │
│         destination: vendor.stripe_account_id               │
│       },                                                    │
│       capture_method: "manual",  // ESCROW                  │
│       metadata: {                                           │
│         bookingId: booking.id,                              │
│         customerId: customer.id,                            │
│         vendorId: vendor.id                                 │
│       }                                                     │
│     }                                                       │
│     → Receives: { id: "pi_...", client_secret: "..." }      │
│                                                              │
│  3. Create payment record:                                  │
│     [DB] INSERT INTO payments (                             │
│       id, booking_id, stripe_intent_id,                     │
│       amount, platform_fee, vendor_payout,                  │
│       status, created_at                                    │
│     ) VALUES (                                              │
│       uuid(), booking.id, "pi_...",                         │
│       totalAmount, platformFee, basePrice,                  │
│       'CREATED', NOW()                                      │
│     )                                                       │
│                                                              │
│  4. Return payment intent client_secret to customer         │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
[Customer] (Receives email with payment link)
     │
     │ Clicks "Complete Payment"
     │ → Redirects to /bookings/[id]/payment
     ▼
┌──────────────────────────────────────┐
│  Payment Page                        │
│  - Booking summary                   │
│  - Total amount                      │
│  - Stripe Elements (card form)       │
└─────────────┬────────────────────────┘
              │
              │ Customer enters card details
              │ Client-side Stripe.js tokenizes card
              │ POST https://api.stripe.com/v1/payment_intents/:id/confirm
              │ (Client-side, direct to Stripe)
              ▼
[External] Stripe processes payment
     │
     │ Payment successful
     │ Stripe sends webhook
     ▼
POST /api/payments/webhook
     │ Event: payment_intent.succeeded
     │ Payload: { id: "pi_...", status: "succeeded", ... }
     ▼
⚠️ Verify webhook signature (Stripe secret)
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  {PaymentService}.handleWebhook(event)                       │
│                                                              │
│  1. Find payment by stripe_intent_id                        │
│  2. Update payment status:                                  │
│     [DB] UPDATE payments                                    │
│     SET status = 'AUTHORIZED', authorized_at = NOW()        │
│     WHERE stripe_intent_id = ?                              │
│  3. Update booking status:                                  │
│     [DB] UPDATE bookings                                    │
│     SET status = 'PAYMENT_CONFIRMED'                        │
│     WHERE id = ?                                            │
│  4. Notify customer:                                        │
│     ✉️ {EmailService}.sendPaymentReceipt(payment)           │
│  5. Notify vendor:                                          │
│     ✉️ {EmailService}.sendBookingConfirmed(booking)         │
│  6. Start escrow period (7 days post-event)                 │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      PHASE 6: EVENT OCCURS                              │
└─────────────────────────────────────────────────────────────────────────┘

[Time passes → Event date arrives]
     │
     │ Event occurs (vendor caters event)
     ▼
[7-day dispute window begins]
     │
     │ No disputes raised
     ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 7: ESCROW RELEASE (Automated)                  │
└─────────────────────────────────────────────────────────────────────────┘

[Daily Cron Job] (2:00 AM UTC)
     │
     │ POST /api/payments/release
     ▼
┌──────────────────────────────────────────────────────────────┐
│  {PaymentService}.releaseEscrow()                            │
│                                                              │
│  1. Query eligible payments:                                │
│     [DB] SELECT p.*, b.event_date                           │
│     FROM payments p                                         │
│     JOIN bookings b ON b.id = p.booking_id                  │
│     WHERE p.status = 'AUTHORIZED'                           │
│       AND b.event_date < NOW() - INTERVAL '7 days'          │
│       AND NOT EXISTS (                                      │
│         SELECT 1 FROM disputes d                            │
│         WHERE d.booking_id = b.id                           │
│         AND d.status = 'OPEN'                               │
│       )                                                     │
│                                                              │
│  2. For each eligible payment:                              │
│     a. Capture Stripe PaymentIntent:                        │
│        [External] POST /v1/payment_intents/:id/capture      │
│        → Stripe automatically transfers to vendor account   │
│           - Vendor receives: 85% ($850 if $1000 booking)    │
│           - Platform retains: 15% ($150)                    │
│                                                              │
│     b. Update payment status:                               │
│        [DB] UPDATE payments                                 │
│        SET status = 'RELEASED', released_at = NOW()         │
│        WHERE id = ?                                         │
│                                                              │
│     c. Update booking status:                               │
│        [DB] UPDATE bookings                                 │
│        SET status = 'COMPLETED'                             │
│        WHERE id = ?                                         │
│                                                              │
│     d. Notify vendor:                                       │
│        ✉️ {EmailService}.sendPayoutNotification(payment)    │
│        Subject: "Payment received: $850"                    │
│                                                              │
│     e. Notify customer:                                     │
│        ✉️ {EmailService}.sendReviewReminder(booking)        │
│        Subject: "How was your experience?"                  │
│                                                              │
│  3. Log results                                             │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      PHASE 8: LEAVE REVIEW                              │
└─────────────────────────────────────────────────────────────────────────┘

[Customer] (Receives review reminder email)
     │
     │ Clicks "Leave Review" in email
     │ → Redirects to /bookings/[id]/review
     ▼
┌──────────────────────────────────────┐
│  Review Form                         │
│  - Star rating (1-5)                 │
│  - Written review (textarea)         │
│  - Submit button                     │
└─────────────┬────────────────────────┘
              │
              │ Submit review
              │ POST /api/reviews
              │ {
              │   bookingId: "uuid",
              │   rating: 5,
              │   content: "Amazing food! Highly recommend."
              │ }
              ▼
⚠️ Middleware: requireAuth(), requireRole('customer')
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {ReviewService}                                             │
│                                                              │
│  1. Verify booking exists and belongs to customer           │
│  2. Verify booking is completed (status: COMPLETED)         │
│  3. Check customer hasn't already reviewed                  │
│  4. Validate rating (1-5) and content (< 1000 chars)        │
│  5. Create review:                                          │
│     [DB] INSERT INTO reviews (                              │
│       id, booking_id, reviewer_id, reviewee_id,             │
│       rating, content, created_at                           │
│     ) VALUES (                                              │
│       uuid(), booking.id, customer.id, vendor.id,           │
│       5, "Amazing food!", NOW()                             │
│     )                                                       │
│  6. Update vendor average rating:                           │
│     [DB] UPDATE vendors                                     │
│     SET avg_rating = (                                      │
│       SELECT AVG(rating) FROM reviews                       │
│       WHERE reviewee_id = vendor.id                         │
│     )                                                       │
│     WHERE id = vendor.id                                    │
│  7. Invalidate vendor cache (Redis):                        │
│     DEL vendor:{vendor.id}                                  │
│  8. Notify vendor:                                          │
│     ✉️ {EmailService}.sendNewReviewNotification(review)     │
│  9. Return review object                                    │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  Client receives review              │
│  - Show success message              │
│  - Display review on vendor profile  │
└──────────────────────────────────────┘

END OF CUSTOMER BOOKING JOURNEY
```

---

## Vendor Onboarding Journey

### Journey: Vendor applies → Admin approves → Stripe Connect setup → Ready for bookings

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 1: VENDOR APPLICATION                          │
└─────────────────────────────────────────────────────────────────────────┘

[Vendor] (New user)
     │
     │ Navigate to /register
     ▼
┌──────────────────────────────────────┐
│  Registration Form                   │
│  - Role selector: "Vendor"           │
│  - Email                             │
│  - Password                          │
│  - Business name                     │
│  - Cuisine type                      │
└─────────────┬────────────────────────┘
              │
              │ Submit registration
              │ POST /api/auth/register
              │ { role: "VENDOR", email, password, ... }
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {AuthService}                                               │
│                                                              │
│  1. Validate email is unique                                │
│  2. Hash password (bcrypt, cost: 12)                        │
│  3. Create user record:                                     │
│     [DB] INSERT INTO users (                                │
│       id, email, password_hash, role, status, created_at    │
│     ) VALUES (                                              │
│       uuid(), email, hash, 'VENDOR', 'PENDING', NOW()       │
│     )                                                       │
│  4. Create vendor record:                                   │
│     [DB] INSERT INTO vendors (                              │
│       id, user_id, business_name, cuisine_type,             │
│       status, created_at                                    │
│     ) VALUES (                                              │
│       uuid(), user.id, "Taco Truck", "mexican",             │
│       'PENDING_APPROVAL', NOW()                             │
│     )                                                       │
│  5. Send verification email:                                │
│     ✉️ {EmailService}.sendEmailVerification(user)           │
│  6. Generate JWT token, set cookie                          │
│  7. Return user object                                      │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
[Vendor] (Logged in, but pending approval)
     │
     │ Redirected to /vendor/onboarding
     ▼
┌──────────────────────────────────────┐
│  Vendor Onboarding Wizard            │
│  Step 1: Business Details            │
│  - Business name ✓ (from registration)│
│  - Cuisine type ✓                    │
│  - Description (textarea)            │
│  - Capacity (min/max guests)         │
│  - Price range                       │
└─────────────┬────────────────────────┘
              │
              │ Continue to Step 2
              ▼
┌──────────────────────────────────────┐
│  Step 2: Photos & Menu               │
│  - Upload truck photos               │
│  - Upload logo                       │
│  - Add menu items (name, price)      │
└─────────────┬────────────────────────┘
              │
              │ Upload photos
              │ POST /api/upload/presigned-url
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {UploadService}                                             │
│                                                              │
│  1. Validate file type (jpg, png, max 5MB)                  │
│  2. Generate S3 presigned URL:                              │
│     [External] AWS S3 SDK                                   │
│     s3.getSignedUrl('putObject', {                          │
│       Bucket: 'fleet-feast-production',                     │
│       Key: `vendor-profiles/${vendor.id}/photo-1.jpg`,      │
│       Expires: 300  // 5 minutes                            │
│     })                                                      │
│  3. Return upload URL                                       │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
[Client] Uploads directly to S3 using presigned URL
     │
     │ Upload complete
     │ POST /api/vendors/[id]
     │ { photoUrls: ["https://s3.../photo-1.jpg"] }
     ▼
┌──────────────────────────────────────────────────────────────┐
│  {VendorService}                                             │
│  - Update vendor record with photo URLs                     │
│  - Save menu items (JSON column)                            │
└──────────────────────────────────────────────────────────────┘
              │
              │ Continue to Step 3
              ▼
┌──────────────────────────────────────┐
│  Step 3: Documents                   │
│  - Business license (PDF)            │
│  - Health permit (PDF)               │
│  - Liability insurance (PDF)         │
│  - Food handler certs (PDF)          │
└─────────────┬────────────────────────┘
              │
              │ Upload documents (same S3 presigned URL flow)
              │ POST /api/vendors/[id]/documents
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {VendorService}                                             │
│                                                              │
│  1. Generate S3 presigned URLs for each document            │
│  2. Client uploads to S3                                    │
│  3. Create document records:                                │
│     [DB] INSERT INTO vendor_documents (                     │
│       id, vendor_id, type, file_url, verified, created_at   │
│     ) VALUES (                                              │
│       uuid(), vendor.id, 'business_license',                │
│       's3://...', false, NOW()                              │
│     )                                                       │
│  4. Notify admin of new application:                        │
│     ✉️ {EmailService}.sendAdminNotification(vendor)         │
│     To: admin@fleetfeast.com                                │
│     Subject: "New vendor application: Taco Truck"           │
│  5. Update vendor status:                                   │
│     [DB] UPDATE vendors                                     │
│     SET status = 'PENDING_REVIEW'                           │
│     WHERE id = vendor.id                                    │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 2: ADMIN APPROVAL                              │
└─────────────────────────────────────────────────────────────────────────┘

[Admin] (Receives email notification)
     │
     │ Clicks "Review Application"
     │ → Redirects to /admin/vendors/pending
     ▼
┌──────────────────────────────────────┐
│  Admin Pending Vendors Page          │
│  - List of pending applications      │
│  - Click on vendor to review         │
└─────────────┬────────────────────────┘
              │
              │ Admin clicks vendor
              │ → /admin/vendors/[id]
              ▼
┌──────────────────────────────────────┐
│  Admin Vendor Review Page            │
│  - Business details                  │
│  - Photos, menu                      │
│  - Document viewer:                  │
│    - Business license (iframe PDF)   │
│    - Health permit (iframe PDF)      │
│    - Insurance (iframe PDF)          │
│  - Approve / Reject buttons          │
└─────────────┬────────────────────────┘
              │
              │ Admin reviews documents
              │ Admin clicks "Approve"
              │ POST /api/vendors/[id]/approve
              ▼
⚠️ Middleware: requireAuth(), requireRole('admin')
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {VendorService}                                             │
│                                                              │
│  1. Update vendor status:                                   │
│     [DB] UPDATE vendors                                     │
│     SET status = 'APPROVED', approved_at = NOW()            │
│     WHERE id = vendor.id                                    │
│  2. Update user status:                                     │
│     [DB] UPDATE users                                       │
│     SET status = 'ACTIVE'                                   │
│     WHERE id = vendor.user_id                               │
│  3. Mark documents as verified:                             │
│     [DB] UPDATE vendor_documents                            │
│     SET verified = true, verified_at = NOW()                │
│     WHERE vendor_id = vendor.id                             │
│  4. Notify vendor:                                          │
│     ✉️ {EmailService}.sendVendorApproval(vendor)            │
│     Template: "vendor-approved"                             │
│     To: vendor.email                                        │
│     Subject: "Welcome to Fleet Feast!"                      │
│     CTA: "Complete Stripe Onboarding"                       │
│  5. Trigger Stripe Connect onboarding:                      │
│     → {StripeService}.createConnectAccount(vendor)          │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                 PHASE 3: STRIPE CONNECT ONBOARDING                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  {StripeService}.createConnectAccount(vendor)                │
│                                                              │
│  1. Create Stripe Connect account:                          │
│     [External] POST https://api.stripe.com/v1/accounts      │
│     {                                                        │
│       type: "standard",  // Vendor manages own dashboard    │
│       country: "US",                                        │
│       email: vendor.email,                                  │
│       business_type: "company",                             │
│       metadata: {                                           │
│         vendorId: vendor.id,                                │
│         businessName: vendor.business_name                  │
│       }                                                     │
│     }                                                       │
│     → Receives: { id: "acct_..." }                          │
│                                                              │
│  2. Update vendor with Stripe account ID:                   │
│     [DB] UPDATE vendors                                     │
│     SET stripe_account_id = "acct_..."                      │
│     WHERE id = vendor.id                                    │
│                                                              │
│  3. Generate onboarding link:                               │
│     [External] POST /v1/account_links                       │
│     {                                                        │
│       account: "acct_...",                                  │
│       refresh_url: "https://fleetfeast.com/vendor/stripe/refresh",│
│       return_url: "https://fleetfeast.com/vendor/stripe/success", │
│       type: "account_onboarding"                            │
│     }                                                       │
│     → Receives: { url: "https://connect.stripe.com/..." }   │
│                                                              │
│  4. Return onboarding URL                                   │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
[Vendor] (Receives approval email)
     │
     │ Clicks "Complete Stripe Onboarding"
     │ → Redirects to Stripe-hosted onboarding flow
     ▼
[External] Stripe Connect Onboarding
     │ Vendor provides:
     │ - Business details
     │ - Bank account info
     │ - Tax ID (EIN/SSN)
     │ - Identity verification
     │
     │ Onboarding complete
     │ Stripe redirects to return_url
     ▼
[Vendor] Redirected to /vendor/stripe/success
     │
     │ Display: "Onboarding complete! You can now accept bookings."
     │
     │ Stripe sends webhook
     ▼
POST /api/payments/webhook
     │ Event: account.updated
     │ Payload: { id: "acct_...", charges_enabled: true, ... }
     ▼
┌──────────────────────────────────────────────────────────────┐
│  {StripeService}.handleWebhook(event)                        │
│                                                              │
│  1. Find vendor by stripe_account_id                        │
│  2. Check if charges_enabled = true                         │
│  3. Update vendor:                                          │
│     [DB] UPDATE vendors                                     │
│     SET stripe_connected = true,                            │
│         stripe_onboarded_at = NOW()                         │
│     WHERE stripe_account_id = "acct_..."                    │
│  4. Vendor can now accept bookings                          │
└──────────────────────────────────────────────────────────────┘

END OF VENDOR ONBOARDING JOURNEY
```

---

## Payment & Escrow Flow

### Detailed Payment State Machine

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PAYMENT STATUS STATE MACHINE                         │
└─────────────────────────────────────────────────────────────────────────┘

Initial State: CREATED
     │
     │ Customer confirms payment (Stripe Elements)
     │ Stripe webhook: payment_intent.succeeded
     ▼
State: AUTHORIZED (Escrow begins)
     │
     │ Funds authorized but NOT captured
     │ Vendor cannot access funds yet
     │
     ├─► Event occurs → 7-day dispute window begins
     │
     ├─► Path A: No dispute filed
     │   │
     │   │ Daily cron job (7 days after event)
     │   │ POST /api/payments/release
     │   ▼
     │   State: CAPTURED
     │   │
     │   │ Stripe automatically transfers to vendor
     │   │ - Vendor receives: 85%
     │   │ - Platform retains: 15%
     │   ▼
     │   State: RELEASED (Final state)
     │
     ├─► Path B: Dispute filed within 7 days
     │   │
     │   │ Customer files dispute
     │   │ POST /api/disputes
     │   ▼
     │   State: ON_HOLD
     │   │
     │   │ Admin investigates
     │   │ POST /api/disputes/[id]/resolve
     │   │
     │   ├─► Resolution: REFUND
     │   │   │
     │   │   │ Stripe refund payment
     │   │   │ POST /v1/payment_intents/:id/cancel
     │   │   ▼
     │   │   State: REFUNDED (Final state)
     │   │
     │   └─► Resolution: RELEASE
     │       │
     │       │ Proceed to capture
     │       ▼
     │       State: RELEASED (Final state)
     │
     └─► Path C: Customer cancels before event
         │
         │ POST /api/bookings/[id]/cancel
         │ Check cancellation policy
         │
         ├─► > 7 days before event
         │   │ Full refund (100%)
         │   │ POST /v1/payment_intents/:id/cancel
         │   ▼
         │   State: REFUNDED_FULL
         │
         ├─► 3-6 days before event
         │   │ Partial refund (50%)
         │   │ POST /v1/refunds
         │   │ { amount: originalAmount * 0.5 }
         │   ▼
         │   State: REFUNDED_PARTIAL
         │
         └─► < 3 days before event
             │ No refund
             │ Funds still released to vendor
             ▼
             State: RELEASED (Final state)
```

---

## Messaging & Anti-Circumvention Flow

### Real-Time Message Filtering

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    IN-APP MESSAGING FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

[Customer/Vendor]
     │
     │ Navigate to /messages/[bookingId]
     │ GET /api/messages?bookingId={id}
     ▼
┌──────────────────────────────────────────────────────────────┐
│  {MessagingService}.getConversation(bookingId)               │
│                                                              │
│  1. Verify user is part of booking (customer OR vendor)     │
│  2. Query messages:                                         │
│     [DB] SELECT * FROM messages                             │
│     WHERE booking_id = ?                                    │
│     ORDER BY created_at ASC                                 │
│  3. Return message list                                     │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  Message List Displayed              │
│  - Previous messages                 │
│  - Message input at bottom           │
│  - Warning: "Do not share contact"   │
└─────────────┬────────────────────────┘
              │
              │ User types message
              │ User clicks "Send"
              │ POST /api/messages
              │ {
              │   bookingId: "uuid",
              │   content: "Can I call you at 555-1234?"
              │ }
              ▼
⚠️ Middleware: requireAuth(), rateLimit(10/minute)
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {MessagingService}.sendMessage(data)                        │
│                                                              │
│  1. Validate user is part of booking                        │
│  2. Validate message content (< 2000 chars)                 │
│  3. Run content filter:                                     │
│     → {ContentFilterService}.checkMessage(content)          │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {ContentFilterService}.checkMessage(content)                │
│                                                              │
│  PATTERN DETECTION:                                         │
│                                                              │
│  Pattern 1: Phone Numbers                                   │
│  Regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/                     │
│  Test: "555-1234" → MATCH ❌                                │
│  Severity: HIGH                                             │
│                                                              │
│  Pattern 2: Email Addresses                                 │
│  Regex: /\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/i               │
│  Test: "john@example.com" → MATCH ❌                        │
│  Severity: HIGH                                             │
│                                                              │
│  Pattern 3: Contact Verbs                                   │
│  Regex: /\b(call|text|email|whatsapp)\s+(me|us)\b/i        │
│  Test: "call me" → MATCH ❌                                 │
│  Severity: MEDIUM                                           │
│                                                              │
│  Pattern 4: Social Media                                    │
│  Regex: /\b(instagram|facebook|twitter|@)\w+\b/i           │
│  Test: "@tacotrucknyc" → MATCH ❌                           │
│  Severity: LOW                                              │
│                                                              │
│  IF ANY HIGH SEVERITY MATCH:                                │
│  1. BLOCK message immediately                               │
│  2. Return error to user                                    │
│  3. Create violation record:                                │
│     [DB] INSERT INTO violations (                           │
│       id, user_id, type, severity, content,                 │
│       action_taken, created_at                              │
│     ) VALUES (                                              │
│       uuid(), user.id, 'contact_info_sharing', 'HIGH',      │
│       content, 'message_blocked', NOW()                     │
│     )                                                       │
│  4. Notify admin:                                           │
│     ✉️ {EmailService}.sendViolationAlert(violation)         │
│  5. Apply penalty:                                          │
│     → {PenaltyService}.applyPenalty(user, 'HIGH')           │
│                                                              │
│  IF MEDIUM/LOW SEVERITY MATCH:                              │
│  1. Allow message (with warning)                            │
│  2. Flag for manual review                                  │
│  3. Create violation record (severity: MEDIUM/LOW)          │
│  4. Show warning to user:                                   │
│     "Your message contains language that may violate our    │
│      terms. Repeated violations may result in suspension."  │
│                                                              │
│  IF NO MATCH:                                               │
│  1. Allow message                                           │
│  2. No action                                               │
└─────────────┬────────────────────────────────────────────────┘
              │
              │ IF BLOCKED:
              ▼
┌──────────────────────────────────────┐
│  Return 400 Bad Request              │
│  {                                   │
│    error: "Message blocked",         │
│    reason: "Contact info detected",  │
│    warning: "Repeated violations..." │
│  }                                   │
└──────────────────────────────────────┘
              │
              │ IF ALLOWED:
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {MessagingService} (continued)                              │
│                                                              │
│  4. Create message record:                                  │
│     [DB] INSERT INTO messages (                             │
│       id, booking_id, sender_id, content,                   │
│       flagged, created_at                                   │
│     ) VALUES (                                              │
│       uuid(), booking.id, user.id, content,                 │
│       false, NOW()                                          │
│     )                                                       │
│  5. Notify recipient:                                       │
│     ✉️ {EmailService}.sendNewMessageNotification()          │
│  6. Return message object                                   │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│             BEHAVIORAL PATTERN DETECTION (Daily Cron)                   │
└─────────────────────────────────────────────────────────────────────────┘

[Daily Cron Job] (3:00 AM UTC)
     │
     │ POST /api/admin/detect-patterns
     ▼
┌──────────────────────────────────────────────────────────────┐
│  {ContentFilterService}.detectBehavioralPatterns()           │
│                                                              │
│  PATTERN 1: High Message Volume, No Bookings                │
│  Query:                                                     │
│    SELECT m.sender_id, m.recipient_id,                      │
│           COUNT(*) as message_count                         │
│    FROM messages m                                          │
│    WHERE m.created_at > NOW() - INTERVAL '30 days'          │
│    GROUP BY m.sender_id, m.recipient_id                     │
│    HAVING COUNT(*) > 20                                     │
│      AND NOT EXISTS (                                       │
│        SELECT 1 FROM bookings b                             │
│        WHERE (b.customer_id = m.sender_id                   │
│               AND b.vendor_id = m.recipient_id)             │
│           OR (b.customer_id = m.recipient_id                │
│               AND b.vendor_id = m.sender_id)                │
│      )                                                      │
│                                                              │
│  Result: 3 suspicious pairs found                           │
│  Action:                                                    │
│  - Create admin alert                                       │
│  - Flag users for manual review                             │
│  - Send warning email to users                              │
│                                                              │
│  PATTERN 2: Repeat Offenders                                │
│  Query:                                                     │
│    SELECT user_id, COUNT(*) as violation_count              │
│    FROM violations                                          │
│    WHERE created_at > NOW() - INTERVAL '90 days'            │
│      AND severity IN ('HIGH', 'MEDIUM')                     │
│    GROUP BY user_id                                         │
│    HAVING COUNT(*) >= 3                                     │
│                                                              │
│  Result: 2 users with 3+ violations                         │
│  Action:                                                    │
│  - Apply 30-day suspension                                  │
│  - Send suspension email                                    │
│  - Notify admin                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## Review & Rating Flow

### Post-Event Review Creation

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       REVIEW CREATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

[Trigger: 7 days after event + escrow release]
     │
     │ Cron job sends review reminder email
     ▼
[Customer] (Receives email)
     │
     │ Clicks "Leave Review"
     │ → /bookings/[id]/review
     ▼
┌──────────────────────────────────────┐
│  Review Form                         │
│  - Booking summary (read-only)       │
│  - Vendor info (read-only)           │
│  - Star rating (1-5)                 │
│  - Written review (textarea)         │
│  - Submit button                     │
└─────────────┬────────────────────────┘
              │
              │ Submit review
              │ POST /api/reviews
              │ {
              │   bookingId: "uuid",
              │   rating: 5,
              │   content: "Amazing food!"
              │ }
              ▼
⚠️ Middleware: requireAuth()
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {ReviewService}.createReview(data)                          │
│                                                              │
│  1. Validate booking exists                                 │
│  2. Verify reviewer is booking customer                     │
│  3. Verify booking is completed (status: COMPLETED)         │
│  4. Check customer hasn't already reviewed:                 │
│     [DB] SELECT * FROM reviews                              │
│     WHERE booking_id = ? AND reviewer_id = ?                │
│     → If exists: Return 400 "Already reviewed"              │
│  5. Validate rating (1-5) and content (< 1000 chars)        │
│  6. Sanitize content (XSS prevention):                      │
│     - Strip HTML tags (except <p>, <br>)                    │
│     - Escape special characters                             │
│  7. Create review record:                                   │
│     [DB] INSERT INTO reviews (                              │
│       id, booking_id, reviewer_id, reviewee_id,             │
│       rating, content, created_at                           │
│     ) VALUES (                                              │
│       uuid(), booking.id, customer.id, vendor.id,           │
│       5, "Amazing food!", NOW()                             │
│     )                                                       │
│  8. Update vendor average rating:                           │
│     [DB] UPDATE vendors                                     │
│     SET avg_rating = (                                      │
│       SELECT AVG(rating) FROM reviews                       │
│       WHERE reviewee_id = ?                                 │
│     ),                                                      │
│     review_count = (                                        │
│       SELECT COUNT(*) FROM reviews                          │
│       WHERE reviewee_id = ?                                 │
│     )                                                       │
│     WHERE id = vendor.id                                    │
│  9. Invalidate vendor cache (Redis):                        │
│     DEL vendor:{vendor.id}                                  │
│     DEL search:*  (invalidate all search caches)            │
│ 10. Notify vendor:                                          │
│     ✉️ {EmailService}.sendNewReviewNotification(review)     │
│ 11. Return review object                                    │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  Client receives review              │
│  - Show success message              │
│  - Navigate to vendor profile        │
│  - Display new review                │
└──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                  VENDOR CAN ALSO REVIEW CUSTOMER                        │
└─────────────────────────────────────────────────────────────────────────┘

[Vendor] (Same flow, reversed roles)
     │
     │ POST /api/reviews
     │ {
     │   bookingId: "uuid",
     │   rating: 5,
     │   content: "Great event, professional host"
     │ }
     ▼
┌──────────────────────────────────────────────────────────────┐
│  {ReviewService}.createReview(data)                          │
│  - Reviewer: vendor                                          │
│  - Reviewee: customer                                        │
│  - Same validation flow                                      │
│  - Customer receives notification                            │
└──────────────────────────────────────────────────────────────┘
```

---

## Dispute Resolution Flow

### Customer Raises Dispute → Admin Investigates → Resolution

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       DISPUTE CREATION FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

[Customer] (Within 7-day dispute window)
     │
     │ Navigate to /bookings/[id]
     │ Click "Report Issue"
     ▼
┌──────────────────────────────────────┐
│  Dispute Form                        │
│  - Issue type (dropdown):            │
│    - Vendor no-show                  │
│    - Late arrival (30-60 min)        │
│    - Late arrival (> 60 min)         │
│    - Food quality issue              │
│    - Wrong food/menu                 │
│    - Quantity issue                  │
│    - Other                           │
│  - Description (textarea)            │
│  - Desired outcome (dropdown):       │
│    - Full refund                     │
│    - Partial refund                  │
│    - Resolution explanation          │
│  - Evidence (optional file upload)   │
└─────────────┬────────────────────────┘
              │
              │ Submit dispute
              │ POST /api/disputes
              │ {
              │   bookingId: "uuid",
              │   reason: "vendor_no_show",
              │   description: "...",
              │   desiredOutcome: "full_refund"
              │ }
              ▼
⚠️ Middleware: requireAuth(), requireRole('customer')
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {DisputeService}.createDispute(data)                        │
│                                                              │
│  1. Validate booking exists and belongs to customer         │
│  2. Check booking is within dispute window:                 │
│     IF event_date + 7 days < NOW():                         │
│       Return 400 "Dispute window closed"                    │
│  3. Check no existing open dispute:                         │
│     [DB] SELECT * FROM disputes                             │
│     WHERE booking_id = ? AND status = 'OPEN'                │
│     → If exists: Return 400 "Dispute already open"          │
│  4. Create dispute record:                                  │
│     [DB] INSERT INTO disputes (                             │
│       id, booking_id, initiator_id, reason,                 │
│       description, desired_outcome, status, created_at      │
│     ) VALUES (                                              │
│       uuid(), booking.id, customer.id, "vendor_no_show",    │
│       description, "full_refund", 'OPEN', NOW()             │
│     )                                                       │
│  5. Update payment status:                                  │
│     [DB] UPDATE payments                                    │
│     SET status = 'ON_HOLD'                                  │
│     WHERE booking_id = booking.id                           │
│  6. Check if automated resolution applies:                  │
│     → {DisputeService}.tryAutomatedResolution(dispute)      │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {DisputeService}.tryAutomatedResolution(dispute)            │
│                                                              │
│  AUTOMATED RULES:                                           │
│                                                              │
│  IF reason = "vendor_no_show":                              │
│    - Full refund to customer                                │
│    - $100 credit to customer                                │
│    - $500 penalty to vendor                                 │
│    - Update dispute status: RESOLVED_AUTO                   │
│    - Action: REFUND                                         │
│    ▼                                                        │
│    [Stripe] POST /v1/refunds                                │
│    { payment_intent: "pi_...", amount: fullAmount }         │
│    [DB] UPDATE payments SET status = 'REFUNDED'             │
│    [DB] UPDATE bookings SET status = 'CANCELLED'            │
│    ✉️ Notify customer: "Full refund processed"              │
│    ✉️ Notify vendor: "$500 penalty applied"                 │
│                                                              │
│  IF reason = "late_arrival_30_60":                          │
│    - 10% partial refund to customer                         │
│    - Update dispute status: RESOLVED_AUTO                   │
│    ▼                                                        │
│    [Stripe] POST /v1/refunds                                │
│    { payment_intent: "pi_...", amount: amount * 0.10 }      │
│    ✉️ Notify customer: "10% refund processed"               │
│                                                              │
│  IF reason = "late_arrival_60_plus":                        │
│    - 25% partial refund to customer                         │
│    - Same flow as above                                     │
│                                                              │
│  ELSE (manual review required):                             │
│    - No automated action                                    │
│    - Notify admin for manual review                         │
│    ✉️ {EmailService}.sendDisputeAlert(dispute)              │
│    To: admin@fleetfeast.com                                 │
│    Subject: "New dispute requires review"                   │
└─────────────┬────────────────────────────────────────────────┘
              │
              │ IF MANUAL REVIEW REQUIRED:
              ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                     ADMIN MANUAL RESOLUTION                             │
└─────────────────────────────────────────────────────────────────────────┘

[Admin] (Receives email)
     │
     │ Clicks "Review Dispute"
     │ → /admin/disputes/[id]
     ▼
┌──────────────────────────────────────┐
│  Admin Dispute Review Page           │
│  - Dispute details                   │
│  - Booking information               │
│  - Customer statement                │
│  - Vendor statement (requested)      │
│  - Message history                   │
│  - Evidence (photos, documents)      │
│  - Resolution form:                  │
│    - Decision (dropdown)             │
│    - Refund amount (if applicable)   │
│    - Resolution notes (textarea)     │
│    - Submit button                   │
└─────────────┬────────────────────────┘
              │
              │ Admin investigates:
              │ - Reviews booking details
              │ - Reads message history
              │ - Contacts vendor for statement
              │ - Reviews evidence
              │
              │ Admin makes decision
              │ POST /api/disputes/[id]/resolve
              │ {
              │   decision: "partial_refund",
              │   refundAmount: 500,
              │   notes: "Evidence supports late arrival..."
              │ }
              ▼
⚠️ Middleware: requireAuth(), requireRole('admin')
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  {DisputeService}.resolveDispute(disputeId, resolution)      │
│                                                              │
│  1. Validate dispute exists and is open                     │
│  2. Process resolution based on decision:                   │
│     IF decision = "full_refund":                            │
│       - Refund full amount via Stripe                       │
│       - Update payment status: REFUNDED                     │
│     ELSE IF decision = "partial_refund":                    │
│       - Refund specified amount via Stripe                  │
│       - Release remaining to vendor                         │
│       - Update payment status: PARTIALLY_REFUNDED           │
│     ELSE IF decision = "release_to_vendor":                 │
│       - Release full amount to vendor                       │
│       - Update payment status: RELEASED                     │
│  3. Update dispute record:                                  │
│     [DB] UPDATE disputes                                    │
│     SET status = 'RESOLVED', resolution = ?,                │
│         resolved_at = NOW(), resolved_by = admin.id         │
│     WHERE id = dispute.id                                   │
│  4. Notify customer:                                        │
│     ✉️ {EmailService}.sendDisputeResolution(dispute)        │
│  5. Notify vendor:                                          │
│     ✉️ {EmailService}.sendDisputeResolution(dispute)        │
│  6. Return resolution                                       │
└──────────────────────────────────────────────────────────────┘
```

---

## Admin Vendor Approval Flow

*See Vendor Onboarding Journey - Phase 2 for detailed flow*

---

## Data Flow Patterns

### Common Patterns Across All Flows

#### 1. Authentication Flow
```
Request → Middleware.requireAuth() → Verify JWT → Check Redis session → Attach user to context → Continue
```

#### 2. Authorization Flow
```
Request → Middleware.requireRole(role) → Check user.role === requiredRole → Continue or 403
```

#### 3. Rate Limiting Flow
```
Request → Middleware.rateLimit() → Check Redis counter → Increment → Allow or 429
```

#### 4. Cache-Aside Pattern
```
Request → Check Redis cache → Cache HIT: Return → Cache MISS: Query DB → Store in Redis → Return
```

#### 5. Validation Pattern
```
Request → Validate with Zod schema → Invalid: Return 400 → Valid: Continue
```

#### 6. Error Handling Pattern
```
Error → Log to Sentry → Format error response → Return appropriate status code → Notify user/admin if critical
```

#### 7. Notification Pattern
```
Event occurs → Trigger email → Primary (SendGrid) → Fail? → Fallback (SES) → Log delivery status
```

#### 8. File Upload Pattern
```
Request presigned URL → Generate S3 URL → Return to client → Client uploads to S3 → Client confirms → Save URL in DB
```

---

*Document maintained by: Alex_Architect*
*Last updated: 2025-12-03*
*Version: 1.0*
