# Performance Optimization - Migration Guide

**Version**: 1.0
**Date**: 2025-12-05
**Agent**: Peyton_Performance

---

## Overview

This guide provides step-by-step instructions for deploying performance optimizations to Fleet Feast application. Follow these steps in order to ensure smooth deployment.

---

## Pre-Deployment Checklist

- [ ] Backup production database
- [ ] Review all changed files
- [ ] Test on staging environment
- [ ] Notify team of deployment window
- [ ] Prepare rollback plan

---

## Step 1: Database Migration (30 minutes)

### 1.1 Review Migration File

```bash
# Review the migration SQL
cat prisma/migrations/20251205_performance_indexes/migration.sql
```

**What it does**:
- Creates 15+ performance indexes
- Uses `CONCURRENTLY` to avoid table locks
- Safe to run on production (no downtime)

### 1.2 Run Migration

```bash
# Option A: Using Prisma (recommended)
npx prisma migrate deploy

# Option B: Direct SQL (if Prisma unavailable)
psql $DATABASE_URL -f prisma/migrations/20251205_performance_indexes/migration.sql
```

### 1.3 Verify Indexes Created

```bash
# Check all indexes
psql $DATABASE_URL -c "\di" | grep "idx_"

# Should see 15+ new indexes starting with "idx_"
```

### 1.4 Monitor Index Build Progress

```bash
# For large tables, index creation may take time
psql $DATABASE_URL -c "
  SELECT
    now()::time,
    query,
    state,
    wait_event
  FROM pg_stat_activity
  WHERE query LIKE '%CREATE INDEX%';
"
```

**Expected Duration**: 5-30 minutes depending on data size

---

## Step 2: Update Next.js Configuration (10 minutes)

### 2.1 Backup Existing Config

```bash
cp next.config.js next.config.js.backup
```

### 2.2 Merge Performance Settings

**Option A: Replace entire config** (if using default config):
```bash
cp next.config.performance.js next.config.js
```

**Option B: Merge manually** (if custom config exists):

Open `next.config.js` and add these sections:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config ...

  // ADD: Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Add your existing remotePatterns if any
  },

  // ADD: Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // ADD: Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@headlessui/react',
      '@radix-ui/react-dialog',
      'lucide-react',
      'date-fns',
    ],
  },

  // ... rest of config ...
};
```

### 2.3 Test Build

```bash
# Build and check for errors
npm run build

# Check bundle sizes
ls -lh .next/static/chunks/
```

---

## Step 3: Integrate Caching Layer (20 minutes)

### 3.1 Update API Routes

**Before**:
```typescript
// app/api/trucks/route.ts
export async function GET(request: Request) {
  const trucks = await searchTrucks(filters, pagination);
  return Response.json(trucks);
}
```

**After**:
```typescript
// app/api/trucks/route.ts
import { getCachedTrucks } from '@/lib/cache';

export async function GET(request: Request) {
  const trucks = await getCachedTrucks(filters, pagination);
  return Response.json(trucks);
}
```

### 3.2 Update Server Components

**Before**:
```typescript
// app/search/page.tsx
export default async function SearchPage({ searchParams }) {
  const trucks = await searchTrucks(filters, pagination);
  return <TruckList trucks={trucks} />;
}
```

**After**:
```typescript
// app/search/page.tsx
import { getCachedTrucks } from '@/lib/cache';

export default async function SearchPage({ searchParams }) {
  const trucks = await getCachedTrucks(filters, pagination);
  return <TruckList trucks={trucks} />;
}
```

### 3.3 Files to Update

Update these files to use cached functions:

- [ ] `app/api/trucks/route.ts` → `getCachedTrucks`
- [ ] `app/api/trucks/[id]/route.ts` → `getCachedTruckProfile`
- [ ] `app/search/page.tsx` → `getCachedTrucks`
- [ ] `app/(customer)/dashboard/page.tsx` → `getCachedUserBookings`
- [ ] `app/vendor/[id]/page.tsx` → `getCachedTruckProfile`

### 3.4 Add Cache Invalidation

When data is updated, invalidate cache:

```typescript
// modules/trucks/trucks.service.ts
import { revalidateTruckCache } from '@/lib/cache';

