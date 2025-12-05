# Fleet Feast Infrastructure Documentation

**Last Updated**: 2025-12-04
**Reviewed By**: Devon_DevOps
**Status**: Complete

---

## Overview

This directory contains comprehensive infrastructure setup guides for Fleet Feast deployment. All documentation follows the architecture decisions outlined in `docs/architecture/DECISIONS.md` (particularly ADR-010 for Vercel hosting).

---

## Quick Start

### For MVP Deployment (Estimated Cost: $0-20/month)

1. **Database**: [Railway PostgreSQL](./DATABASE.md#railway-setup-recommended-for-mvp) (Free tier)
2. **Cache**: [Upstash Redis](./REDIS.md#upstash-setup-recommended-for-mvp) (Free tier)
3. **Storage**: [AWS S3](./STORAGE.md#aws-s3-setup-recommended) (~$2/month)
4. **Hosting**: [Vercel](./VERCEL.md) (Free tier)
5. **Email**: SendGrid (100 emails/day free)

**Setup Time**: ~2 hours

### For Production Deployment (Estimated Cost: $50-150/month)

1. **Database**: [AWS RDS PostgreSQL](./DATABASE.md#aws-rds-setup-production) ($15-50/month)
2. **Cache**: [AWS ElastiCache Redis](./REDIS.md#aws-elasticache-setup-production) ($15-50/month)
3. **Storage**: [AWS S3 + CloudFront](./STORAGE.md#aws-s3-setup-recommended) ($5-20/month)
4. **Hosting**: [Vercel Pro](./VERCEL.md) ($20/month)
5. **Email**: AWS SES or SendGrid Pro

**Setup Time**: ~4-6 hours

---

## Documentation Index

| Document | Purpose | Key Topics |
|----------|---------|------------|
| [VERCEL.md](./VERCEL.md) | Vercel deployment guide | Environment variables, custom domains, cron jobs, monitoring |
| [DATABASE.md](./DATABASE.md) | PostgreSQL setup | Railway vs AWS RDS, Prisma, migrations, connection pooling, backups |
| [REDIS.md](./REDIS.md) | Redis caching setup | Upstash vs ElastiCache, caching patterns, rate limiting, session storage |
| [STORAGE.md](./STORAGE.md) | File storage setup | AWS S3 vs Cloudinary, upload flows, image optimization, CDN |

---

## Environment Variables Summary

All environment variables are documented in `.env.example` at the project root. Below is a quick reference:

### Required for MVP

| Variable | Service | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | Railway/RDS | PostgreSQL connection string |
| `NEXTAUTH_URL` | App | Base URL for authentication |
| `NEXTAUTH_SECRET` | App | JWT signing secret |
| `STRIPE_SECRET_KEY` | Stripe | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook verification |
| `SENDGRID_API_KEY` | SendGrid | Email delivery |
| `AWS_ACCESS_KEY_ID` | AWS S3 | File storage credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 | File storage credentials |
| `AWS_S3_BUCKET` | AWS S3 | Storage bucket name |

### Optional but Recommended

| Variable | Service | Purpose |
|----------|---------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash | Caching (improves performance) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | Redis authentication |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry | Error tracking |
| `CRON_SECRET` | App | Cron job authentication |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google | Location features |

---

## Deployment Checklist

### Pre-Deployment

- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in all required environment variables
- [ ] Test local build: `npm run build`
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Seed database (if applicable): `npx prisma db seed`

### Vercel Setup

- [ ] Connect GitHub repository to Vercel
- [ ] Add all environment variables in Vercel Dashboard
- [ ] Configure custom domain (if applicable)
- [ ] Set up cron jobs (via `vercel.json`)
- [ ] Enable Vercel Analytics (optional)

### Database Setup

- [ ] Create PostgreSQL database (Railway or AWS RDS)
- [ ] Configure connection pooling (20 max connections recommended)
- [ ] Enable automated backups (7-day retention minimum)
- [ ] Test connection: `npx prisma db execute --url "..." --stdin <<< "SELECT NOW();"`

### Redis Setup (Optional)

- [ ] Create Redis instance (Upstash or AWS ElastiCache)
- [ ] Add connection details to environment variables
- [ ] Test connection locally

### Storage Setup

- [ ] Create S3 bucket with public read for `public/*` folder
- [ ] Configure CORS to allow Vercel domain
- [ ] Create IAM user with S3 access
- [ ] Generate access keys and add to environment variables

### Email Setup

- [ ] Create SendGrid account (or AWS SES)
- [ ] Generate API key
- [ ] Verify sender email/domain
- [ ] Add credentials to environment variables

### Monitoring Setup (Recommended)

- [ ] Create Sentry.io project
- [ ] Add Sentry DSN to environment variables
- [ ] Configure error tracking in `lib/monitoring/sentry.ts`

### Post-Deployment

- [ ] Test authentication flow (login, signup)
- [ ] Test payment flow (Stripe test mode)
- [ ] Test file uploads (S3)
- [ ] Test email delivery (welcome email)
- [ ] Verify cron jobs are running (check Vercel logs)
- [ ] Monitor error rates (Sentry)
- [ ] Check performance metrics (Vercel Analytics)

---

## Cost Breakdown

### MVP Tier (0-1K users)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Hobby | $0 |
| Railway PostgreSQL | Free | $0 |
| Upstash Redis | Free | $0 |
| AWS S3 | Pay-as-you-go | $2-5 |
| SendGrid | Free (100/day) | $0 |
| **Total** | | **$2-5/month** |

### Production Tier (1K-10K users)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Pro | $20 |
| AWS RDS (db.t3.micro) | Reserved | $15-30 |
| AWS ElastiCache (cache.t3.micro) | On-demand | $15-25 |
| AWS S3 + CloudFront | Pay-as-you-go | $10-20 |
| SendGrid | Essentials | $15 |
| **Total** | | **$75-110/month** |

### Scale Tier (10K-100K users)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Enterprise | $200+ |
| AWS RDS (db.t3.large) | Reserved | $100-150 |
| AWS ElastiCache (cache.r6g.large) | On-demand | $100-150 |
| AWS S3 + CloudFront | Pay-as-you-go | $50-100 |
| SendGrid | Pro | $90 |
| **Total** | | **$540-690/month** |

---

## Architecture Decisions Reference

All infrastructure choices align with the following ADRs:

- **ADR-001**: Next.js App Router (enables Vercel optimization)
- **ADR-002**: Prisma ORM (simplifies database management)
- **ADR-004**: Monolithic architecture (single deployment to Vercel)
- **ADR-006**: Stripe Connect (marketplace payments with escrow)
- **ADR-007**: Manual payment capture (7-day escrow window)
- **ADR-010**: Vercel hosting (zero-config, automatic scaling)

See `docs/architecture/DECISIONS.md` for full rationale.

---

## Scaling Strategy

### Database Scaling

**0-10K users**: Single PostgreSQL instance (Railway or db.t3.micro RDS)
- Connection pooling: 20 max connections
- No read replicas needed

**10K-100K users**: Upgrade to db.t3.medium + read replica
- Master for writes
- Replica for reads (vendor search, listings)
- Connection pooling: 50-100 max connections

**100K+ users**: Multi-AZ deployment + multiple read replicas
- Partition tables (bookings by date, messages by booking)
- Archive old data to S3 (>1 year old bookings)

### Caching Scaling

**0-10K users**: Upstash Redis (free tier sufficient)
- 30-minute TTL for vendor profiles
- 5-minute TTL for search results

**10K-100K users**: AWS ElastiCache (cache.t3.micro → cache.r6g.large)
- Add Redis cluster for high availability
- Implement cache warming for popular vendors

**100K+ users**: Multi-node Redis cluster
- Separate clusters for sessions vs caching
- Pub/Sub for real-time messaging

### Storage Scaling

**0-100K users**: Single S3 bucket + CloudFront
- Lifecycle policy: Archive to Glacier after 90 days

**100K+ users**: Multiple S3 buckets by region
- CloudFront with regional edge caches
- Image CDN (Cloudinary or imgproxy) for on-the-fly transformations

---

## Security Best Practices

### Environment Variables

- ✅ Never commit `.env.local` or `.env.production` to Git
- ✅ Use Vercel's encrypted environment variable storage
- ✅ Rotate secrets every 90 days (database passwords, API keys)
- ✅ Use separate credentials for dev/staging/production

### Database

- ✅ Enable SSL/TLS for database connections (RDS default)
- ✅ Restrict security group to Vercel IP ranges (or use VPN)
- ✅ Use IAM authentication instead of passwords (AWS RDS)
- ✅ Enable automatic backups with 7-day retention minimum

### File Storage

- ✅ Use presigned URLs with 1-hour expiration for downloads
- ✅ Scan uploads for malware (integrate ClamAV or AWS GuardDuty)
- ✅ Validate file types and sizes server-side
- ✅ Store sensitive documents in private S3 folders (not `public/`)

### API Security

- ✅ Rate limit all endpoints (see `REDIS.md` for implementation)
- ✅ Validate all inputs with Zod schemas
- ✅ Use CSRF protection (Next.js built-in for Server Actions)
- ✅ Set security headers (configured in `vercel.json`)

---

## Monitoring and Alerts

### Key Metrics to Track

**Application Performance**:
- Response time (P50, P95, P99)
- Error rate (4xx, 5xx)
- API endpoint latency
- Cron job success rate

**Infrastructure Health**:
- Database connection count
- Redis memory usage
- S3 storage usage
- Vercel function execution time

**Business Metrics**:
- Booking creation rate
- Payment success rate
- Vendor onboarding completion
- User signups

### Recommended Tools

| Tool | Purpose | Cost |
|------|---------|------|
| Vercel Analytics | Performance monitoring | Free (built-in) |
| Sentry | Error tracking | Free tier available |
| AWS CloudWatch | Infrastructure metrics | Pay-as-you-go |
| Uptime Robot | Uptime monitoring | Free tier available |

---

## Troubleshooting

### Common Issues

**"Too many database connections"**
- Solution: Reduce `connection_limit` in `DATABASE_URL` (see [DATABASE.md](./DATABASE.md#connection-pooling))

**"Redis connection timeout"**
- Solution: Check Redis instance is running, verify credentials (see [REDIS.md](./REDIS.md#troubleshooting))

**"S3 access denied"**
- Solution: Verify IAM user has `s3:PutObject` and `s3:GetObject` permissions (see [STORAGE.md](./STORAGE.md#security))

**"Vercel deployment failed"**
- Solution: Check build logs, verify environment variables are set (see [VERCEL.md](./VERCEL.md#troubleshooting))

**"Stripe webhook verification failed"**
- Solution: Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard (see [VERCEL.md](./VERCEL.md#environment-variables))

---

## Support and Resources

### Official Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe Docs](https://stripe.com/docs)
- [AWS Docs](https://docs.aws.amazon.com)

### Community Resources

- [Next.js Discord](https://discord.gg/nextjs)
- [Prisma Slack](https://slack.prisma.io)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Internal Documentation

- [Architecture Overview](../architecture/ARCHITECTURE.md)
- [Architecture Decisions](../architecture/DECISIONS.md)
- [API Registry](../API_Registry.md)
- [Database Schema](../database/SCHEMA.md)

---

**Document Status**: Complete
**Maintained By**: DevOps Team (Devon_DevOps)
**Next Review**: 2025-03-04 (quarterly)
