# MASTER_PRD.md - Fleet Feast
Generated: 2025-12-03
Version: 1.0

---

## Executive Summary

Fleet Feast is a web-based food truck marketplace connecting customers seeking catering services with food truck vendors in New York City, with plans for nationwide expansion. The platform facilitates bookings for all event types while taking a 15% commission, employing heavy anti-circumvention measures to ensure all transactions occur on-platform through in-app-only communication, escrow payments, and contractual penalties.

---

## Project Goals

### Primary Objectives
- Create a trusted marketplace connecting food truck vendors with customers seeking catering
- Establish a sustainable revenue model through 15% commission on all bookings
- Prevent off-platform transactions through comprehensive lock-in mechanisms
- Build a scalable platform starting in NYC with nationwide expansion capability

### Success Metrics
- 100 food trucks onboarded within first 3 months in NYC
- 500 completed bookings within first 6 months
- Less than 5% detected off-platform transaction attempts
- Customer satisfaction rating above 4.5/5
- Food truck retention rate above 85%
- Platform dispute rate below 3%

---

## Target Users

### Primary Personas

**Event Planners (Customers)**
- **Corporate Event Coordinator**: Plans office lunches, company parties, team events. Needs reliable vendors, clear pricing, professional communication. Values efficiency and accountability.
- **Private Party Host**: Planning birthdays, graduations, family reunions. Needs variety, good reviews, easy booking. Values quality food and good experience.
- **Wedding Planner**: Organizing wedding catering or rehearsal dinners. Needs premium quality, reliability guarantees, professional vendors. Values reputation and reviews.
- **Festival/Event Organizer**: Booking multiple trucks for public events. Needs bulk booking, variety, coordination tools. Values availability and diversity.

**Food Truck Vendors**
- **Independent Operator**: Single truck owner looking for catering gigs beyond street vending. Needs steady booking flow, fair terms, reliable payment.
- **Multi-Truck Fleet Owner**: Operates 2-5 trucks, needs calendar management, staff coordination. Values efficiency and booking volume.

### User Journeys

**Customer Booking Journey**
1. Search/browse food trucks by cuisine, availability, event type
2. View truck profiles (menu, photos, reviews, pricing)
3. Submit booking request with event details
4. Receive acceptance/decline from truck
5. Complete payment through platform (held in escrow)
6. Coordinate details via in-app messaging
7. Event occurs
8. Submit review and rating
9. Escrow released to vendor (7 days post-event)

**Food Truck Vendor Journey**
1. Submit application with required documents
2. Platform reviews and approves/rejects
3. Complete profile setup (menu, photos, pricing, availability)
4. Receive booking requests
5. Accept/decline requests based on availability
6. Coordinate via in-app messaging
7. Fulfill catering event
8. Receive payment 7 days after event completion
9. Build reputation through reviews

---

## Functional Requirements

### Core Features (Must-Have)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F1 | User Registration & Auth | Email/password registration for customers and vendors. Email verification required. Password reset functionality. | High |
| F2 | Food Truck Application | Self-service vendor application collecting: business license, health permit, liability insurance, food handler certs, truck photos, menu. | High |
| F3 | Admin Approval Dashboard | Platform admin interface to review applications, verify documents, approve/reject vendors. | High |
| F4 | Food Truck Profiles | Public profiles displaying: truck name, cuisine type, menu with pricing, photos, capacity, event type specializations, ratings, reviews. | High |
| F5 | Search & Discovery | Search food trucks with filters: cuisine type, price range, event type, guest capacity, availability date, rating. Location-based results for NYC. | High |
| F6 | Availability Calendar | Vendors manage their availability calendar. Customers see real-time availability when searching. | High |
| F7 | Request-to-Book Flow | Customers submit booking requests with event details (date, time, location, guest count, event type, special requests). Vendors accept/decline within 48 hours. | High |
| F8 | Escrow Payment System | Customers pay platform upon booking confirmation. Platform holds funds until 7 days post-event, then releases to vendor minus 15% commission. | High |
| F9 | In-App Messaging | All customer-vendor communication happens in-app. NO phone numbers, emails, or external contact info exchanged. Message history preserved. | High |
| F10 | Review & Rating System | Post-event reviews: 1-5 star rating + written review. Both customers and vendors can review each other. Reviews tied to verified bookings only. | High |
| F11 | Platform-Wide Cancellation Policy | Standardized cancellation rules: Full refund 7+ days before event. Partial refund 3-6 days. No refund under 3 days. Vendor cancellation triggers penalty. | High |
| F12 | Vendor Cancellation Handling | If vendor cancels: automatic penalty fee, platform attempts to find replacement truck, customer offered replacement OR full refund choice. | High |
| F13 | Dispute Resolution System | Automated rules handle common issues. Unresolved disputes escalate to platform support team for manual review and mediation. | High |
| F14 | Anti-Circumvention Monitoring | System flags suspicious patterns: repeated same customer-vendor pairings without bookings, attempts to share contact info in messages, unusual message content. | High |
| F15 | Penalty System | Violation handling: 1st offense = warning, 2nd offense = temporary suspension (30 days), 3rd offense = permanent ban. Applies to both customers and vendors. | High |