export async function updateVendorMenu(userId: string, data: MenuUpdateData) {
  const menu = await prisma.vendorMenu.upsert(/* ... */);

  // Invalidate cache after update
  await revalidateMenuCache(userId);

  return menu;
}
```

---

## Step 4: Implement Lazy Loading (30 minutes)

### 4.1 Replace Heavy Components

**Find components that should be lazy-loaded**:

```bash
# Search for heavy imports
grep -r "import.*Mapbox" app/
grep -r "import.*Chart" app/
grep -r "import.*PDF" app/
```

**Replace with lazy imports**:

**Before**:
```typescript
import MapView from '@/components/search/MapView';

export default function SearchPage() {
  return <MapView trucks={trucks} />;
}
```

**After**:
```typescript
import { MapView } from '@/lib/lazy-components';

export default function SearchPage() {
  return <MapView trucks={trucks} />;
}
```

### 4.2 Components to Lazy Load

Priority lazy loading (highest impact):

- [ ] MapView (~500KB)
- [ ] DocumentViewer (~500KB)
- [ ] AnalyticsChart (~150KB)
- [ ] RichTextEditor (~200KB)
- [ ] PaymentForm (~50KB)

### 4.3 Test Lazy Loading

```bash
# Run dev server
npm run dev

# Open Network tab in browser
# Verify chunks load on interaction, not on page load
```

---

## Step 5: Optimize Images (15 minutes)

### 5.1 Audit Image Usage

```bash
# Find all <img> tags (should be replaced)
grep -r "<img" app/ --include="*.tsx"

# Find all Image components (correct)
grep -r "next/image" app/ --include="*.tsx"
```

### 5.2 Replace img with Next Image

**Before**:
```tsx
<img src={truck.image} alt={truck.name} />
```

**After**:
```tsx
import Image from 'next/image';

<Image
  src={truck.image}
  alt={truck.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/..."
/>
```

### 5.3 Priority Loading for LCP Images

For above-fold images (hero, first truck card):

```tsx
<Image
  src={truck.image}
  alt={truck.name}
  width={800}
  height={600}
  priority={true}  // Load immediately for LCP
  quality={90}
/>
```

---

## Step 6: Performance Monitoring (15 minutes)

### 6.1 Add Web Vitals Tracking

Update `app/layout.tsx`:

```typescript
import { reportWebVitals } from '@/lib/performance-monitoring';

export default function RootLayout({ children }) {
  // Add to client component wrapper
  return (
    <html>
      <body>
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}
```

Create `components/WebVitalsReporter.tsx`:

```typescript
'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { reportWebVitals } from '@/lib/performance-monitoring';

export function WebVitalsReporter() {
  useReportWebVitals(reportWebVitals);
  return null;
}
```

### 6.2 Setup Monitoring Dashboard

Configure analytics service:

```typescript
// lib/analytics.ts
export function initPerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    // Google Analytics
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      send_page_view: false, // Manual page view tracking
    });

    // OR Sentry Performance
    Sentry.init({
      tracesSampleRate: 0.1, // 10% of transactions
      profilesSampleRate: 0.1,
    });
  }
}
```

---

## Step 7: Testing & Validation (30 minutes)

### 7.1 Run Lighthouse

```bash
# Install lighthouse CLI
npm install -g lighthouse

# Run on staging
lighthouse https://staging.fleetfeast.com --view

# Target scores:
# Performance: 90+
# Accessibility: 90+
# Best Practices: 90+
# SEO: 90+
```

### 7.2 Test Caching

```bash
# Check cache headers
curl -I https://staging.fleetfeast.com/_next/static/chunks/main.js

# Should see:
# Cache-Control: public, max-age=31536000, immutable
```

### 7.3 Verify Database Performance

```bash
# Run sample queries and check execution time
psql $DATABASE_URL -c "EXPLAIN ANALYZE
  SELECT * FROM vendors
  WHERE cuisine_type = 'MEXICAN'
    AND status = 'APPROVED'
  LIMIT 20;
"

# Should use idx_vendors_search_composite
# Execution time should be < 50ms
```

### 7.4 Bundle Size Analysis

```bash
# Generate bundle report
ANALYZE=true npm run build

# Open report
open .next/analyze/client.html

