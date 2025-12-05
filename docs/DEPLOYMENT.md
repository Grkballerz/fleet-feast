# Fleet Feast - Deployment Guide

**Last Updated**: 2025-12-04
**Status**: Production-ready
**Audience**: DevOps engineers, deployment managers

---

## Table of Contents

1. [Overview](#overview)
2. [Deployment Strategy](#deployment-strategy)
3. [Environments](#environments)
4. [Vercel Deployment](#vercel-deployment)
5. [Database Setup](#database-setup)
6. [Environment Variables](#environment-variables)
7. [Cron Jobs](#cron-jobs)
8. [Monitoring](#monitoring)
9. [Rollback Procedures](#rollback-procedures)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Fleet Feast uses a **serverless deployment architecture** with:
- **Application**: Next.js on Vercel
- **Database**: PostgreSQL on AWS RDS
- **Cache**: Redis on AWS ElastiCache
- **File Storage**: AWS S3
- **Email**: AWS SES

**Deployment flow**:
```
Git Push → Vercel Build → Edge Deploy → Live
```

---

## Deployment Strategy

### CI/CD Pipeline

```
Development
    ↓
Feature branch → Vercel preview deployment
    ↓
Pull request → Code review + automated preview
    ↓
Merge to main → Automatic production deployment
    ↓
Production (live)
```

### Deployment Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| **Development** | Local | `http://localhost:3000` | Local development |
| **Preview** | Feature branches | `feature-xyz.vercel.app` | PR previews |
| **Staging** | `staging` | `staging.fleetfeast.com` | Pre-production testing |
| **Production** | `main` | `fleetfeast.com` | Live application |

---

## Environments

### Development (Local)

**Purpose**: Local development and testing

**Setup**:
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with local credentials

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

**Database**: Local PostgreSQL or Neon free tier

### Preview (Vercel)

**Purpose**: Automated preview deployments for every pull request

**Trigger**: Automatically created on PR creation
**URL**: `https://<branch-name>-fleet-feast.vercel.app`

**Features**:
- Full application environment
- Shared staging database
- Preview-specific environment variables
- Automatic cleanup after PR merge/close

### Staging

**Purpose**: Pre-production testing environment

**Setup**:
1. Create `staging` branch in GitHub
2. Deploy to Vercel staging project
3. Use staging database and services

**Database**: Separate PostgreSQL instance (smaller size)
**Testing**: Manual QA, integration tests, load testing

### Production

**Purpose**: Live application serving real users

**Trigger**: Merge to `main` branch
**URL**: `https://fleetfeast.com`

**Infrastructure**:
- Vercel Edge Network (global CDN)
- AWS RDS (Multi-AZ)
- AWS ElastiCache (Redis cluster)
- AWS S3 (multi-region)

---

## Vercel Deployment

### Initial Setup

#### 1. Create Vercel Account

1. Sign up at [vercel.com](https://vercel.com)
2. Connect GitHub account
3. Import the Fleet Feast repository

#### 2. Configure Project

```bash
# Install Vercel CLI (optional)
npm install -g vercel

# Login
vercel login

# Link project
vercel link
```

#### 3. Project Settings

In Vercel dashboard:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

#### 4. Environment Variables

Add all required environment variables (see [Environment Variables](#environment-variables) section).

### Automatic Deployments

**On every push to `main`**:
```
1. Vercel detects push
2. Runs build process
3. Executes database migrations
4. Deploys to production
5. Sends notification
```

**On every pull request**:
```
1. Vercel creates preview deployment
2. Builds PR branch
3. Deploys to preview URL
4. Comments URL on PR
```

### Manual Deployment

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Deploy specific branch
vercel --branch=feature-branch
```

### Build Configuration

Create `vercel.json` in project root:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "REDIS_URL": "@redis-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "STRIPE_SECRET_KEY": "@stripe-secret-key"
  },
  "crons": [
    {
      "path": "/api/cron/payment-release",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/notifications",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## Database Setup

### PostgreSQL (AWS RDS)

#### 1. Create RDS Instance

**Via AWS Console**:
1. Go to RDS dashboard
2. Click "Create database"
3. Select PostgreSQL 15+
4. Choose instance size:
   - **Development/Staging**: db.t3.medium (2 vCPU, 4GB RAM)
   - **Production**: db.t3.large or larger

**Configuration**:
```
Engine: PostgreSQL 15.x
Instance class: db.t3.large
Storage: 100 GB SSD (gp3)
Multi-AZ: Yes (production only)
VPC: Default or custom
Public access: No
Backup retention: 7 days
Encryption: Enabled (AES-256)
```

#### 2. Configure Security Group

Allow connections from:
- Vercel IP ranges (see Vercel docs)
- Your development machines (if needed)

```bash
# Inbound rules
Type: PostgreSQL
Port: 5432
Source: <Vercel IP ranges>
```

#### 3. Create Database

```bash
# Connect to RDS instance
psql -h <rds-endpoint> -U postgres

# Create database
CREATE DATABASE fleet_feast;

# Create user (if needed)
CREATE USER fleet_feast_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE fleet_feast TO fleet_feast_user;
```

#### 4. Run Migrations

```bash
# Set DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@rds-endpoint:5432/fleet_feast"

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma studio
```

### Redis (AWS ElastiCache)

#### 1. Create ElastiCache Cluster

**Via AWS Console**:
1. Go to ElastiCache dashboard
2. Choose Redis
3. Create cluster

**Configuration**:
```
Engine: Redis 7.x
Node type: cache.t3.micro (dev) or cache.t3.small (prod)
Number of replicas: 1 (production)
Multi-AZ: Yes (production)
Encryption: Enabled
```

#### 2. Get Connection String

```bash
# Primary endpoint
redis://<elasticache-endpoint>:6379

# Add to Vercel environment variables
REDIS_URL="redis://<endpoint>:6379"
```

### Database Migrations

#### Development

```bash
# Create a new migration
npx prisma migrate dev --name add_feature_name

# What this does:
# 1. Generates SQL migration file
# 2. Applies migration to dev database
# 3. Regenerates Prisma Client
```

#### Staging/Production

```bash
# Deploy migrations (non-interactive)
npx prisma migrate deploy

# What this does:
# 1. Applies pending migrations
# 2. Does NOT create new migrations
# 3. Suitable for CI/CD
```

**Vercel Build Process**:
```json
// package.json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

## Environment Variables

### Required Variables

#### Database & Cache

```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Redis connection string
REDIS_URL="redis://host:6379"
REDIS_TOKEN="token"  # If using Upstash
```

#### Authentication

```bash
# NextAuth.js configuration
NEXTAUTH_URL="https://fleetfeast.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Example generation:
# openssl rand -base64 32
```

#### Stripe

```bash
# Stripe API keys (use live keys for production!)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Platform account ID
STRIPE_PLATFORM_ACCOUNT_ID="acct_..."
```

#### AWS Services

```bash
# S3 configuration
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="fleet-feast-production"
AWS_S3_REGION="us-east-1"

# SES (email)
AWS_SES_REGION="us-east-1"
SENDGRID_API_KEY="SG...."  # Or use AWS SES credentials
SENDGRID_FROM_EMAIL="noreply@fleetfeast.com"
```

#### Application Configuration

```bash
# Public URLs
NEXT_PUBLIC_APP_URL="https://fleetfeast.com"

# Node environment
NODE_ENV="production"

# Platform settings
PLATFORM_FEE_PERCENTAGE=15
ESCROW_HOLD_DAYS=7
MAX_FILE_SIZE_MB=10
```

#### Monitoring

```bash
# Sentry error tracking
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="..."  # For source map upload
```

#### Optional

```bash
# Google Maps (if using)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."

# Feature flags
ENABLE_REAL_TIME_MESSAGING=false
ENABLE_MOBILE_APP_API=false
```

### Setting Variables in Vercel

#### Via Dashboard

1. Go to project settings
2. Click "Environment Variables"
3. Add each variable:
   - Name: `DATABASE_URL`
   - Value: `postgresql://...`
   - Environments: Production, Preview, Development

#### Via CLI

```bash
# Add production variable
vercel env add DATABASE_URL production

# Add to all environments
vercel env add NEXTAUTH_SECRET

# Pull environment variables locally
vercel env pull .env.local
```

### Environment Variable Best Practices

1. **Never commit secrets**: Use `.env.local` (gitignored)
2. **Use Vercel secrets**: For sensitive values
3. **Prefix public vars**: Use `NEXT_PUBLIC_` for browser-accessible vars
4. **Separate by environment**: Different values for dev/staging/prod
5. **Document all variables**: Keep `.env.example` updated

---

## Cron Jobs

### Vercel Cron Configuration

**In `vercel.json`**:
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
    }
  ]
}
```

### Cron Job Endpoints

#### 1. Payment Release (Daily at 2 AM)

**Path**: `/api/cron/payment-release/route.ts`

**Purpose**: Release escrow payments after 7-day hold

**Implementation**:
```typescript
export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Find payments ready for release
  const payments = await prisma.payment.findMany({
    where: {
      status: 'CAPTURED',
      capturedAt: {
        lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Release each payment
  for (const payment of payments) {
    await paymentService.release(payment.id);
  }

  return Response.json({ released: payments.length });
}
```

#### 2. Email Notifications (Every 5 minutes)

**Path**: `/api/cron/notifications/route.ts`

**Purpose**: Process email notification queue

#### 3. Cache Cleanup (Hourly)

**Path**: `/api/cron/cache-cleanup/route.ts`

**Purpose**: Remove expired cache entries

### Securing Cron Jobs

```bash
# Add CRON_SECRET to environment variables
CRON_SECRET="generate-random-secret"

# Verify in cron handlers
if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  return unauthorized();
}
```

---

## Monitoring

### Vercel Analytics

**Built-in metrics**:
- Page views
- Unique visitors
- Top pages
- Performance metrics (Core Web Vitals)

**Access**: Vercel dashboard → Analytics

### Sentry Error Tracking

**Setup**:
1. Create account at [sentry.io](https://sentry.io)
2. Create new project (Next.js)
3. Add DSN to environment variables
4. Install Sentry SDK:

```bash
npm install @sentry/nextjs
```

**Configuration** (`sentry.client.config.js`):
```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Database Monitoring

**AWS RDS CloudWatch metrics**:
- CPU utilization
- Database connections
- Read/write IOPS
- Free storage space

**Alerts**:
- CPU > 80% for 5 minutes
- Free storage < 10 GB
- Connection count > 80% of max

### Application Logs

**Vercel Runtime Logs**:
```bash
# View real-time logs
vercel logs --follow

# Filter by function
vercel logs /api/bookings
```

**Structured logging**:
```typescript
console.log(JSON.stringify({
  level: 'info',
  message: 'Booking created',
  userId: user.id,
  bookingId: booking.id,
  timestamp: new Date().toISOString(),
}));
```

---

## Rollback Procedures

### Instant Rollback (Vercel)

**Via Dashboard**:
1. Go to Deployments tab
2. Find previous working deployment
3. Click "Promote to Production"

**Via CLI**:
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Database Rollback

**Revert migration**:
```bash
# WARNING: This will lose data!
npx prisma migrate reset

# Better: Create new migration to undo changes
npx prisma migrate dev --name revert_feature_name
```

**Restore from backup**:
```bash
# AWS RDS automatic backups (point-in-time recovery)
# Via AWS Console: RDS → Snapshots → Restore
```

### Emergency Procedures

**Complete outage**:
1. Check Vercel status page
2. Check AWS service health
3. Review recent deployments
4. Rollback to last known good deployment
5. Notify users (status page)

**Database issues**:
1. Check RDS metrics
2. Review slow query logs
3. Check connection pool
4. Increase instance size if needed
5. Failover to replica (if Multi-AZ)

---

## Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

**Error: "Type errors"**
```bash
# Check TypeScript
npm run type-check

# Regenerate Prisma Client
npx prisma generate
```

### Deployment Issues

**Error: "Environment variable missing"**
- Check all required variables are set in Vercel
- Ensure variables are assigned to correct environments

**Error: "Build timeout"**
- Increase Vercel timeout (Pro plan)
- Optimize build process
- Remove unnecessary dependencies

### Runtime Errors

**Database connection errors**
- Check DATABASE_URL is correct
- Verify RDS security group allows Vercel IPs
- Check connection pool settings

**Stripe webhook failures**
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check webhook endpoint is accessible
- Review Stripe dashboard for failed events

### Performance Issues

**Slow API responses**
- Check database query performance
- Enable Redis caching
- Review database indexes
- Monitor RDS CloudWatch metrics

**High memory usage**
- Increase Vercel function memory
- Optimize database queries
- Reduce bundle size

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database migrations tested in staging
- [ ] Stripe webhooks configured
- [ ] AWS services (S3, SES, RDS) set up
- [ ] Sentry error tracking enabled
- [ ] Vercel cron jobs configured
- [ ] DNS records configured (if custom domain)
- [ ] SSL certificate valid
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented
- [ ] Team notified of deployment

---

## Additional Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **AWS RDS Guide**: [docs.aws.amazon.com/rds](https://docs.aws.amazon.com/rds)
- **Stripe Connect**: [stripe.com/docs/connect](https://stripe.com/docs/connect)
- **Sentry Next.js**: [docs.sentry.io/platforms/javascript/guides/nextjs](https://docs.sentry.io/platforms/javascript/guides/nextjs)

---

**Deployment is ready! For questions, contact DevOps team or see [CONTRIBUTING.md](./CONTRIBUTING.md).**
