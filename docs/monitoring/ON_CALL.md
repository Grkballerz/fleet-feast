# On-Call & Incident Response Process

**Fleet Feast - Monitoring & Alerting**
**Version**: 1.0
**Last Updated**: 2025-12-04

---

## Table of Contents

1. [Overview](#overview)
2. [On-Call Rotation](#on-call-rotation)
3. [Incident Response Process](#incident-response-process)
4. [Incident Severity Classification](#incident-severity-classification)
5. [Escalation Procedures](#escalation-procedures)
6. [Communication Protocols](#communication-protocols)
7. [Postmortem Process](#postmortem-process)
8. [Runbooks](#runbooks)
9. [On-Call Handoff](#on-call-handoff)

---

## Overview

This document defines the on-call rotation, incident response procedures, and escalation paths for Fleet Feast. The goal is to ensure rapid response to production incidents while maintaining engineer well-being.

### On-Call Philosophy

1. **Shared Responsibility**: On-call duties rotate among the engineering team
2. **Work-Life Balance**: No on-call shifts longer than 1 week
3. **Empowerment**: On-call engineer has authority to make necessary decisions
4. **Blameless Culture**: Focus on systems improvement, not individual blame
5. **Documentation**: All incidents result in improved runbooks or monitoring

---

## On-Call Rotation

### Rotation Schedule

**Primary On-Call**:
- **Duration**: 1 week (Monday 9 AM to Monday 9 AM)
- **Responsibility**: First responder to all alerts
- **Compensation**: Time off in lieu or overtime pay

**Secondary On-Call**:
- **Duration**: 1 week (same as primary)
- **Responsibility**: Backup if primary doesn't respond within 15 minutes
- **Compensation**: Time off in lieu or overtime pay

**Schedule Example**:

| Week | Primary | Secondary | Manager Backup |
|------|---------|-----------|----------------|
| Week 1 (Dec 2-9) | Alice | Bob | Charlie (CTO) |
| Week 2 (Dec 9-16) | Bob | Charlie | Alice |
| Week 3 (Dec 16-23) | Charlie | Alice | Bob |

### Rotation Management

**Tool**: PagerDuty (recommended) or OpsGenie

**Configuration**:
```yaml
rotation:
  name: "Fleet Feast Engineering On-Call"
  type: weekly
  start_time: "Monday 09:00"
  timezone: "America/New_York"
  participants:
    - alice@fleetfeast.com
    - bob@fleetfeast.com
    - charlie@fleetfeast.com
  escalation:
    - level: 1
      delay: 0 minutes
      notify: [primary]
    - level: 2
      delay: 15 minutes
      notify: [secondary]
    - level: 3
      delay: 30 minutes
      notify: [manager]
```

### On-Call Responsibilities

**During Business Hours (9 AM - 5 PM)**:
- Monitor Slack #alerts-critical channel
- Respond to PagerDuty alerts within 15 minutes
- Coordinate with team for complex issues

**After Hours & Weekends**:
- Respond to PagerDuty alerts within 15 minutes
- Escalate to secondary if unable to respond
- Focus on mitigation first, root cause later

**Not On-Call Responsibilities**:
- Feature development
- Code reviews
- Meetings (unless incident-related)

---

## Incident Response Process

### Incident Lifecycle

```
Detection → Triage → Investigation → Mitigation → Resolution → Postmortem
```

### 1. Detection (0-1 min)

**Alert Sources**:
- PagerDuty (critical alerts)
- Slack #alerts-critical
- User reports
- Internal monitoring

**Actions**:
- Acknowledge alert in PagerDuty (stops escalation)
- Assess severity (see [Incident Severity Classification](#incident-severity-classification))

---

### 2. Triage (1-5 min)

**Questions to Answer**:
- What is broken?
- How many users are affected?
- Is this a new issue or recurrence?
- What changed recently (deployment, config, etc.)?

**Actions**:
- Open incident channel in Slack: `#incident-YYYYMMDD-description`
- Post initial assessment to incident channel
- Tag relevant team members if needed

**Example Triage Message**:
```
INCIDENT DETECTED
Time: 2025-12-04 10:30 UTC
Severity: P1 (Critical)
Impact: Production API /api/bookings returning 500 errors
Affected Users: All users attempting to create bookings
Last Deployment: 30 minutes ago (commit abc123)
Next Steps: Rolling back deployment
```

---

### 3. Investigation (5-15 min)

**Gather Data**:
- Check Sentry for error details
- Review Vercel deployment logs
- Check database metrics (AWS RDS)
- Review recent code changes

**Tools**:
```bash
# Check Vercel logs
vercel logs fleet-feast --follow

# Check Sentry issues
open https://sentry.io/organizations/fleet-feast/issues/

# Check database connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check Redis
redis-cli -u $REDIS_URL PING
```

**Document Findings**:
Post findings to incident channel in real-time.

---

### 4. Mitigation (15-30 min)

**Immediate Actions** (choose based on issue):

#### Option A: Rollback Deployment
```bash
# Rollback to previous deployment
vercel rollback fleet-feast --yes

# Verify rollback
curl https://fleetfeast.com/api/health
```

#### Option B: Scale Up Resources
```bash
# Scale up Vercel functions
vercel env add VERCEL_FUNCTION_MEMORY 512

# Redeploy
vercel --prod
```

#### Option C: Feature Flag Disable
```typescript
// Disable problematic feature
await prisma.featureFlag.update({
  where: { name: 'NEW_BOOKING_FLOW' },
  data: { enabled: false },
});
```

#### Option D: Database Fix
```sql
-- Add missing index
CREATE INDEX idx_bookings_vendor_date ON bookings(vendor_id, event_date);

-- Kill long-running queries
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';
```

**Verify Mitigation**:
- Check error rate in Sentry
- Test affected functionality
- Monitor metrics for 5-10 minutes

---

### 5. Resolution (30 min - 2 hours)

**Root Cause Analysis**:
- Identify why the issue occurred
- Determine what prevented early detection
- Plan permanent fix

**Permanent Fix**:
- Deploy proper fix (not just rollback)
- Add tests to prevent regression
- Update monitoring to catch similar issues

**Verify Resolution**:
- Confirm issue is fully resolved
- No lingering errors in Sentry
- All metrics back to normal

---

### 6. Postmortem (within 48 hours)

See [Postmortem Process](#postmortem-process) below.

---

## Incident Severity Classification

### P1 - Critical

**Definition**: Production is down or severely degraded, affecting all users.

**Examples**:
- API returning 500 errors for > 50% of requests
- Database is unreachable
- Payment processing completely broken
- Site is completely down

**Response Time**: < 15 minutes
**Notification**: PagerDuty + Phone + Slack + Email + SMS (management)
**Escalation**: Immediate (after 15 min if not acknowledged)

**SLA**: Restore service within 1 hour

---

### P2 - High

**Definition**: Significant degradation affecting many users or critical features.

**Examples**:
- API latency > 2 seconds
- 5xx error rate > 5%
- Booking creation failing for some users
- Payment success rate < 90%

**Response Time**: < 30 minutes
**Notification**: Slack + Email
**Escalation**: After 30 minutes

**SLA**: Restore service within 4 hours

---

### P3 - Medium

**Definition**: Minor degradation, affecting few users or non-critical features.

**Examples**:
- API latency > 1 second (but < 2s)
- Non-critical page load issues
- Background job failures
- Cache miss rate high

**Response Time**: < 2 hours
**Notification**: Slack
**Escalation**: None (unless escalated by on-call)

**SLA**: Fix within 24 hours

---

### P4 - Low

**Definition**: Minor issue with no user impact.

**Examples**:
- Scheduled job failed (non-critical)
- High memory usage (no errors)
- Analytics data gap
- Documentation errors

**Response Time**: < 24 hours
**Notification**: Email
**Escalation**: None

**SLA**: Fix within 1 week

---

## Escalation Procedures

### Escalation Matrix

| Time Since Alert | Severity P1 | Severity P2 | Severity P3 |
|------------------|-------------|-------------|-------------|
| **0 minutes** | Primary On-Call | Primary On-Call | Primary On-Call |
| **15 minutes** | Secondary On-Call | - | - |
| **30 minutes** | Engineering Manager | Secondary On-Call | - |
| **45 minutes** | CTO | - | - |
| **60 minutes** | All Hands (CEO, CTO, PM) | Engineering Manager | - |

### When to Escalate

**Escalate Immediately If**:
- You don't know how to fix the issue
- You need access you don't have
- Multiple systems are affected
- Issue is getting worse despite mitigation
- User data may be compromised

**How to Escalate**:
1. Post in incident channel: `@secondary-oncall Need help with...`
2. Call secondary on-call via PagerDuty
3. If no response, call engineering manager

---

## Communication Protocols

### Internal Communication

**Incident Channel** (`#incident-YYYYMMDD-description`):
- Create immediately upon detection
- Post all updates here
- Archive after resolution

**Update Cadence**:
- **P1**: Every 15 minutes
- **P2**: Every 30 minutes
- **P3**: Every 2 hours

**Update Template**:
```
UPDATE [HH:MM UTC]
Status: [Investigating / Mitigating / Resolved]
Actions Taken: [What we did]
Next Steps: [What we're doing next]
ETA: [Expected resolution time]
```

---

### External Communication

**Status Page** (status.fleetfeast.com):
- Update within 15 minutes of P1 incident
- Post initial message, updates every 30 min, resolution notice

**Example Status Page Messages**:

**Investigating**:
```
We are currently investigating an issue affecting booking creation.
Users may experience errors when attempting to create new bookings.
Our team is actively working on a resolution.

Posted: 2025-12-04 10:30 UTC
```

**Update**:
```
We have identified the issue and are deploying a fix.
Booking creation should be restored within 15 minutes.

Posted: 2025-12-04 10:45 UTC
```

**Resolved**:
```
The issue has been resolved. Booking creation is now functioning normally.
We apologize for any inconvenience.

Posted: 2025-12-04 11:00 UTC
```

---

### Customer Support Communication

Notify support team immediately for P1/P2 incidents:

**Slack Message to #support**:
```
INCIDENT ALERT - Inform Customers
Severity: P1
Issue: Booking creation failing
Impact: Users cannot create new bookings
Workaround: None
ETA for Fix: 30 minutes
Support Response: Apologize, provide ETA, offer to notify when resolved
```

---

## Postmortem Process

### When to Write Postmortem

**Required**:
- All P1 incidents
- All P2 incidents with > 1 hour downtime
- Any incident affecting payments
- Any security incident

**Optional**:
- P3 incidents with interesting learnings
- Near-misses (caught before user impact)

---

### Postmortem Template

Create in `docs/postmortems/YYYY-MM-DD-incident-name.md`:

```markdown
# Postmortem: [Incident Name]

**Date**: 2025-12-04
**Severity**: P1 (Critical)
**Duration**: 30 minutes (10:30 - 11:00 UTC)
**Impacted Users**: ~500 users (100% of active users)
**Author**: [On-call engineer]

## Summary

Brief description of what happened and impact.

## Timeline

- **10:30 UTC**: Alert triggered - API 5xx error rate 100%
- **10:32 UTC**: On-call acknowledged, started investigation
- **10:35 UTC**: Identified issue - recent deployment introduced bug
- **10:40 UTC**: Initiated rollback
- **10:45 UTC**: Rollback complete, errors dropped to 0%
- **11:00 UTC**: Confirmed full resolution

## Root Cause

[Detailed technical explanation]

## Impact

- **Users Affected**: ~500 users
- **Duration**: 30 minutes
- **Failed Requests**: ~1,200 booking creation attempts
- **Revenue Impact**: Estimated $5,000 in lost bookings

## What Went Well

- Alert triggered immediately
- Rollback executed quickly
- Communication to team was clear

## What Went Wrong

- Deployment process didn't catch the bug
- No rollback plan was pre-defined
- Tests didn't cover this scenario

## Action Items

1. [ ] Add integration test for booking creation flow (@alice, by 2025-12-06)
2. [ ] Document rollback procedure (@bob, by 2025-12-05)
3. [ ] Add canary deployment to catch issues early (@charlie, by 2025-12-10)
4. [ ] Improve alert specificity to identify root cause faster (@alice, by 2025-12-08)

## Lessons Learned

- Always test booking flow before deploying
- Rollback should be one-command operation
- Need better staging environment to catch issues
```

---

### Postmortem Meeting

**Schedule**: Within 48 hours of incident

**Attendees**:
- On-call engineer (presents)
- Engineering team
- Product manager
- Any stakeholders

**Agenda**:
1. Present timeline (10 min)
2. Discuss root cause (10 min)
3. Review action items (15 min)
4. Assign owners and deadlines (5 min)

**No Blame Rule**: Focus on systems, not people.

---

## Runbooks

### Common Runbooks

#### Runbook: API Down

**Symptoms**: 5xx errors, health check failing

**Checklist**:
1. Check Vercel deployment status
2. Check database connectivity: `psql $DATABASE_URL -c "SELECT 1;"`
3. Check Redis: `redis-cli -u $REDIS_URL PING`
4. Check recent deployments: `vercel ls fleet-feast`
5. Rollback if recent deploy: `vercel rollback`
6. Verify recovery: `curl https://fleetfeast.com/api/health`

---

#### Runbook: Database Slow

**Symptoms**: API timeouts, high database CPU

**Checklist**:
1. Check RDS metrics in AWS CloudWatch
2. Identify slow queries:
   ```sql
   SELECT query, calls, mean_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```
3. Add missing indexes if identified
4. Kill long-running queries if blocking:
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';
   ```
5. Consider scaling up RDS instance

---

#### Runbook: Payment Failures

**Symptoms**: Stripe webhook failures, payment errors

**Checklist**:
1. Check Stripe status: [status.stripe.com](https://status.stripe.com)
2. Check webhook endpoint: `curl https://fleetfeast.com/api/webhooks/stripe`
3. Review recent payments in database
4. Check Stripe dashboard for failed payments
5. Manually process missed webhooks if needed
6. Notify affected customers

---

#### Runbook: High Memory Usage

**Symptoms**: Out of memory errors, function timeouts

**Checklist**:
1. Check Vercel function logs for OOM errors
2. Identify memory-intensive functions
3. Optimize queries to reduce data loading
4. Increase function memory: `VERCEL_FUNCTION_MEMORY=512`
5. Add pagination to large dataset queries
6. Clear Redis cache if needed: `redis-cli -u $REDIS_URL FLUSHDB`

---

## On-Call Handoff

### Handoff Checklist

At the end of on-call shift, document:

- [ ] **Active Incidents**: Any ongoing issues
- [ ] **Recurring Alerts**: Alerts that fired multiple times
- [ ] **Changes Made**: Any configuration changes
- [ ] **Action Items**: Follow-ups needed
- [ ] **Lessons Learned**: Improvements to make

### Handoff Template

Post in Slack #oncall-handoff:

```
ON-CALL HANDOFF: Week of Dec 2-9
From: Alice → To: Bob

Active Incidents: None

Recurring Alerts:
- Database CPU spiked 3 times during peak hours (non-critical)
- Action: Monitor, consider scaling up if continues

Changes Made:
- Added index on bookings table for performance
- Increased Vercel function memory to 512MB

Action Items:
- [ ] Follow up on postmortem action items from Dec 4 incident
- [ ] Review slow query log for optimization opportunities

Notes:
- Deployment freeze this Friday (holiday weekend)
- New monitoring alert rules deployed Tuesday
```

---

## Related Documentation

- [ALERTING.md](./ALERTING.md) - Alert rules and thresholds
- [UPTIME.md](./UPTIME.md) - Uptime monitoring setup
- [SENTRY.md](./SENTRY.md) - Error tracking configuration

---

**Document Status**: Complete
**Review Date**: 2025-12-04
**Next Review**: 2026-01-04