### Secondary Features (Should-Have)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F16 | Loyalty Discount Program | Repeat customers booking same truck receive 5% discount on subsequent bookings (platform absorbs cost to incentivize on-platform rebooking). | Medium |
| F17 | Booking Dashboard | Customers and vendors see upcoming/past bookings, statuses, payment history, messages in unified dashboard. | Medium |
| F18 | Notification System | Email and in-app notifications for: booking requests, acceptances, payment confirmations, messages, event reminders, review prompts. | Medium |
| F19 | Vendor Analytics | Vendors see: booking stats, revenue reports, popular menu items, customer demographics, review sentiment analysis. | Medium |
| F20 | Customer Favorites | Customers can save favorite trucks for quick rebooking. | Medium |
| F21 | Quote Requests | For large/complex events, customers can request custom quotes from multiple trucks simultaneously. | Medium |
| F22 | Admin Analytics Dashboard | Platform metrics: GMV, commission revenue, active users, booking volume, dispute rate, vendor churn. | Medium |

### Future Features (Nice-to-Have)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F23 | Multi-City Expansion | Geographic expansion beyond NYC with location-based vendor pools and localized compliance requirements. | Low |
| F24 | Mobile Apps | Native iOS and Android apps for customers and vendors. | Low |
| F25 | Multi-Truck Booking | Book multiple trucks for single event through unified checkout. | Low |
| F26 | Vendor Promoted Listings | Paid placement for vendors to appear higher in search results. | Low |
| F27 | Instant Messaging | Real-time chat with typing indicators and read receipts (upgrade from async messaging). | Low |
| F28 | Insurance Integration | Partner with insurance providers for event-specific coverage add-ons. | Low |

---

## Technical Requirements

### Technology Stack

- **Frontend**: Next.js 14+ (React), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js or Next.js API routes
- **Database**: PostgreSQL (primary), Redis (caching, sessions)
- **Authentication**: NextAuth.js with JWT tokens
- **Payment Processing**: Stripe Connect (marketplace payments with escrow)
- **File Storage**: AWS S3 or Cloudinary (images, documents)
- **Search**: PostgreSQL full-text search (initial), Elasticsearch (scale)
- **Email**: SendGrid or AWS SES
- **Hosting**: Vercel (frontend), AWS or Railway (backend/database)
- **Monitoring**: Sentry (errors), Vercel Analytics or Plausible

### Performance Requirements

| Metric | Target |
|--------|--------|
| Page Load Time (LCP) | < 2.5 seconds |
| Time to Interactive | < 3.5 seconds |
| API Response Time (p95) | < 500ms |
| Search Results | < 1 second |
| Concurrent Users | 1,000 (initial), 10,000 (scale) |
| Uptime | 99.5% |
| Database Query Time | < 100ms (p95) |

### Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Authentication | Email/password with bcrypt hashing, JWT tokens, secure HTTP-only cookies |
| Authorization | Role-based access control (Customer, Vendor, Admin) |
| Data Encryption | TLS 1.3 in transit, AES-256 at rest for sensitive data |
| PCI Compliance | Stripe handles all card data (PCI DSS compliant) |
| Input Validation | Server-side validation on all inputs, parameterized queries |
| XSS Prevention | Content Security Policy, output encoding |
| CSRF Protection | CSRF tokens on all state-changing requests |
| Rate Limiting | API rate limiting per user/IP |
| Document Security | Signed URLs for sensitive documents (licenses, permits) |
| Message Filtering | Automated scanning for contact info patterns (phone, email) |

### Integration Requirements

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Stripe Connect | Marketplace payments, escrow, vendor payouts | Required |
| SendGrid/AWS SES | Transactional emails, notifications | Required |
| AWS S3/Cloudinary | Image and document storage | Required |
| Google Maps API | Location services, address validation | Required |
| Twilio (future) | In-app SMS notifications (no direct contact) | Optional |

---

## Design Requirements

### Visual Design

