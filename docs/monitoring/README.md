# Fleet Feast Monitoring & Alerting

**Version**: 1.0
**Last Updated**: 2025-12-04

---

## Overview

This directory contains comprehensive monitoring, alerting, and observability documentation for Fleet Feast. Our monitoring stack ensures high availability, rapid incident response, and continuous performance optimization.

---

## Quick Start

### For Developers

1. **Set up Sentry**: [SENTRY.md](./SENTRY.md)
   - Install `@sentry/nextjs`
   - Configure environment variables
   - Add error tracking to your code

2. **Enable Analytics**: [ANALYTICS.md](./ANALYTICS.md)
   - Add Vercel Analytics to layout
   - Track custom events
   - Monitor Web Vitals

3. **Review Alert Thresholds**: [ALERTING.md](./ALERTING.md)
   - Understand alert severity levels
   - Know which alerts you'll receive
   - Review response playbooks

### For On-Call Engineers

1. **Review On-Call Process**: [ON_CALL.md](./ON_CALL.md)
   - Understand rotation schedule
   - Know escalation procedures
   - Familiarize with runbooks

2. **Check Alert Rules**: [ALERTING.md](./ALERTING.md)
   - Know critical alert thresholds
   - Review response playbooks
   - Test alert flow

3. **Monitor Uptime**: [UPTIME.md](./UPTIME.md)
   - Access UptimeRobot dashboard
   - Check SLA targets
   - Review health check endpoints

---

## Documentation Index

| Document | Purpose | Audience |
|----------|---------|----------|
| [SENTRY.md](./SENTRY.md) | Error tracking setup and usage | All Engineers |
| [ANALYTICS.md](./ANALYTICS.md) | Vercel Analytics and Web Vitals | Frontend Engineers, PM |
| [UPTIME.md](./UPTIME.md) | Uptime monitoring and SLA targets | DevOps, On-Call |
| [ALERTING.md](./ALERTING.md) | Alert rules, thresholds, playbooks | All Engineers |
| [ON_CALL.md](./ON_CALL.md) | On-call rotation and incident response | On-Call Engineers |

---

## Monitoring Stack

### Error Tracking

