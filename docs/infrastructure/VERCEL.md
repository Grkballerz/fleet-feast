# Vercel Deployment Guide

**Project**: Fleet Feast
**Platform**: Vercel
**Framework**: Next.js 14.2+ (App Router)
**Last Updated**: 2025-12-04

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Environment Variables](#environment-variables)
5. [Custom Domain Configuration](#custom-domain-configuration)
6. [Cron Jobs](#cron-jobs)
7. [Deployment Workflow](#deployment-workflow)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Fleet Feast is deployed on Vercel for optimal Next.js performance, automatic scaling, and zero-configuration deployment. Vercel provides:

- **Global Edge Network**: Content delivered from 100+ edge locations
- **Automatic HTTPS**: SSL certificates managed automatically
- **Preview Deployments**: Unique URL for each PR
- **Serverless Functions**: API routes auto-scaled
- **Image Optimization**: Automatic WebP conversion and resizing
- **Cron Jobs**: Scheduled tasks for payment release, notifications

**Why Vercel?** (See ADR-010 in `docs/architecture/DECISIONS.md`)
- Built by Next.js creators (best optimization)
- Zero infrastructure management
- Generous free tier for MVP ($0-20/month)
- Automatic scaling for traffic spikes

---

## Prerequisites

### Required Accounts
- [Vercel Account](https://vercel.com/signup) (Free tier works for MVP)
- GitHub account (for Git integration)
- Access to Fleet Feast repository

### Required Services
- PostgreSQL database (Railway or AWS RDS) - see [DATABASE.md](./DATABASE.md)
- Redis instance (Upstash or AWS ElastiCache) - see [REDIS.md](./REDIS.md)
- Stripe account (live and test keys)
- AWS S3 or Cloudinary account - see [STORAGE.md](./STORAGE.md)
- SendGrid or AWS SES account (email delivery)

---

## Initial Setup

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### Step 2: Link Project to Vercel

```bash
# From project root
cd C:\Users\grkba\.claude\projects\Fleet-Feast
vercel link
```

Follow prompts:
- **Scope**: Select your Vercel team/account
- **Link to existing project?**: No (first deployment)
- **Project name**: `fleet-feast`
- **Directory**: `./` (root)
- **Override settings?**: No

### Step 3: Configure Project Settings

In Vercel Dashboard (`https://vercel.com/<your-team>/fleet-feast/settings`):

#### General Settings
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Node.js Version**: 18.x (or latest LTS)

#### Git Integration
- **Production Branch**: `main`
- **Preview Branches**: All branches
- **Ignored Build Step**: Leave empty (build on every commit)

---

## Environment Variables

### Required Variables

All environment variables must be added in Vercel Dashboard under **Settings → Environment Variables**.

#### 1. Database
```
DATABASE_URL=postgresql://user:password@host:5432/fleet_feast?schema=public
```
- **Scope**: Production, Preview, Development
- **Source**: Railway or AWS RDS connection string (see [DATABASE.md](./DATABASE.md))

#### 2. Redis Cache
```
REDIS_URL=redis://default:password@host:6379
REDIS_TOKEN=your-upstash-token  # Only if using Upstash
```
- **Scope**: Production, Preview, Development
- **Source**: Upstash or AWS ElastiCache (see [REDIS.md](./REDIS.md))

#### 3. NextAuth.js
```
NEXTAUTH_URL=https://fleetfeast.com  # Production URL
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
```
- **Scope**: Production, Preview (use preview URL), Development (localhost:3000)
- **Generate Secret**: `openssl rand -base64 32`

#### 4. Stripe
```
STRIPE_SECRET_KEY=sk_live_...  # Production key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
- **Scope**: Production (live keys), Preview/Dev (test keys)
- **Source**: Stripe Dashboard → Developers → API Keys

#### 5. AWS S3
```
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=fleet-feast-production
AWS_S3_REGION=us-east-1
```
- **Scope**: Production, Preview (use separate bucket), Development
- **Source**: AWS IAM User with S3 access (see [STORAGE.md](./STORAGE.md))

#### 6. Email (SendGrid)
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@fleetfeast.com
SENDGRID_FROM_NAME=Fleet Feast
```
- **Scope**: Production, Preview, Development
- **Source**: SendGrid Dashboard → Settings → API Keys

#### 7. Monitoring (Optional but Recommended)
```
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx  # For uploading source maps
```
- **Scope**: Production, Preview
- **Source**: Sentry.io project settings

#### 8. Application Config
```
NEXT_PUBLIC_APP_URL=https://fleetfeast.com  # Production URL
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PLATFORM_FEE_PERCENTAGE=15
ESCROW_HOLD_DAYS=7
MAX_FILE_SIZE_MB=10
CRON_SECRET=<generate-random-32-char-string>  # For authenticating cron jobs
```

### Adding Variables via CLI

```bash
# Production
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production

# Preview (same value for all previews)
vercel env add DATABASE_URL preview

# Development (local)
vercel env add DATABASE_URL development
```

### Pulling Variables Locally

```bash
# Download environment variables to .env.local
vercel env pull .env.local
```

---

## Custom Domain Configuration

### Step 1: Add Domain in Vercel

1. Go to **Settings → Domains**
2. Click **Add Domain**
3. Enter your domain: `fleetfeast.com`
4. Vercel will provide DNS records

### Step 2: Configure DNS

Add the following records in your domain registrar (e.g., Namecheap, GoDaddy):

#### For Root Domain (`fleetfeast.com`)
```
Type: A
Name: @
Value: 76.76.21.21  # Vercel's IP (may vary, check dashboard)
TTL: 3600
```

#### For WWW Subdomain (`www.fleetfeast.com`)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### For Subdomains (e.g., `api.fleetfeast.com`)
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 3: Set Primary Domain

In Vercel Dashboard:
1. Go to **Settings → Domains**
2. Find `fleetfeast.com`
3. Click **Set as Primary**

### Step 4: Redirect WWW to Root (Optional)

```
www.fleetfeast.com → fleetfeast.com (301 redirect)
```

Vercel handles this automatically when both domains are added.

### SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt. No configuration needed.

---

## Cron Jobs

Fleet Feast uses Vercel Cron for scheduled tasks (payment release, notifications).

### Configuration (`vercel.json`)

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/payment-release",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/notifications",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/cache-cleanup",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/booking-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Cron Schedule Syntax

Uses standard cron format: `minute hour day month weekday`

Examples:
- `0 2 * * *` - Daily at 2:00 AM UTC
- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - Every hour at :00
- `0 9 * * 1` - Every Monday at 9:00 AM UTC

### Authenticating Cron Jobs

Cron endpoints should verify they're called by Vercel:

```typescript
// app/api/cron/payment-release/route.ts
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Execute cron logic...
}
```

Set `CRON_SECRET` in environment variables.

### Monitoring Cron Jobs

View cron execution logs:
1. Vercel Dashboard → **Deployments**
2. Click on latest deployment → **Functions**
3. Filter by `/api/cron/*`

---

## Deployment Workflow

### Automatic Deployments

#### Production (main branch)
```bash
git checkout main
git merge develop
git push origin main
```

Triggers:
- Build Next.js app
- Run `npm run build`
- Deploy to production domain
- Update environment variables (production scope)

#### Preview (feature branches)
```bash
git checkout -b feature/new-booking-flow
# Make changes...
git push origin feature/new-booking-flow
```

Triggers:
- Build Next.js app
- Deploy to unique preview URL: `fleet-feast-git-feature-new-booking-flow.vercel.app`
- Use preview environment variables
- Comment on PR with preview URL

### Manual Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Deployment Environments

| Environment | Branch | Domain | Variables Scope |
|-------------|--------|--------|-----------------|
| Production | `main` | `fleetfeast.com` | Production |
| Preview | Any PR | `<project>-git-<branch>-<team>.vercel.app` | Preview |
| Development | Local | `localhost:3000` | Development |

---

## Performance Optimization

### Edge Caching

Configure caching in API routes:

```typescript
// app/api/vendors/route.ts
export async function GET(req: Request) {
  const vendors = await getVendors();

  return Response.json(vendors, {
    headers: {
      'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600', // 30 min cache
    },
  });
}
```

### Static Pages

Mark pages as static for faster delivery:

```typescript
// app/about/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default function AboutPage() {
  return <AboutContent />;
}
```

### Image Optimization

Use Next.js `<Image>` component:

```typescript
import Image from 'next/image';

<Image
  src="/vendor-photo.jpg"
  width={400}
  height={300}
  alt="Vendor"
  loading="lazy"
  placeholder="blur"
/>
```

Vercel automatically optimizes images to WebP and serves from edge CDN.

---

## Monitoring and Logging

### Vercel Analytics

Enable in Vercel Dashboard → **Analytics**:
- Page views
- Top pages
- Referrers
- Core Web Vitals (LCP, FID, CLS)

### Real-Time Logs

```bash
# Stream production logs
vercel logs --follow

# Stream specific deployment logs
vercel logs <deployment-url> --follow
```

### Log Retention

- **Free Tier**: 1 day
- **Pro Tier**: 7 days
- **Enterprise**: 30+ days

For longer retention, integrate with Sentry or Datadog.

### Error Tracking (Sentry)

See `lib/monitoring/sentry.ts` for Sentry integration.

---

## Troubleshooting

### Build Failures

**Issue**: Build fails with "Module not found"

**Solution**:
```bash
# Clear cache and rebuild
vercel build --force

# Check dependencies
npm install
npm run build  # Test locally first
```

### Environment Variable Issues

**Issue**: `process.env.DATABASE_URL` is `undefined`

**Solution**:
1. Check variable is added in Vercel Dashboard
2. Verify scope (Production/Preview/Development)
3. Redeploy: `vercel --prod --force`

### Cron Jobs Not Running

**Issue**: Cron jobs don't execute

**Solution**:
1. Check `vercel.json` syntax
2. Verify cron path matches API route (`/api/cron/payment-release`)
3. Check logs for authentication errors
4. Test endpoint manually: `curl https://fleetfeast.com/api/cron/payment-release -H "Authorization: Bearer <CRON_SECRET>"`

### Slow Response Times

**Issue**: API routes take >5 seconds

**Solution**:
1. Check database connection pooling (max 20 connections)
2. Verify Redis caching is working
3. Review Vercel Analytics for slow functions
4. Consider upgrading to Pro tier for faster functions

### Database Connection Errors

**Issue**: "Too many database connections"

**Solution**:
1. Reduce Prisma connection pool: `connection_limit=10`
2. Use connection pooling (PgBouncer for AWS RDS)
3. Close connections in API routes: `await prisma.$disconnect()`

---

## Cost Estimation

### Free Tier (Hobby)
- **Bandwidth**: 100GB/month
- **Build Minutes**: 6000 min/month
- **Serverless Functions**: 100GB-hrs
- **Suitable for**: MVP, <1000 users

**Estimated Cost**: $0/month

### Pro Tier
- **Bandwidth**: 1TB/month
- **Build Minutes**: Unlimited
- **Serverless Functions**: 1000GB-hrs
- **Suitable for**: 1K-10K users

**Estimated Cost**: $20/month

### Enterprise
- Custom limits
- Dedicated support
- **Suitable for**: 100K+ users

**Estimated Cost**: Contact Vercel sales

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Custom Domains](https://vercel.com/docs/custom-domains)

---

**Document Status**: Complete
**Reviewed By**: Devon_DevOps
**Last Updated**: 2025-12-04