| Element | Value | Usage |
|---------|-------|-------|
| Primary Color | #B91C1C | Headers, primary buttons, key CTAs, brand elements |
| Primary Hover | #991B1B | Button hover states |
| Secondary Color | #FFFFFF | Backgrounds, cards, clean space |
| Text Primary | #111827 | Headings, body text |
| Text Secondary | #6B7280 | Captions, secondary info |
| Border Color | #E5E7EB | Card borders, dividers |
| Success | #059669 | Confirmation, success states |
| Warning | #D97706 | Warnings, pending states |
| Error | #DC2626 | Error states, destructive actions |
| Background | #F9FAFB | Page backgrounds |
| Card Background | #FFFFFF | Content cards |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headings | Inter | 600-700 | 24-48px |
| Body | Inter | 400 | 16px |
| Small Text | Inter | 400 | 14px |
| Buttons | Inter | 500 | 14-16px |
| Navigation | Inter | 500 | 16px |

### UI Style

- **Overall Tone**: Serious but friendly - professional enough for corporate clients, approachable for private events
- **Design System**: Clean, modern, minimal visual clutter
- **Cards**: White cards with subtle shadows on light gray backgrounds
- **Buttons**: Rounded corners (8px), clear hierarchy (primary red, secondary outline)
- **Forms**: Clear labels, helpful validation messages, accessible inputs
- **Imagery**: High-quality food truck and food photography
- **Icons**: Consistent icon set (Lucide or Heroicons)

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, hamburger nav, stacked cards |
| Tablet | 768px - 1024px | Two columns, condensed nav |
| Desktop | > 1024px | Full layout, sidebar navigation, multi-column grids |

### Accessibility

| Requirement | Standard |
|-------------|----------|
| WCAG Level | AA Compliance |
| Color Contrast | Minimum 4.5:1 for text |
| Keyboard Navigation | Full keyboard accessibility |
| Screen Readers | Proper ARIA labels, semantic HTML |
| Focus Indicators | Visible focus states on all interactive elements |
| Alt Text | Required for all images |
| Form Labels | Associated labels for all form inputs |

---

## Data Requirements

### Data Entities

| Entity | Key Fields | Relationships |
|--------|------------|---------------|
| User | id, email, password_hash, role, created_at, status | Has many Bookings, Messages, Reviews |
| Vendor | id, user_id, business_name, cuisine_type, capacity_min, capacity_max, price_range, status, approved_at | Belongs to User, Has many Documents, Bookings, Reviews |
| VendorDocument | id, vendor_id, type, file_url, verified, verified_at | Belongs to Vendor |
| VendorMenu | id, vendor_id, items (JSON), pricing_model | Belongs to Vendor |
| Availability | id, vendor_id, date, is_available | Belongs to Vendor |
| Booking | id, customer_id, vendor_id, event_date, event_time, location, guest_count, event_type, status, total_amount, platform_fee, vendor_payout, created_at | Belongs to User (customer), Vendor |
| Payment | id, booking_id, stripe_payment_id, amount, status, captured_at, released_at | Belongs to Booking |
| Message | id, booking_id, sender_id, content, flagged, created_at | Belongs to Booking, User |
| Review | id, booking_id, reviewer_id, reviewee_id, rating, content, created_at | Belongs to Booking, Users |
| Violation | id, user_id, type, description, action_taken, created_at | Belongs to User |
| Dispute | id, booking_id, initiator_id, reason, status, resolution, resolved_at | Belongs to Booking, User |

### Data Retention

| Data Type | Retention Period |
|-----------|------------------|
| User Accounts | Until deletion requested + 30 days |
| Booking Records | 7 years (tax/legal compliance) |
| Payment Records | 7 years (tax/legal compliance) |
| Messages | 3 years |
| Reviews | Indefinite (while accounts active) |
| Vendor Documents | Duration of vendor relationship + 1 year |
| Violation Records | 5 years |
| Dispute Records | 5 years |

### Data Privacy

| Requirement | Implementation |
|-------------|----------------|
| GDPR Compliance | Right to access, rectification, erasure, data portability |
| CCPA Compliance | Privacy policy, opt-out mechanisms, data disclosure |
| Data Minimization | Collect only necessary data |
| Consent | Explicit consent for data collection and communications |
| Third-Party Sharing | Only with essential service providers (Stripe, email) |
| Data Export | User can export their data in standard format |
| Account Deletion | Full account deletion with data anonymization |

---

## Business Rules

### Commission Structure

| Item | Value |
|------|-------|
| Platform Commission | 15% of booking total |
| Commission Charged To | Vendor (deducted from payout) |
| Loyalty Discount | 5% off for repeat bookings with same vendor |
| Loyalty Cost Bearer | Platform (reduced commission to 10% on loyalty bookings) |

