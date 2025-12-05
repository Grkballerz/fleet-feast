# Deployment Guide - Fleet Feast

## Overview

Fleet Feast uses GitHub Actions for automated CI/CD with Vercel for hosting.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`

**Jobs:**
- **Lint**: Runs ESLint to check code quality
- **Type Check**: Validates TypeScript types
- **Test**: Runs unit and integration tests with PostgreSQL service
  - Enforces 80% coverage threshold
  - Generates coverage reports
- **Build**: Creates production build (only runs if all checks pass)

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: NextAuth.js secret
- `STRIPE_SECRET_KEY`: Stripe API key
- `AWS_ACCESS_KEY_ID`: AWS credentials
- `S3_BUCKET_NAME`: S3 bucket for file uploads

### 2. Preview Deployment (`.github/workflows/preview.yml`)

**Triggers:**
- Pull request opened, synchronized, or reopened to `main`

**What it does:**
- Deploys preview version to Vercel
- Comments on PR with preview URL
- Runs Lighthouse CI for performance metrics

**Required Secrets:**
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

### 3. Production Deployment (`.github/workflows/production.yml`)

**Triggers:**
- Push to `main` branch

**What it does:**
- Deploys to Vercel production
- Creates deployment tag with timestamp
- Runs database migrations
- Verifies deployment health via `/api/health` endpoint

**Required Secrets:**
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `DATABASE_URL`: Production database connection

## Setup Instructions

### 1. GitHub Secrets

Add the following secrets to your GitHub repository:

**Vercel Secrets:**
```bash
# Get these from Vercel dashboard
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

**Database:**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

**Authentication:**
```bash
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```

**Payment (Stripe):**
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Storage (AWS):**
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

**Email (SendGrid):**
```bash
SENDGRID_API_KEY=SG.your-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

**Code Coverage (Optional):**
```bash
CODECOV_TOKEN=your-codecov-token
```

### 2. Vercel Project Setup

1. Import project to Vercel
2. Connect GitHub repository
3. Add environment variables in Vercel dashboard
4. Copy organization ID and project ID for GitHub secrets

### 3. Database Migrations

Migrations run automatically on production deployment via:
```bash
npx prisma migrate deploy
```

For manual deployment:
```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Deploy to production
npx prisma migrate deploy
```

### 4. Branch Protection

Recommended branch protection rules for `main`:

- ✅ Require pull request before merging
- ✅ Require status checks to pass:
  - `lint`
  - `type-check`
  - `test`
  - `build`
- ✅ Require branches to be up to date
- ✅ Require linear history
- ✅ Do not allow force pushes

## Deployment Process

### Development → Production

1. **Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

2. **Create Pull Request**
   - CI workflow runs automatically
   - Preview deployment created
   - Review preview URL in PR comment

3. **Code Review**
   - Reviewer checks code changes
   - Reviewer tests preview deployment
   - All CI checks must pass

4. **Merge to Main**
   - Squash and merge PR
   - Production workflow triggers automatically
   - Database migrations run
   - Health check verifies deployment

### Rollback Procedure

If production deployment fails or has issues:

1. **Quick Rollback (Vercel Dashboard)**
   - Go to Vercel dashboard
   - Navigate to Deployments
   - Click previous successful deployment
   - Click "Promote to Production"

2. **Git Revert**
   ```bash
   git revert HEAD
   git push origin main
   ```
   This triggers new production deployment with reverted changes.

3. **Database Rollback**
   ```bash
   # Review migration history
   npx prisma migrate status

   # Rollback is manual - restore from backup if needed
   ```

## Monitoring

### Health Check

Endpoint: `GET /api/health`

**Healthy Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-05T05:00:00.000Z",
  "services": {
    "database": "connected",
    "api": "operational"
  }
}
```

**Unhealthy Response:**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-12-05T05:00:00.000Z",
  "services": {
    "database": "disconnected",
    "api": "operational"
  },
  "error": "Connection timeout"
}
```

### Deployment Tags

Production deployments are tagged automatically:
```
production-20251205-120000
```

View all production deployments:
```bash
git tag -l "production-*"
```

## Troubleshooting

### Build Fails

1. Check Node.js version (requires 20+)
2. Verify all environment variables are set
3. Run build locally: `npm run build`
4. Check build logs in GitHub Actions

### Test Failures

1. Ensure PostgreSQL service is running
2. Check test environment variables
3. Run tests locally: `npm test`
4. Review coverage threshold (80% required)

### Deployment Fails

1. Verify Vercel secrets are correct
2. Check Vercel dashboard for deployment logs
3. Ensure database is accessible from Vercel
4. Verify health endpoint responds

### Migration Issues

1. Check migration history: `npx prisma migrate status`
2. Verify DATABASE_URL is correct
3. Manually run migrations if needed
4. Restore from database backup if corrupted

## Performance Optimization

### Build Caching

- Node modules cached via `actions/setup-node@v4`
- Build artifacts cached for 7 days
- Prisma client generated before each build

### Test Optimization

- PostgreSQL service uses health checks
- Coverage reports uploaded asynchronously
- Tests run in parallel where possible

## Security

### Secrets Management

- Never commit secrets to repository
- Use GitHub encrypted secrets
- Rotate secrets regularly (90 days)
- Use different secrets for staging/production

### Deployment Security

- Production environment requires manual approval (optional)
- Vercel deployment tokens scoped to project
- Database credentials restricted by IP
- HTTPS enforced on all deployments

## Support

For issues with:
- **CI/CD Pipeline**: Check workflow logs in GitHub Actions
- **Vercel Deployment**: Check Vercel dashboard
- **Database Issues**: Review Prisma logs and database status
- **Secrets/Config**: Verify all required secrets are set

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
