# Uptime Monitoring & Site Reliability

**Fleet Feast - Monitoring & Alerting**
**Version**: 1.0
**Last Updated**: 2025-12-04

---

## Table of Contents

1. [Overview](#overview)
2. [SLA Targets](#sla-targets)
3. [Monitoring Tools](#monitoring-tools)
4. [Health Check Endpoints](#health-check-endpoints)
5. [Uptime Monitoring Setup](#uptime-monitoring-setup)
6. [Status Page](#status-page)
7. [Incident Response](#incident-response)
8. [Best Practices](#best-practices)

---

## Overview

Uptime monitoring ensures Fleet Feast remains accessible and performant for users. This document covers monitoring infrastructure, SLA targets, and incident response procedures.

### Key Goals

- **99.5% Uptime SLA**: Maximum 3.6 hours downtime per month
- **< 500ms API Response Time**: p95 latency target
- **< 2.5s Page Load (LCP)**: Core Web Vitals target
- **Real-time Alerting**: Incident detection within 1 minute

---

## SLA Targets

### Availability Targets

| Service | Monthly Uptime | Max Downtime/Month | Max Downtime/Year |
|---------|----------------|---------------------|-------------------|
| **Production** | 99.5% | 3.6 hours | 43.2 hours |
| **Staging** | 99.0% | 7.2 hours | - |
| **Development** | Best effort | - | - |

### Performance Targets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **Page Load (LCP)** | < 2.5s | > 2.5s | > 3.5s |
| **API Response (p95)** | < 500ms | > 500ms | > 1000ms |
| **Database Query** | < 100ms | > 200ms | > 500ms |
| **Time to First Byte (TTFB)** | < 800ms | > 1000ms | > 1500ms |

### Error Rate Targets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **HTTP 5xx Errors** | < 0.1% | > 0.5% | > 1.0% |
| **HTTP 4xx Errors** | < 1% | > 5% | > 10% |
| **Failed Payments** | < 0.5% | > 1% | > 2% |

---

## Monitoring Tools

### Recommended Services

#### 1. UptimeRobot (Recommended)

**Pros**:
- Free tier: 50 monitors, 5-minute intervals
- Multi-location checks (13 locations)
- Public status pages
- Alert channels: Email, SMS, Slack, PagerDuty

**Pricing**:
- **Free**: 50 monitors, 5-min checks
- **Pro**: $7/mo, 1-min checks, advanced alerts

**Setup**: See [UptimeRobot Setup](#uptimerobot-setup) below

#### 2. Better Uptime (Alternative)

**Pros**:
- Modern UI
- Incident management built-in
- Status pages included
- On-call scheduling

**Pricing**:
- **Free**: 10 monitors, 3-min checks
- **Team**: $20/mo, 1-min checks, unlimited monitors

#### 3. Pingdom (Enterprise)

**Pros**:
- Detailed transaction monitoring
- Advanced scripting
- Root cause analysis

**Pricing**:
- **Starter**: $10/mo, 10 monitors
- **Advanced**: $42/mo, 50 monitors

### Built-in Monitoring

#### Vercel Monitoring

Vercel provides built-in monitoring:
- Function execution logs
- Function duration
- Function errors
- Deployment logs

Access via: Vercel Dashboard → Monitoring

#### AWS CloudWatch (for RDS/ElastiCache)

If using AWS infrastructure:
- Database CPU/memory
- Redis cache hit rate
- Network throughput

---

## Health Check Endpoints

### Implement Health Check API

Create `/api/health/route.ts`:

```typescript
import { performHealthCheck } from '@/lib/monitoring';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const health = await performHealthCheck();

    const statusCode = health.status === 'healthy' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
```

### Health Check Response Format

```json
{
  "status": "healthy",
  "timestamp": "2025-12-04T10:30:00Z",
  "checks": {
    "database": true,
    "redis": true,
    "stripe": true
  },
  "responseTime": 45
}
```

### Database Health Check

```typescript
// lib/monitoring/health.ts
export async function checkDatabase(): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('[Health] Database check failed:', error);
    return false;
  }
}
```

### Redis Health Check

```typescript
export async function checkRedis(): Promise<boolean> {
  try {
    if (!process.env.REDIS_URL) return true; // Optional in dev

    const redis = await import('@/lib/redis');
    await redis.default.ping();
    return true;
  } catch (error) {
    console.error('[Health] Redis check failed:', error);
    return false;
  }
}
```

### External Service Health Check

```typescript
export async function checkStripe(): Promise<boolean> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return true; // Optional in dev

    const stripe = await import('stripe');
    const stripeClient = new stripe.default(process.env.STRIPE_SECRET_KEY);
    // Lightweight check - just verify API key
    await stripeClient.balance.retrieve();
    return true;
  } catch (error) {
    console.error('[Health] Stripe check failed:', error);
    return false;
  }
}
```

---

## Uptime Monitoring Setup

### UptimeRobot Setup

#### 1. Create Account

Sign up at [uptimerobot.com](https://uptimerobot.com)

#### 2. Add Monitors

Create the following monitors:

##### Monitor 1: Production Homepage

- **Type**: HTTP(s)
- **URL**: `https://fleetfeast.com`
- **Interval**: 5 minutes (Free) or 1 minute (Pro)
- **Monitoring Locations**: All available
- **Expected Status Code**: 200

##### Monitor 2: Production API Health

- **Type**: HTTP(s)
- **URL**: `https://fleetfeast.com/api/health`
- **Interval**: 5 minutes
- **Monitoring Locations**: All available
- **Expected Status Code**: 200
- **Expected Content**: `"status":"healthy"`

##### Monitor 3: Production Booking Page

- **Type**: HTTP(s)
- **URL**: `https://fleetfeast.com/vendors`
- **Interval**: 10 minutes
- **Expected Status Code**: 200

##### Monitor 4: Staging Environment

- **Type**: HTTP(s)
- **URL**: `https://staging.fleetfeast.com`
- **Interval**: 10 minutes
- **Expected Status Code**: 200

#### 3. Configure Alerts

Set up alert contacts:

**Slack Integration**:
1. UptimeRobot → My Settings → Add Alert Contact
2. Select "Slack"
3. Webhook URL: From Slack Incoming Webhooks app
4. Channel: `#alerts-critical`

**Email Alerts**:
1. Add your team email: `team@fleetfeast.com`
2. Enable for all monitors
3. Alert when: Down, Up

**SMS Alerts (Optional)**:
1. Add phone numbers for on-call team
2. Enable for critical monitors only
3. Alert when: Down only

#### 4. Create Status Page

1. UptimeRobot → Public Status Pages → Add New
2. Custom subdomain: `status.fleetfeast.com`
3. Add monitors: All production monitors
4. Customize:
   - Logo: Fleet Feast logo
   - Colors: Brand colors
   - Custom domain: Add DNS CNAME record

##### DNS Configuration for Status Page

```
# CNAME record
status.fleetfeast.com → stats.uptimerobot.com
```

---

## Status Page

### Public Status Page

Display system status at `status.fleetfeast.com`:

**Visible Metrics**:
- Current system status (operational, degraded, down)
- Uptime percentage (last 90 days)
- Response time graph
- Incident history

### Custom Status Page (Alternative)

Build your own status page:

#### Create `/status` Page

```typescript
// app/status/page.tsx
import { getSystemStatus } from '@/lib/monitoring';

export default async function StatusPage() {
  const status = await getSystemStatus();

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Fleet Feast System Status</h1>

      <div className="grid gap-4">
        {status.services.map((service) => (
          <div key={service.name} className="border rounded p-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">{service.name}</h2>
              <StatusBadge status={service.status} />
            </div>
            <p className="text-sm text-gray-600">
              Uptime: {service.uptime}% | Response: {service.responseTime}ms
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Incident Response

### Incident Severity Levels

| Level | Criteria | Response Time | Notification |
|-------|----------|---------------|--------------|
| **P1 - Critical** | Production down, payment failures | < 15 min | PagerDuty + Phone |
| **P2 - High** | Degraded performance (> 2x normal) | < 30 min | Slack + Email |
| **P3 - Medium** | Non-critical feature broken | < 2 hours | Slack |
| **P4 - Low** | Minor issue, no user impact | < 24 hours | Email |

### Incident Workflow

```
1. Detection → Alert triggered
   ↓
2. Acknowledgment → On-call engineer notified
   ↓
3. Investigation → Root cause analysis
   ↓
4. Mitigation → Immediate fix or rollback
   ↓
5. Resolution → Full fix deployed
   ↓
6. Postmortem → Document lessons learned
```

### Example Alert Flow

#### Scenario: API Response Time > 1000ms

```
10:00 AM - UptimeRobot detects slow response
10:00 AM - Slack alert sent to #alerts-critical
10:01 AM - On-call engineer acknowledges
10:02 AM - Check Vercel logs for errors
10:03 AM - Identify slow database query
10:05 AM - Add database index
10:10 AM - Response time back to normal
10:15 AM - Post incident summary to Slack
```

---

## Best Practices

### 1. Multi-Location Monitoring

Monitor from multiple geographic locations:
- **US East**: Primary user base
- **US West**: Secondary user base
- **Europe**: International users
- **Asia**: Future expansion

### 2. Synthetic Monitoring

Create synthetic transactions:

```typescript
// Test critical user flow
async function syntheticBookingTest() {
  // 1. Load vendor page
  const vendor = await fetch('/api/vendors/123');

  // 2. Create booking
  const booking = await fetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(testBookingData),
  });

  // 3. Verify booking created
  assert(booking.status === 200);
}
```

Run via UptimeRobot "Transaction Monitor" (paid feature)

### 3. Cascading Alerts

Configure alert escalation:

```
5 minutes down → Slack (#alerts-critical)
10 minutes down → Email (team@fleetfeast.com)
15 minutes down → PagerDuty (on-call engineer)
30 minutes down → SMS (management)
```

### 4. Maintenance Windows

Schedule maintenance windows:
1. Announce via status page 48 hours in advance
2. Choose low-traffic time (2-4 AM local)
3. Pause uptime alerts during window
4. Post completion update

### 5. Historical Data

Track historical uptime:
- **Last 24 hours**: 100% expected
- **Last 7 days**: > 99.9%
- **Last 30 days**: > 99.5%
- **Last 90 days**: > 99.5%

---

## Downtime Budget

With 99.5% SLA, you have:

| Period | Allowed Downtime |
|--------|------------------|
| **Daily** | 7.2 minutes |
| **Weekly** | 50.4 minutes |
| **Monthly** | 3.6 hours |
| **Yearly** | 43.2 hours |

Track actual downtime vs budget monthly.

---

## Monitoring Checklist

### Daily

- [ ] Check uptime dashboard
- [ ] Review critical alerts (if any)
- [ ] Verify all monitors are green
- [ ] Check response time trends

### Weekly

- [ ] Review weekly uptime report
- [ ] Analyze slow response incidents
- [ ] Update status page if needed
- [ ] Review downtime budget

### Monthly

- [ ] Generate uptime report
- [ ] Review SLA compliance
- [ ] Update monitoring thresholds
- [ ] Conduct incident retrospective

---

## Related Documentation

- [ALERTING.md](./ALERTING.md) - Alert rules and thresholds
- [ON_CALL.md](./ON_CALL.md) - Incident response process
- [SENTRY.md](./SENTRY.md) - Error tracking setup

---

**Document Status**: Complete
**Review Date**: 2025-12-04
**Next Review**: 2026-01-04
