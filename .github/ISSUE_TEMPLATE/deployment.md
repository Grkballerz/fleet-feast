---
name: Deployment Issue
about: Report a problem with CI/CD or deployment
title: '[DEPLOY] '
labels: deployment, infrastructure
assignees: ''
---

## Deployment Environment

- [ ] Preview (PR deployment)
- [ ] Production
- [ ] CI/CD Pipeline

## Description

Clear description of the deployment issue.

## Workflow/Job

Which GitHub Actions workflow is affected?

- [ ] CI (.github/workflows/ci.yml)
- [ ] Preview Deployment (.github/workflows/preview.yml)
- [ ] Production Deployment (.github/workflows/production.yml)
- [ ] Security Scan (.github/workflows/security.yml)

## Error Message

```
Paste error logs or failure message here
```

## Steps to Reproduce

1.
2.
3.

## Expected Behavior

What should have happened?

## Actual Behavior

What actually happened?

## GitHub Actions Run

Link to failed workflow run:

## Environment Variables

Have all required secrets/environment variables been configured?

- [ ] VERCEL_TOKEN
- [ ] VERCEL_ORG_ID
- [ ] VERCEL_PROJECT_ID
- [ ] DATABASE_URL
- [ ] All other required secrets

## Additional Context

Any other relevant information about the deployment issue.

## Possible Solution

If you have ideas on how to fix this, describe them here.