### Cancellation Policy (Platform-Wide)

| Timeframe | Customer Cancellation | Vendor Cancellation |
|-----------|----------------------|---------------------|
| 7+ days before event | 100% refund | No penalty + platform finds replacement |
| 3-6 days before event | 50% refund | $100 penalty + platform finds replacement |
| < 3 days before event | No refund | $200 penalty + platform finds replacement + customer compensation |
| No-show (vendor) | N/A | $500 penalty + full refund + $100 customer credit |

**Customer Options on Vendor Cancellation**: Customer may choose between accepting a replacement truck OR receiving a full refund.

### Anti-Circumvention Rules

| Rule | Implementation |
|------|----------------|
| Contact Info Exchange | Prohibited - filtered in messages, not displayed on profiles |
| Message Monitoring | Automated pattern detection for phone numbers, emails, social handles |
| Suspicious Activity | Same customer-vendor pairs with conversation but no bookings flagged |
| Violation Penalties | Warning → 30-day suspension → Permanent ban |
| Repeat Booking Incentive | 5% loyalty discount to keep repeat customers on-platform |

### Payment Flow

```
1. Customer submits booking request
2. Vendor accepts request (48hr window to respond)
3. Customer completes payment → Platform holds in escrow
4. Event occurs
5. 7-day dispute window begins
6. If no dispute: Platform releases payment to vendor minus 15% commission
7. If dispute: Funds held until resolution
```

### Dispute Resolution Rules (Automated)

| Issue | Automated Resolution |
|-------|---------------------|
| Vendor no-show | Full refund + $100 credit to customer, $500 penalty to vendor |
| Food quality complaint | Escalate to manual review |
| Late arrival (< 30 min) | No action |
| Late arrival (30-60 min) | 10% refund to customer |
| Late arrival (> 60 min) | 25% refund to customer |
| Wrong food/menu | Escalate to manual review |
| Quantity dispute | Escalate to manual review |

---

## Constraints & Assumptions

### Constraints

| Constraint | Impact |
|------------|--------|
| NYC Launch Only | Initial vendor pool limited to NYC metro area, compliance with NYC health regulations |
| Web-Only Platform | No native mobile apps at launch, must be mobile-responsive |
| Stripe Dependency | Payment flow tied to Stripe Connect capabilities and pricing |
| Self-Service Onboarding | Manual document verification creates potential bottleneck |
| English Only | Initial version English-only, limits some vendor accessibility |

### Assumptions

| Assumption | Risk if Invalid |
|------------|-----------------|
| Food trucks want catering gigs | Platform may lack supply; pivot to broader vendor types |
| Customers will pay platform premium | If customers prefer direct booking, need stronger value prop |
| Message monitoring is sufficient | May need phone/email verification to prevent circumvention |
| 15% commission is competitive | May need adjustment based on market feedback |
| 7-day payout window is acceptable | Vendors may require faster payouts |
| NYC has sufficient market | May need to expand to adjacent areas sooner |

---

## Out of Scope (Version 1.0)

| Excluded Item | Rationale |
|---------------|-----------|
| Mobile Native Apps | Web-first approach, mobile apps in v2 |
| Multi-City Support | NYC focus first, expansion after market validation |
| Real-Time Chat | Async messaging sufficient for booking coordination |
| Multi-Truck Bookings | Single vendor per booking initially |
| Vendor Promoted Listings | Revenue optimization feature for later |
| Insurance Integration | Partnership complexity, defer to v2 |
| API for Third Parties | Internal platform only initially |
| Multi-Language Support | English only at launch |
| Cryptocurrency Payments | Stripe fiat only |
| Auction/Bidding Model | Fixed pricing model only |

---

## Glossary

| Term | Definition |
|------|------------|
| Vendor | Food truck operator registered on the platform |
| Customer | Person booking food truck services |
| Booking | A confirmed reservation for food truck catering services |
| Escrow | Payment held by platform until event completion + dispute window |
| Commission | Platform fee (15%) deducted from vendor payout |
| GMV | Gross Merchandise Value - total booking value before fees |
| Circumvention | Attempt to conduct transactions outside the platform |
| Dispute Window | 7-day period after event where issues can be raised |
| Loyalty Discount | 5% discount for repeat bookings with same vendor |
| Request-to-Book | Booking flow where vendor must accept before payment |

---

*This document is the SOURCE OF TRUTH for all development decisions.*
*All agents must trace their work back to requirements in this document.*
*Last Updated: 2025-12-03 | Version: 1.0*