# Verify:
# - Initial bundle < 150KB gzipped
# - No large chunks in initial load
# - Heavy dependencies in separate chunks
```

---

## Step 8: Deployment (15 minutes)

### 8.1 Deploy to Staging

```bash
# Build for production
npm run build

# Deploy to staging
# (Your deployment command, e.g., Vercel, AWS, etc.)
vercel deploy --env=staging
```

### 8.2 Smoke Tests on Staging

- [ ] Homepage loads < 2s
- [ ] Search results load < 1s (cached)
- [ ] Images load as WebP/AVIF
- [ ] Bundle size < 150KB
- [ ] No console errors
- [ ] Lazy components load on interaction

### 8.3 Deploy to Production

```bash
# Deploy to production
vercel deploy --prod

# OR your deployment command
npm run deploy:prod
```

### 8.4 Monitor Production Metrics

Watch for regressions:

```bash
# Monitor error rates
# Monitor response times
# Monitor cache hit ratio
# Monitor Web Vitals in analytics
```

---

## Rollback Plan

If issues occur, rollback in reverse order:

### Rollback Step 1: Revert Code Changes

```bash
git revert <commit-hash>
npm run build
# Deploy
```

### Rollback Step 2: Drop Indexes (if necessary)

```sql
-- Only if indexes cause issues
DROP INDEX CONCURRENTLY idx_vendors_search_composite;
DROP INDEX CONCURRENTLY idx_vendors_fts;
-- ... (drop other indexes if needed)
```

**Note**: Keep indexes unless they cause active issues. They don't hurt performance.

---

## Post-Deployment Monitoring (7 days)

### Week 1 Checklist

**Day 1-2**: Watch for errors
- [ ] Monitor error rates (Sentry/Logs)
- [ ] Check cache hit ratio (should be 70%+)
- [ ] Verify database load decreased
- [ ] Check Web Vitals dashboard

**Day 3-5**: Validate performance
- [ ] Run Lighthouse daily
- [ ] Compare before/after metrics
- [ ] Gather user feedback
- [ ] Check server costs (should decrease)

**Day 6-7**: Optimize further
- [ ] Identify remaining slow queries
- [ ] Tune cache durations if needed
- [ ] Add more lazy loading if needed
- [ ] Document lessons learned

---

## Success Metrics

### Technical Metrics

- ✅ LCP < 2.5s (Target: 1.8s)
- ✅ TTI < 3.5s (Target: 2.5s)
- ✅ Bundle < 200KB (Target: 150KB)
- ✅ Cache hit ratio > 70%
- ✅ Avg query time < 200ms

### Business Metrics

- 📊 Bounce rate decreased 15-20%
- 📊 Conversion rate increased 10-15%
- 📊 Server costs decreased 30-40%
- 📊 User satisfaction scores improved

---

## Troubleshooting

### Cache Not Working

**Symptom**: Same query hits database every time

**Fix**:
```typescript
// Check cache tags are correct
import { revalidateTag } from 'next/cache';

// Manually clear cache
revalidateTag('trucks');
```

### Images Not Optimizing

**Symptom**: Images still served as JPEG

**Fix**:
```bash
# Check next.config.js has image config
# Restart dev server
npm run dev

# Check browser supports WebP/AVIF
# (All modern browsers do)
```

### Lazy Loading Not Working

**Symptom**: All components load immediately

**Fix**:
```typescript
// Ensure dynamic() is used
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false, // Key for client-only components
});
```

### Slow Database Queries

**Symptom**: Queries still taking > 500ms

**Fix**:
```sql
-- Check index is being used
EXPLAIN ANALYZE SELECT * FROM vendors WHERE ...;

-- Look for "Index Scan" not "Seq Scan"
-- If Seq Scan, check WHERE clause matches index
```

---

## Support

**Questions?** Contact:
- Peyton_Performance (performance optimization)
- Quinn_QA (testing issues)
- Devon_DevOps (deployment issues)

**Documentation**:
- Performance Report: `docs/Performance_Report.md`
- Caching Layer: `lib/cache.ts`
- Migration SQL: `prisma/migrations/20251205_performance_indexes/migration.sql`

---

**Last Updated**: 2025-12-05
**Version**: 1.0
**Status**: READY FOR DEPLOYMENT
