# CI/CD Quick Reference

## Workflows Overview

| Workflow | Trigger | Purpose | Duration |
|----------|---------|---------|----------|
| **CI** | Push to main/develop, PRs | Quality checks | ~5-7 min |
| **Preview** | PR opened/updated | Deploy preview | ~3-4 min |
| **Production** | Push to main | Deploy to prod | ~4-5 min |
| **Security** | Push, PR, Weekly | Security scan | ~8-10 min |
| **Dependencies** | Weekly (Mon 9am) | Auto-update deps | ~6-8 min |

## CI Workflow Jobs

```
lint (2 min)
  └─> ESLint checks

type-check (2 min)
  └─> TypeScript validation

test (3 min)
  ├─> PostgreSQL service
  ├─> Prisma generate
  └─> Jest tests (80% coverage)

build (2 min) - Requires: lint, type-check, test
  ├─> Prisma generate
  └─> Next.js build
```

## Common Scenarios

### New Pull Request

1. Developer creates PR
2. **CI workflow** runs automatically:
   - Lint → Type-check → Test → Build
3. **Preview workflow** deploys preview:
   - Comment added to PR with preview URL
4. **Security workflow** scans code:
   - CodeQL analysis
   - Dependency scan

**Expected time:** 8-12 minutes for all workflows

### Merge to Main

1. PR merged to main
2. **Production workflow** triggers:
   - Deploy to Vercel production
   - Run database migrations
   - Create deployment tag
   - Health check verification

**Expected time:** 4-5 minutes

### Weekly Maintenance

**Monday 9am UTC:**
- Dependency update check
- Auto-create PR if updates available

**Sunday 12am UTC:**
- Security scan
- Dependency vulnerability check

## Required Secrets

### Vercel Deployment

| Secret | Where to Get It |
|--------|----------------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel Dashboard → Settings → General |
| `VERCEL_PROJECT_ID` | Project Settings → General |

### Database

| Secret | Example |
|--------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` |

### Optional

| Secret | Purpose |
|--------|---------|
| `CODECOV_TOKEN` | Code coverage reporting |
| `SENTRY_DSN` | Error monitoring |

## Troubleshooting

### CI Failing

**Lint errors:**
```bash
npm run lint -- --fix
git add .
git commit -m "fix: lint errors"
```

**Type errors:**
```bash
npm run type-check
# Fix reported errors
```

**Test failures:**
```bash
npm test
# Fix failing tests
npm run test:coverage
```

**Build errors:**
```bash
npm run build
# Fix build issues
```

### Preview Deployment Failing

1. Check Vercel dashboard for deployment logs
2. Verify `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets
3. Check environment variables in Vercel project settings
4. Ensure branch name doesn't contain special characters

### Production Deployment Failing

1. Check workflow logs in GitHub Actions
2. Verify database is accessible
3. Check migration status: `npx prisma migrate status`
4. Verify health endpoint: `curl https://your-domain.com/api/health`

### Security Scan Issues

**High/Critical vulnerabilities:**
```bash
npm audit
npm audit fix
# Or update specific package:
npm update package-name
```

**False positives:**
Add to `.github/workflows/security.yml`:
```yaml
- run: npm audit --audit-level=critical
```

## Manual Operations

### Force Production Deployment

```bash
# Trigger production workflow manually
gh workflow run production.yml
```

### Trigger Security Scan

```bash
gh workflow run security.yml
```

### Manual Dependency Update

```bash
# Create branch
git checkout -b deps/manual-update

# Update dependencies
npm update

# Test
npm test

# Commit and push
git add package*.json
git commit -m "chore(deps): update dependencies"
git push origin deps/manual-update
```

### Rollback Production

**Option 1: Vercel Dashboard**
1. Go to Deployments
2. Find previous stable deployment
3. Click "Promote to Production"

**Option 2: Git Revert**
```bash
git revert HEAD
git push origin main
# Triggers automatic production deployment
```

## Performance Optimization

### Build Caching

- Node modules cached via `actions/setup-node@v4`
- Cache key: `package-lock.json` hash
- Cache hit rate: ~95%

### Test Optimization

- PostgreSQL service with health checks
- Parallel test execution
- Coverage uploaded asynchronously

### Deployment Speed

- npm ci (faster than npm install)
- Prisma client pre-generated
- Vercel edge network deployment

## Monitoring

### Workflow Status

Check workflow status:
```bash
gh run list --workflow=ci.yml
gh run list --workflow=production.yml
```

View specific run:
```bash
gh run view <run-id>
```

### Deployment History

```bash
# List production deployments
git tag -l "production-*"

# View deployment details
git show production-20251205-120000
```

### Health Checks

```bash
# Production health
curl https://fleetfeast.com/api/health

# Preview health
curl https://preview-xyz.vercel.app/api/health
```

## Best Practices

### Before Creating PR

```bash
npm run lint
npm run type-check
npm test
npm run build
```

All should pass locally before pushing.

### Commit Messages

Follow conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `chore:` maintenance
- `docs:` documentation
- `test:` tests
- `refactor:` code refactoring

### Branch Naming

- `feature/description` - new features
- `fix/description` - bug fixes
- `deps/description` - dependency updates
- `docs/description` - documentation

### Code Review

- Wait for all CI checks to pass
- Review preview deployment
- Check Lighthouse scores
- Verify test coverage maintained

## Coverage Requirements

| Metric | Threshold |
|--------|-----------|
| Lines | 80% |
| Statements | 80% |
| Functions | 70% |
| Branches | 70% |

Coverage must meet thresholds for CI to pass.

## Workflow Files

| File | Lines | Purpose |
|------|-------|---------|
| `.github/workflows/ci.yml` | ~90 | Quality checks |
| `.github/workflows/preview.yml` | ~55 | Preview deployments |
| `.github/workflows/production.yml` | ~60 | Production deployments |
| `.github/workflows/security.yml` | ~65 | Security scanning |
| `.github/workflows/dependencies.yml` | ~100 | Dependency updates |

Total: ~370 lines of workflow automation

## Support

**Documentation:**
- Full guide: `.github/DEPLOYMENT.md`
- Issue template: `.github/ISSUE_TEMPLATE/deployment.md`
- PR template: `.github/PULL_REQUEST_TEMPLATE.md`

**Commands:**
```bash
# View workflow help
gh workflow list

# View workflow runs
gh run list

# View specific workflow
gh workflow view ci.yml
```

---

**Last Updated:** 2025-12-05
**Version:** 1.0.0
