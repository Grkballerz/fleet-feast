# Alert Rules & Thresholds

**Fleet Feast - Monitoring & Alerting**
**Version**: 1.0
**Last Updated**: 2025-12-04

---

## Table of Contents

1. [Overview](#overview)
2. [Alert Severity Levels](#alert-severity-levels)
3. [Alert Thresholds](#alert-thresholds)
4. [Alert Channels](#alert-channels)
5. [Alert Rules](#alert-rules)
6. [Alert Fatigue Prevention](#alert-fatigue-prevention)
7. [Alert Response Playbooks](#alert-response-playbooks)
8. [Alert Configuration](#alert-configuration)

---

## Overview

This document defines alert rules, thresholds, and response procedures for Fleet Feast. Proper alerting ensures issues are detected early while minimizing noise and false positives.

### Alert Philosophy

1. **Alert on Symptoms, Not Causes**: Alert when users are impacted, not on internal metrics
2. **Actionable Alerts Only**: Every alert should require a human action
3. **Minimize False Positives**: Tune thresholds to avoid alert fatigue
4. **Escalate Appropriately**: Route alerts to the right people at the right time

---

## Alert Severity Levels

| Level | Description | Response Time | Notification | Examples |
|-------|-------------|---------------|--------------|----------|
| **CRITICAL** | Service down, severe user impact | < 15 min | PagerDuty + Phone + Slack | Production outage, payment processor down |
| **HIGH** | Degraded performance, partial outage | < 30 min | Slack + Email | API latency > 2s, 5xx error spike |
| **MEDIUM** | Potential issue, no immediate impact | < 2 hours | Slack | High memory usage, slow queries |
| **LOW** | Informational, no user impact | < 24 hours | Email | Scheduled job failure, cache miss rate |

---

## Alert Thresholds

### Performance Thresholds (from PRD)

| Metric | Good | Warning | Critical | Source |
|--------|------|---------|----------|--------|
| **Page Load (LCP)** | < 2.5s | > 2.5s | > 3.5s | Vercel Speed Insights |
| **API Response (p95)** | < 500ms | > 500ms | > 1000ms | Sentry Performance |
| **Database Query** | < 100ms | > 200ms | > 500ms | Prisma logs |
| **TTFB** | < 800ms | > 1000ms | > 1500ms | Vercel Analytics |

### Error Rate Thresholds

| Metric | Normal | Warning | Critical | Source |
|--------|--------|---------|----------|--------|
| **5xx Errors** | < 0.1% | > 0.5% | > 1.0% | Sentry |
| **4xx Errors** | < 1% | > 5% | > 10% | Sentry |
| **Failed Payments** | < 0.5% | > 1% | > 2% | Stripe Webhooks |
| **Failed Bookings** | < 0.5% | > 2% | > 5% | Application logs |

### Availability Thresholds

| Metric | Target | Warning | Critical | Source |
|--------|--------|---------|----------|--------|
| **Uptime** | 99.5% | < 99.5% | < 99.0% | UptimeRobot |
| **API Availability** | 99.9% | < 99.5% | < 99.0% | Health checks |
| **Database Uptime** | 99.9% | < 99.9% | < 99.5% | AWS RDS |

### Resource Utilization Thresholds

| Resource | Normal | Warning | Critical | Source |
|----------|--------|---------|----------|--------|
| **Database CPU** | < 70% | > 80% | > 90% | AWS CloudWatch |
| **Database Memory** | < 80% | > 85% | > 95% | AWS CloudWatch |
| **Redis Memory** | < 80% | > 90% | > 95% | ElastiCache Metrics |
| **Vercel Function Duration** | < 8s | > 9s | > 10s | Vercel Logs |

---

## Alert Channels

### Primary Channels

#### 1. Slack

**Channels**:
- `#alerts-critical`: P1/P2 alerts only
- `#alerts-monitoring`: All alerts (P3/P4 included)
- `#alerts-deployments`: Deployment notifications

**Configuration**:
```json
{
  "channel": "#alerts-critical",
  "username": "Fleet Feast Monitoring",
  "icon_emoji": ":rotating_light:",
  "severity_colors": {
    "CRITICAL": "#FF0000",
    "HIGH": "#FF6600",
    "MEDIUM": "#FFCC00",
    "LOW": "#00CC00"
  }
}
```

#### 2. Email

**Recipients**:
- `team@fleetfeast.com`: All alerts
- `devops@fleetfeast.com`: Infrastructure alerts
- `oncall@fleetfeast.com`: Critical alerts only

**Format**:
```
Subject: [CRITICAL] Production API Down - 5xx Error Rate 100%

Alert: Production API Down
Severity: CRITICAL
Time: 2025-12-04 10:30:00 UTC
Duration: 5 minutes
Impact: All API requests failing

Details:
- 5xx error rate: 100%
- Affected endpoints: /api/*
- Failed requests: 1,234 in last 5 min

Runbook: https://docs.fleetfeast.com/runbooks/api-down
```

#### 3. PagerDuty (Critical Only)

**Integration**:
- Critical alerts only (P1)
- Auto-escalate after 15 minutes if not acknowledged
- On-call rotation schedule

**Escalation**:
```
0 min: Primary on-call (phone + SMS + push)
15 min: Secondary on-call
30 min: Engineering manager
45 min: CTO
```

#### 4. SMS (Management)

**Recipients**:
- CTO: All critical alerts
- Product Manager: Payment failures only
- On-call engineer: Critical alerts

---

## Alert Rules

### Critical Alerts (P1)

#### ALERT-001: Production Outage

**Condition**:
```
uptime < 100% for 5 consecutive minutes
OR 5xx error rate > 50% for 2 minutes
```

**Channels**: PagerDuty, Slack (#alerts-critical), Email (team@)

**Runbook**: [Production Outage Response](#alert-response-production-outage)

---

#### ALERT-002: Payment Processor Down

**Condition**:
```
Stripe webhook failures > 10 in 5 minutes
OR payment success rate < 50% for 5 minutes
```

**Channels**: PagerDuty, Slack (#alerts-critical), Email (team@), SMS (CTO)

**Runbook**: [Payment Failure Response](#alert-response-payment-failure)

---

#### ALERT-003: Database Connection Failure

**Condition**:
```
/api/health returns 503 with database:false
for 3 consecutive checks
```

**Channels**: PagerDuty, Slack (#alerts-critical), Email (devops@)

**Runbook**: [Database Failure Response](#alert-response-database-failure)

---

### High Priority Alerts (P2)

#### ALERT-004: API Latency Spike

**Condition**:
```
API response time (p95) > 1000ms for 10 minutes
OR > 2000ms for 5 minutes
```

**Channels**: Slack (#alerts-critical), Email (team@)

**Runbook**: [Slow API Response](#alert-response-slow-api)

---

#### ALERT-005: High Error Rate

**Condition**:
```
5xx error rate > 1% for 10 minutes
OR > 5% for 5 minutes
```

**Channels**: Slack (#alerts-critical), Email (team@)

**Runbook**: [High Error Rate Response](#alert-response-high-errors)

---

#### ALERT-006: Booking Creation Failures

**Condition**:
```
Booking creation errors > 5 in 10 minutes
OR booking success rate < 95% for 15 minutes
```

**Channels**: Slack (#alerts-critical), Email (team@)

**Runbook**: [Booking Failure Response](#alert-response-booking-failure)

---

### Medium Priority Alerts (P3)

#### ALERT-007: Slow Page Load

**Condition**:
```
LCP > 3.5s for 30 minutes
```

**Channels**: Slack (#alerts-monitoring)

**Action**: Investigate performance, optimize if needed

---

#### ALERT-008: High Database CPU

**Condition**:
```
Database CPU > 80% for 20 minutes
```

**Channels**: Slack (#alerts-monitoring), Email (devops@)

**Action**: Review slow queries, consider scaling

---

#### ALERT-009: Cache Miss Rate High

**Condition**:
```
Redis cache miss rate > 50% for 30 minutes
```

**Channels**: Slack (#alerts-monitoring)

**Action**: Review cache invalidation logic

---

### Low Priority Alerts (P4)

#### ALERT-010: Scheduled Job Failure

**Condition**:
```
Cron job fails (e.g., payment-release, email-notifications)
```

**Channels**: Email (team@)

**Action**: Investigate and re-run job manually if needed

---

#### ALERT-011: Vendor Application Backlog

**Condition**:
```
Pending vendor applications > 20
```

**Channels**: Email (team@)

**Action**: Review and approve/reject vendors

---

## Alert Fatigue Prevention

### 1. Alert Grouping

Group similar alerts to avoid spam:

```
❌ Bad: 100 separate alerts for slow queries
✅ Good: 1 alert "High volume of slow queries (100 in 10 min)"
```

### 2. Alert Deduplication

Suppress duplicate alerts within time window:

```python
# Pseudo-code
if alert_fired_within_last_30_min(alert_id):
    suppress_alert()
else:
    send_alert()
```

### 3. Intelligent Routing

Route alerts based on context:

```
Deployment-related errors → #alerts-deployments (not critical)
Off-hours errors → PagerDuty (only critical)
Business hours errors → Slack (critical + high)
```

### 4. Auto-Resolve

Automatically resolve alerts when condition clears:

```
Alert fired: API latency > 1000ms
[10 minutes later]
Alert resolved: API latency back to normal (< 500ms)
```

### 5. Maintenance Mode

Disable alerts during maintenance windows:

```bash
# Before maintenance
curl -X POST /api/monitoring/maintenance/start

# After maintenance
curl -X POST /api/monitoring/maintenance/end
```

---

## Alert Response Playbooks

### Alert Response: Production Outage

**Severity**: CRITICAL (P1)

**Steps**:
1. **Acknowledge** (< 5 min): Confirm alert in PagerDuty
2. **Assess Impact** (< 2 min):
   - Check Vercel deployment status
   - Check UptimeRobot for affected regions
   - Estimate number of affected users
3. **Immediate Mitigation** (< 10 min):
   - Rollback to last known good deployment if recent deploy
   - Scale up Vercel functions if needed
   - Check database/Redis connectivity
4. **Communication** (< 15 min):
   - Post to status page
   - Notify team in Slack
5. **Resolution**:
   - Identify root cause
   - Deploy fix or permanent rollback
   - Monitor recovery
6. **Postmortem** (within 48 hours):
   - Write incident report
   - Identify prevention measures

---

### Alert Response: Payment Failure

**Severity**: CRITICAL (P1)

**Steps**:
1. **Acknowledge** (< 5 min)
2. **Check Stripe Status**: [status.stripe.com](https://status.stripe.com)
3. **Check Webhook Endpoint**:
   ```bash
   curl https://fleetfeast.com/api/webhooks/stripe
   ```
4. **Check Recent Payments**:
   - Query database for failed payments in last 10 min
   - Check Sentry for payment-related errors
5. **Mitigation**:
   - If Stripe is down: Wait for recovery, notify users
   - If webhook issue: Fix endpoint, manually process missed webhooks
6. **Communication**:
   - Notify affected customers
   - Post to status page if widespread

---

### Alert Response: Database Failure

**Severity**: CRITICAL (P1)

**Steps**:
1. **Acknowledge** (< 5 min)
2. **Check AWS RDS Status**:
   - CloudWatch metrics
   - RDS event log
3. **Immediate Actions**:
   - Restart database if needed
   - Failover to read replica (if configured)
   - Scale up instance if resource exhaustion
4. **Verify Recovery**:
   - Test health endpoint: `/api/health`
   - Run sample queries
5. **Root Cause**:
   - Check slow query log
   - Review recent schema changes
   - Check for lock contention

---

### Alert Response: Slow API

**Severity**: HIGH (P2)

**Steps**:
1. **Acknowledge** (< 30 min)
2. **Identify Slow Endpoints**:
   - Check Sentry Performance
   - Review Vercel function logs
3. **Profile Queries**:
   - Enable Prisma query logging
   - Check for N+1 queries
   - Review missing indexes
4. **Immediate Optimization**:
   - Add missing database indexes
   - Implement caching for hot paths
   - Optimize slow queries
5. **Monitor Recovery**:
   - Watch p95 latency trend

---

### Alert Response: High Errors

**Severity**: HIGH (P2)

**Steps**:
1. **Acknowledge** (< 30 min)
2. **Check Sentry Issues**:
   - Identify most frequent error
   - Check if new deployment introduced issue
3. **Assess Impact**:
   - How many users affected?
   - Is it isolated to specific feature/page?
4. **Mitigation**:
   - Rollback if deployment-related
   - Quick patch if simple fix
   - Feature flag disable if specific feature
5. **Communication**:
   - Post to Slack with details
   - Update status page if user-facing

---

## Alert Configuration

### Sentry Alerts

Configure in Sentry Dashboard → Alerts:

#### High Error Rate Alert

```yaml
name: "High Error Rate - Production"
conditions:
  - errors > 50 in 10 minutes
  - environment = production
filters:
  - level >= error
actions:
  - slack: #alerts-critical
  - email: team@fleetfeast.com
```

#### Slow Transaction Alert

```yaml
name: "Slow API Transactions"
conditions:
  - transaction.duration.p95 > 1000ms
  - transaction.op = http.server
filters:
  - transaction starts with /api/
actions:
  - slack: #alerts-critical
```

### UptimeRobot Alerts

Configure in UptimeRobot → Edit Monitor → Alerts:

#### Production Down Alert

```
Monitor: Production Homepage
Alert When: Down
Alert Contact:
  - Slack (#alerts-critical)
  - Email (team@fleetfeast.com)
  - PagerDuty (on-call)
```

### Vercel Alerts

Configure in Vercel Dashboard → Settings → Alerts:

#### Deployment Failure Alert

```
Event: Deployment Failed
Notification: Slack #alerts-deployments
```

#### High Function Duration Alert

```
Event: Function duration > 9s
Notification: Slack #alerts-monitoring
```

---

## Alert Testing

### Test Alert Flow

Periodically test alert delivery:

```bash
# Test Slack integration
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -d '{"text": "Test alert from Fleet Feast monitoring"}'

# Test PagerDuty integration
curl -X POST https://events.pagerduty.com/v2/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "routing_key": "YOUR_KEY",
    "event_action": "trigger",
    "payload": {
      "summary": "Test alert",
      "severity": "critical",
      "source": "monitoring-test"
    }
  }'
```

### Monthly Alert Drill

Schedule monthly drills:
1. Trigger test alert
2. Verify on-call receives notification
3. Practice runbook execution
4. Document response time

---

## Related Documentation

- [ON_CALL.md](./ON_CALL.md) - On-call rotation and escalation
- [UPTIME.md](./UPTIME.md) - Uptime monitoring setup
- [SENTRY.md](./SENTRY.md) - Error tracking configuration

---

**Document Status**: Complete
**Review Date**: 2025-12-04
**Next Review**: 2026-01-04
