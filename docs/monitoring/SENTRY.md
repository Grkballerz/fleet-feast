# Sentry Error Tracking Setup Guide

**Fleet Feast - Monitoring & Alerting**
**Version**: 1.0
**Last Updated**: 2025-12-04

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Integration](#integration)
5. [Usage Examples](#usage-examples)
6. [Alert Configuration](#alert-configuration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Sentry provides real-time error tracking, performance monitoring, and session replay for Fleet Feast. It helps identify, diagnose, and fix issues before they impact users.

### Features Enabled

- **Error Tracking**: Automatic capture of unhandled errors
- **Performance Monitoring**: Track slow API calls and page loads
- **Session Replay**: Visual reproduction of user sessions (on error only)
- **Release Tracking**: Correlate errors with deployments
- **User Context**: Associate errors with specific users
- **Breadcrumbs**: Detailed event timeline before errors

### Why Sentry?

- **Real-time Alerts**: Instant notification of critical errors
- **Source Maps**: View original source code in stack traces
- **Issue Grouping**: Automatic deduplication of similar errors
- **Integrations**: GitHub, Slack, PagerDuty support
- **Free Tier**: 5,000 errors/month, 100 performance transactions/month

---

## Installation

### 1. Install Sentry SDK

```bash
npm install @sentry/nextjs
```

### 2. Initialize Sentry

Run the Sentry wizard to auto-configure:

```bash
npx @sentry/wizard@latest -i nextjs
```

This creates:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Updates `next.config.js`

### 3. Verify Installation

The wizard will prompt you to:
1. Create a Sentry account (or login)
2. Create a new project (select "Next.js")
3. Copy your DSN (Data Source Name)

Your DSN looks like:
```
https://abc123@o123456.ingest.sentry.io/123456
```

---

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-organization
SENTRY_PROJECT=fleet-feast

# Optional: Enable in development
SENTRY_DEV_ENABLED=false

# App version for release tracking
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Production Environment Variables (Vercel)

Add these in Vercel Dashboard → Settings → Environment Variables:

1. `NEXT_PUBLIC_SENTRY_DSN` (All environments)
2. `SENTRY_AUTH_TOKEN` (Production only) - for source maps
3. `SENTRY_ORG` (Production only)
4. `SENTRY_PROJECT` (Production only)

### Next.js Configuration

Update `next.config.js`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // ... your existing config
};

module.exports = withSentryConfig(
  nextConfig,
  {
    // Sentry Webpack Plugin Options
    silent: true, // Suppress logs
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // Upload source maps in production only
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
  }
);
```

---

## Integration

### 1. Client-Side Setup

Our custom configuration (`lib/monitoring/sentry.ts`) auto-initializes in the browser:

```typescript
import { initSentry } from '@/lib/monitoring/sentry';

// Auto-initializes if NEXT_PUBLIC_SENTRY_DSN is set
```

### 2. Server-Side Setup

Create `sentry.server.config.ts` (if not auto-created):

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 3. Edge Runtime Setup

Create `sentry.edge.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 4. Error Boundary Setup

Add to `app/error.tsx`:

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

---

## Usage Examples

### Capture Errors Manually

```typescript
import { captureError } from '@/lib/monitoring';

try {
  await processPayment(booking);
} catch (error) {
  captureError(error as Error, {
    bookingId: booking.id,
    userId: user.id,
    amount: booking.totalAmount,
  });
  throw error;
}
```

### Capture Messages (Non-Error Events)

```typescript
import { captureMessage } from '@/lib/monitoring';

captureMessage('User reached booking limit', 'warning', {
  userId: user.id,
  bookingCount: count,
});
```

### Set User Context

```typescript
import { setUser, clearUser } from '@/lib/monitoring';

// On login
setUser({
  id: user.id,
  email: user.email,
  role: user.role,
});

// On logout
clearUser();
```

### Add Breadcrumbs

```typescript
import { addBreadcrumb } from '@/lib/monitoring';

addBreadcrumb('booking.validation.started', {
  vendorId: vendor.id,
  eventDate: booking.eventDate,
});
```

### Track Performance

```typescript
import { startTransaction } from '@/lib/monitoring';

const transaction = startTransaction('booking.create', 'task');

try {
  await createBooking(data);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### Wrap Async Functions

```typescript
import { withErrorTracking } from '@/lib/monitoring';

export const createBooking = withErrorTracking(
  async (data: BookingData) => {
    // Function implementation
  },
  'api.booking.create'
);
```

---

## Alert Configuration

### 1. Create Alerts in Sentry

Go to Sentry Dashboard → Alerts → Create Alert Rule

#### Critical Error Alert

- **Metric**: Number of errors
- **Threshold**: > 10 errors in 5 minutes
- **Filter**: `environment:production AND level:error`
- **Action**: Send to Slack + Email

#### Performance Alert

- **Metric**: Transaction duration (p95)
- **Threshold**: > 1000ms
- **Filter**: `transaction:/api/*`
- **Action**: Send to Slack

#### User Impact Alert

- **Metric**: Number of users affected
- **Threshold**: > 5 users in 10 minutes
- **Filter**: `environment:production`
- **Action**: Send to PagerDuty (critical) + Slack

### 2. Alert Rules Configuration

```yaml
# Example alert rule (configured in Sentry UI)
name: "High Error Rate"
conditions:
  - errors > 10 in 5 minutes
  - environment = production
actions:
  - slack: #alerts-critical
  - email: team@fleetfeast.com
  - pagerduty: P1 (if after hours)
```

### 3. Issue Owners

Configure automatic assignment in Sentry:

```
# .github/CODEOWNERS style
/api/payments/*          @backend-team
/app/(dashboard)/*       @frontend-team
/lib/services/*          @backend-team
```

---

## Best Practices

### 1. Sampling Rates

- **Production**: 10% traces, 10% replays on error
- **Staging**: 50% traces, 50% replays
- **Development**: 100% traces, disabled replays

### 2. Filtering Errors

Our configuration filters out:
- Client-side network errors (user connectivity)
- Browser extension errors
- Non-critical errors (ResizeObserver)

### 3. Data Privacy

Automatically redacted:
- Cookies
- Authorization headers
- Query parameters with `token`, `key`, `password`

### 4. Release Tracking

Tag errors by release:
```bash
# Vercel auto-sets VERCEL_GIT_COMMIT_SHA
NEXT_PUBLIC_APP_VERSION=$(git rev-parse --short HEAD)
```

### 5. Environment Segregation

Always set `environment` in Sentry:
- `development`
- `staging` (preview deployments)
- `production`

---

## Troubleshooting

### Issue: Source Maps Not Uploading

**Solution**:
1. Verify `SENTRY_AUTH_TOKEN` is set in Vercel
2. Check `next.config.js` has `withSentryConfig`
3. Run `npm run build` locally to test

### Issue: Too Many Errors

**Solution**:
1. Review `beforeSend` filter in `lib/monitoring/sentry.ts`
2. Add more ignored errors
3. Increase sampling rate threshold

### Issue: Missing User Context

**Solution**:
Call `setUser()` after authentication:
```typescript
// In your auth callback
await signIn(credentials);
setUser({ id: user.id, email: user.email, role: user.role });
```

### Issue: Duplicate Errors

**Solution**:
Sentry auto-groups similar errors. If you see duplicates:
1. Check fingerprinting rules in Sentry UI
2. Add custom grouping:
```typescript
Sentry.captureException(error, {
  fingerprint: ['payment', 'stripe', error.code],
});
```

### Issue: High Data Usage

**Solution**:
1. Lower `tracesSampleRate` to 0.05 (5%)
2. Disable session replay in production
3. Filter out high-volume routes:
```typescript
beforeSend(event) {
  if (event.request?.url?.includes('/api/health')) {
    return null; // Don't send health check errors
  }
  return event;
}
```

---

## Monitoring Dashboard

### Key Metrics to Watch

1. **Error Rate**: Should be < 1% of requests
2. **Response Time (p95)**: < 500ms for API routes
3. **User Impact**: < 10 users affected per hour
4. **Crash-Free Sessions**: > 99.5%

### Daily Tasks

- Review new issues (Inbox)
- Assign issues to owners
- Resolve duplicates
- Update release notes

### Weekly Tasks

- Review performance trends
- Audit alert rules
- Clean up resolved issues
- Update documentation

---

## Related Documentation

- [ALERTING.md](./ALERTING.md) - Alert rules and thresholds
- [ON_CALL.md](./ON_CALL.md) - Incident response process
- [ANALYTICS.md](./ANALYTICS.md) - Vercel Analytics setup

---

**Document Status**: Complete
**Review Date**: 2025-12-04
**Next Review**: 2026-01-04