**Tool**: Sentry
- **Purpose**: Real-time error tracking, performance monitoring
- **Cost**: Free tier (5k errors/month), $26/mo (50k errors)
- **Setup**: [SENTRY.md](./SENTRY.md)
- **Access**: [sentry.io](https://sentry.io)

### Analytics

**Tool**: Vercel Analytics
- **Purpose**: Page views, user behavior, Web Vitals
- **Cost**: Free tier (2.5k events), $10/mo (100k events)
- **Setup**: [ANALYTICS.md](./ANALYTICS.md)
- **Access**: Vercel Dashboard → Analytics

### Uptime Monitoring

**Tool**: UptimeRobot (recommended) or Better Uptime
- **Purpose**: Service availability, uptime tracking
- **Cost**: Free tier (50 monitors), $7/mo (unlimited)
- **Setup**: [UPTIME.md](./UPTIME.md)
- **Access**: [uptimerobot.com](https://uptimerobot.com)

### Performance Monitoring

**Tool**: Vercel Speed Insights
- **Purpose**: Core Web Vitals, real user monitoring
- **Cost**: $10/mo per project
- **Setup**: [ANALYTICS.md](./ANALYTICS.md)
- **Access**: Vercel Dashboard → Speed Insights

### Incident Management

**Tool**: PagerDuty (recommended) or OpsGenie
- **Purpose**: On-call rotation, alert escalation
- **Cost**: Free tier (10 users), $21/user/mo
- **Setup**: [ON_CALL.md](./ON_CALL.md)
- **Access**: [pagerduty.com](https://pagerduty.com)

---

## SLA Targets (from PRD)

### Availability

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Uptime** | 99.5% | UptimeRobot |
| **Max Downtime/Month** | 3.6 hours | UptimeRobot |

### Performance

| Metric | Target | Warning | Critical | Measurement |
|--------|--------|---------|----------|-------------|
| **Page Load (LCP)** | < 2.5s | > 2.5s | > 3.5s | Speed Insights |
| **API Response (p95)** | < 500ms | > 500ms | > 1000ms | Sentry |
| **TTFB** | < 800ms | > 1000ms | > 1500ms | Vercel Analytics |

### Error Rates

| Metric | Target | Warning | Critical | Measurement |
|--------|--------|---------|----------|-------------|
| **5xx Errors** | < 0.1% | > 0.5% | > 1.0% | Sentry |
| **4xx Errors** | < 1% | > 5% | > 10% | Sentry |
| **Failed Payments** | < 0.5% | > 1% | > 2% | Application Logs |

---

## Alert Channels

### Slack

- **#alerts-critical**: P1/P2 alerts only (production issues)
- **#alerts-monitoring**: All alerts (P1-P4)
- **#alerts-deployments**: Deployment notifications
- **#incident-YYYYMMDD-***: Incident-specific channels (created on-demand)

### Email

- **team@fleetfeast.com**: All alerts
- **devops@fleetfeast.com**: Infrastructure alerts
- **oncall@fleetfeast.com**: Critical alerts

### PagerDuty

- **Primary On-Call**: All critical (P1) alerts
- **Secondary On-Call**: Escalation after 15 minutes
- **Manager**: Escalation after 30 minutes

---

## Common Tasks

### Adding a New Alert

1. Determine severity (P1-P4) - see [ALERTING.md](./ALERTING.md#alert-severity-levels)
2. Define threshold and conditions
3. Configure in Sentry/UptimeRobot/Vercel
4. Test alert delivery
5. Document in [ALERTING.md](./ALERTING.md)
6. Add runbook if needed

### Responding to an Incident

1. **Acknowledge**: PagerDuty alert (< 5 min)
2. **Assess**: Severity and impact (< 2 min)
3. **Create**: Incident channel in Slack
4. **Investigate**: Gather data (< 10 min)
5. **Mitigate**: Immediate fix/rollback (< 30 min)
6. **Resolve**: Permanent fix (< 2 hours)
7. **Postmortem**: Document (within 48 hours)

See [ON_CALL.md](./ON_CALL.md#incident-response-process) for details.

### Writing a Postmortem

Template: [ON_CALL.md](./ON_CALL.md#postmortem-template)

Required for:
- All P1 incidents
- P2 incidents > 1 hour
- Payment failures
- Security incidents

---

## Health Check Endpoints

### Production

- **Homepage**: `https://fleetfeast.com`
- **API Health**: `https://fleetfeast.com/api/health`
- **Status Page**: `https://status.fleetfeast.com`

### Staging

- **Homepage**: `https://staging.fleetfeast.com`
- **API Health**: `https://staging.fleetfeast.com/api/health`

---

## Key Metrics Dashboard

Access real-time metrics:

### Sentry Dashboard
- Error rate
- Slow transactions
- User impact
- Release health

### Vercel Dashboard
- Function duration
- Deployment status
- Analytics
- Speed Insights

### UptimeRobot Dashboard
- Uptime percentage
- Response times
- Incident history

### Custom Metrics
- Booking creation rate
- Payment success rate
- Vendor approval queue
- Active users

---

## Implementation Checklist

### Initial Setup (MVP Launch)

- [x] Sentry error tracking configured
- [x] Vercel Analytics enabled
- [x] Vercel Speed Insights enabled
- [ ] UptimeRobot monitors created
- [ ] PagerDuty on-call rotation configured
- [ ] Slack alert channels created
- [ ] Status page published
- [ ] Alert rules documented
- [ ] Runbooks created
- [ ] Health check endpoint implemented

### Post-Launch Enhancements

- [ ] Custom analytics events tracked
- [ ] Synthetic transaction monitoring
- [ ] Database query monitoring
- [ ] Redis metrics tracking
- [ ] API rate limiting alerts
- [ ] User behavior funnels
- [ ] A/B testing infrastructure
- [ ] Chaos engineering tests

---

## Best Practices

### 1. Alert Hygiene

- Review alerts weekly
- Remove noisy alerts
- Tune thresholds based on historical data
- Every alert must be actionable

### 2. Documentation

- Keep runbooks updated
- Document all incidents
- Share learnings in postmortems
- Update thresholds as system evolves

### 3. On-Call Wellness

- Rotate on-call duties fairly
- Provide compensation (time off or pay)
- Don't page for non-critical issues after hours
- Empower on-call to make decisions

### 4. Continuous Improvement

- Review SLA compliance monthly
- Track mean time to recovery (MTTR)
- Identify recurring issues
- Invest in prevention, not just detection

---

## Resources

### External Documentation

- [Sentry Docs](https://docs.sentry.io)
- [Vercel Monitoring](https://vercel.com/docs/concepts/analytics)
- [UptimeRobot Docs](https://uptimerobot.com/api/)
- [PagerDuty Best Practices](https://www.pagerduty.com/resources/)

### Internal Resources

- Architecture: `docs/architecture/ARCHITECTURE.md`
- API Design: `docs/api/api-design.md`
- Database Schema: `docs/database/schema-design.md`

---

## Support

### Questions?

- **Technical Issues**: Ask in #engineering Slack channel
- **On-Call Questions**: Ask in #oncall-handoff
- **Monitoring Setup**: Ask DevOps team
- **Incident Response**: Follow [ON_CALL.md](./ON_CALL.md)

### Feedback

Have suggestions for improving our monitoring? Open an issue or PR!

---

**Document Status**: Complete
**Maintained By**: DevOps Team
**Review Cadence**: Quarterly
**Next Review**: 2026-03-04
