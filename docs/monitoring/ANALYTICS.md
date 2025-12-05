# Vercel Analytics & Web Analytics Setup

**Fleet Feast - Monitoring & Alerting**
**Version**: 1.0
**Last Updated**: 2025-12-04

---

## Table of Contents

1. [Overview](#overview)
2. [Vercel Analytics](#vercel-analytics)
3. [Vercel Speed Insights](#vercel-speed-insights)
4. [Alternative: Plausible Analytics](#alternative-plausible-analytics)
5. [Google Analytics](#google-analytics)
6. [Custom Analytics](#custom-analytics)
7. [Privacy Compliance](#privacy-compliance)
8. [Best Practices](#best-practices)

---

## Overview

Fleet Feast uses a multi-layered analytics approach to understand user behavior, performance, and business metrics while respecting user privacy.

### Analytics Stack

| Tool | Purpose | Cost | Privacy |
|------|---------|------|---------|
| Vercel Analytics | Page views, referrers, unique visitors | $10/mo per project | Cookie-less, GDPR compliant |
| Vercel Speed Insights | Web Vitals, Core Web Vitals | $10/mo per project | Privacy-friendly |
| Plausible Analytics (Alternative) | Privacy-focused, open-source | $9/mo (10k visitors) | GDPR, CCPA compliant |
| Google Analytics 4 (Optional) | Deep funnel analysis | Free | Requires consent banner |

---

## Vercel Analytics

### Features

- **Real User Monitoring (RUM)**: Actual user performance data
- **Page Views**: Track popular pages
- **Referrers**: Understand traffic sources
- **Devices**: Desktop vs mobile usage
- **Geographic Data**: User locations
- **Custom Events**: Track conversions

### Installation

#### 1. Enable in Vercel Dashboard

1. Go to your project in Vercel
2. Navigate to **Analytics** tab
3. Click **Enable Analytics**
4. Choose plan (Free: 2,500 events/month)

#### 2. Install Package

```bash
npm install @vercel/analytics
```

#### 3. Add to Root Layout

Update `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### 4. Environment Variables (Optional)

```bash
# .env.local
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-project-id
```

### Custom Events

Track business-critical events:

```typescript
import { track } from '@vercel/analytics';

// Track booking creation
track('booking_created', {
  vendor_id: booking.vendorId,
  amount: booking.totalAmount,
  event_type: booking.eventType,
});

// Track vendor application
track('vendor_applied', {
  cuisine_type: vendor.cuisineType,
  location: vendor.location,
});

// Track payment completion
track('payment_completed', {
  booking_id: payment.bookingId,
  amount: payment.amount,
  payment_method: payment.method,
});
```

### Viewing Analytics

Access via Vercel Dashboard → Analytics:
- **Top Pages**: Most visited pages
- **Top Referrers**: Traffic sources
- **Devices**: Desktop, mobile, tablet breakdown
- **Countries**: Geographic distribution

---

## Vercel Speed Insights

### Features

- **Core Web Vitals**: LCP, FID, CLS tracking
- **Real User Monitoring**: Actual user performance
- **Device-Specific Metrics**: Mobile vs desktop performance
- **Geographic Performance**: Performance by region

### Installation

#### 1. Enable in Vercel Dashboard

1. Go to **Speed Insights** tab
2. Click **Enable Speed Insights**

#### 2. Install Package

```bash
npm install @vercel/speed-insights
```

#### 3. Add to Root Layout

Update `app/layout.tsx`:

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Web Vitals Monitoring

Add to `app/layout.tsx` or create `app/web-vitals.tsx`:

```typescript
'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { trackWebVital } from '@/lib/monitoring';

export function WebVitals() {
  useReportWebVitals((metric) => {
    trackWebVital(metric);
  });

  return null;
}
```

### Performance Thresholds (from PRD)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **TTFB** (Time to First Byte) | < 800ms | 800ms - 1800ms | > 1800ms |
| **FCP** (First Contentful Paint) | < 1.8s | 1.8s - 3.0s | > 3.0s |

### Alerts

Configure alerts in Vercel Dashboard:
- LCP > 3.5s (Critical)
- FID > 200ms (Warning)
- CLS > 0.2 (Warning)

---

## Alternative: Plausible Analytics

Privacy-focused, cookie-less alternative to Google Analytics.

### Why Plausible?

- **GDPR & CCPA Compliant**: No cookies, no consent banners needed
- **Lightweight**: < 1KB script (vs 45KB for GA4)
- **Open Source**: Self-hostable
- **Simple UI**: Easy to understand metrics

### Installation

#### 1. Sign Up

Create account at [plausible.io](https://plausible.io)

#### 2. Add Script

Update `app/layout.tsx`:

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          defer
          data-domain="fleetfeast.com"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### 3. Custom Events

```typescript
// Track custom events
if (window.plausible) {
  window.plausible('Booking Created', {
    props: {
      vendor: vendor.name,
      amount: booking.totalAmount,
    },
  });
}
```

### Configuration

```bash
# .env.local
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=fleetfeast.com
```

---

## Google Analytics 4

Use only if you need advanced funnel analysis.

### Installation

#### 1. Create GA4 Property

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create new GA4 property
3. Get Measurement ID (G-XXXXXXXXXX)

#### 2. Add Tracking Code

Create `app/google-analytics.tsx`:

```typescript
'use client';

import Script from 'next/script';

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
```

#### 3. Add to Layout

```typescript
import { GoogleAnalytics } from './google-analytics';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
```

#### 4. Track Events

```typescript
import { trackEvent } from '@/lib/monitoring';

trackEvent({
  category: 'Booking',
  action: 'create',
  label: vendor.name,
  value: booking.totalAmount,
});
```

### Cookie Consent

If using GA4, add consent banner:

```typescript
// Use a library like react-cookie-consent
import CookieConsent from 'react-cookie-consent';

<CookieConsent
  enableDeclineButton
  onAccept={() => {
    // Enable GA4
  }}
>
  This website uses cookies to enhance the user experience.
</CookieConsent>
```

---

## Custom Analytics

Track business-specific metrics.

### Key Metrics to Track

#### User Acquisition

```typescript
// Track registration source
track('user_registered', {
  source: 'google' | 'direct' | 'referral',
  role: 'customer' | 'vendor',
});
```

#### Booking Funnel

```typescript
// Step 1: View vendor
track('vendor_viewed', { vendor_id });

// Step 2: Start booking
track('booking_started', { vendor_id });

// Step 3: Complete booking
track('booking_completed', { booking_id, amount });

// Step 4: Payment
track('payment_completed', { payment_id, amount });
```

#### Vendor Performance

```typescript
// Track vendor approval
track('vendor_approved', {
  vendor_id,
  cuisine_type,
  approval_time_days,
});

// Track first booking
track('vendor_first_booking', {
  vendor_id,
  days_since_approval,
});
```

### Analytics Dashboard

Create `/api/analytics/dashboard` endpoint:

```typescript
export async function GET(req: Request) {
  const session = await getServerSession();
  if (session?.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Aggregate metrics from database
  const metrics = {
    totalBookings: await prisma.booking.count(),
    totalRevenue: await prisma.payment.aggregate({
      _sum: { amount: true },
    }),
    activeVendors: await prisma.vendor.count({
      where: { status: 'APPROVED' },
    }),
    conversionRate: 0.05, // Calculate from funnel
  };

  return Response.json(metrics);
}
```

---

## Privacy Compliance

### GDPR Compliance

- **Vercel Analytics**: Cookie-less, GDPR compliant by default
- **Plausible**: No cookies, no consent needed
- **Google Analytics**: Requires cookie consent banner

### Data Retention

- **Vercel**: 30 days (free), 12 months (pro)
- **Plausible**: Indefinite (you control)
- **Google Analytics**: 14 months (default)

### User Data Deletion

Implement data deletion requests:

```typescript
// /api/user/delete-data
export async function POST(req: Request) {
  const { userId } = await req.json();

  // Delete from analytics (if applicable)
  // Vercel Analytics: Automatically anonymized
  // GA4: Use User Deletion API
}
```

---

## Best Practices

### 1. Minimize Script Weight

- Load analytics scripts with `defer` or `async`
- Use Vercel Analytics (< 1KB) over GA4 (45KB)

### 2. Avoid PII (Personally Identifiable Information)

```typescript
// ❌ Don't track
track('user_login', {
  email: user.email, // PII!
  phone: user.phone, // PII!
});

// ✅ Do track
track('user_login', {
  user_id: user.id, // Hashed/anonymized
  role: user.role,
});
```

### 3. Respect Do Not Track

```typescript
if (navigator.doNotTrack === '1') {
  // Don't initialize analytics
}
```

### 4. Use Server-Side Analytics

For critical business metrics, track server-side:

```typescript
// After booking creation
await prisma.analyticsEvent.create({
  data: {
    event: 'booking_created',
    userId: user.id,
    metadata: { vendorId, amount },
  },
});
```

---

## Viewing & Interpreting Data

### Daily Tasks

1. Check **Top Pages** - Identify popular content
2. Review **Referrers** - Understand traffic sources
3. Monitor **Bounce Rate** - Identify poor-performing pages
4. Track **Conversions** - Booking funnel performance

### Weekly Tasks

1. Analyze **User Flow** - Identify drop-off points
2. Review **Device Performance** - Mobile vs desktop
3. Check **Geographic Data** - Expand to new markets
4. A/B Test Results - Validate experiments

### Monthly Tasks

1. **Trend Analysis**: Month-over-month growth
2. **Cohort Analysis**: User retention
3. **Revenue Attribution**: Which channels drive bookings
4. **Performance Review**: Web Vitals trends

---

## Related Documentation

- [SENTRY.md](./SENTRY.md) - Error tracking setup
- [ALERTING.md](./ALERTING.md) - Alert rules and thresholds
- [UPTIME.md](./UPTIME.md) - Uptime monitoring

---

**Document Status**: Complete
**Review Date**: 2025-12-04
**Next Review**: 2026-01-04
