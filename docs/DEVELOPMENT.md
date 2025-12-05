# Fleet Feast - Development Guide

**Last Updated**: 2025-12-04
**Status**: Active
**Audience**: New developers joining the project

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Development Workflow](#development-workflow)
7. [Common Commands](#common-commands)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have the following installed on your development machine:

### Required

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Node.js** | 20.x or higher | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **npm** | 10.x or higher | Package manager | Included with Node.js |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com/) |
| **PostgreSQL** | 15+ | Database | [postgresql.org](https://www.postgresql.org/) or use [Neon](https://neon.tech) |

### Optional (but recommended)

| Tool | Purpose |
|------|---------|
| **VS Code** | Code editor with excellent TypeScript support |
| **Docker** | For running PostgreSQL and Redis locally |
| **Postman** or **Insomnia** | API testing |
| **pgAdmin** or **DBeaver** | Database GUI |

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be v20.x.x or higher

# Check npm version
npm --version   # Should be 10.x.x or higher

# Check Git
git --version

# Check PostgreSQL (if installed locally)
psql --version
```

---

## Getting Started

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/your-org/fleet-feast.git

# OR clone via SSH (if configured)
git clone git@github.com:your-org/fleet-feast.git

# Navigate to project directory
cd fleet-feast
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# This will also run `prisma generate` automatically (via postinstall script)
```

**What this does:**
- Installs all npm packages from `package.json`
- Generates Prisma Client from your database schema
- Downloads type definitions for TypeScript

**Expected output:**
```
added 542 packages in 45s
✔ Generated Prisma Client (5.20.0)
```

---

## Environment Setup

### 1. Copy Environment Template

```bash
# Copy the example file
cp .env.example .env

# On Windows
copy .env.example .env
```

### 2. Configure Environment Variables

Open `.env` in your editor and configure the following:

#### Database Configuration

**Option A: Local PostgreSQL**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/fleet_feast?schema=public"
```

**Option B: Neon (Free Cloud PostgreSQL)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
```bash
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb"
```

**Option C: Docker Compose**
```bash
# Use docker-compose.yml (if provided)
docker-compose up -d postgres
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fleet_feast"
```

#### NextAuth Configuration

```bash
# Generate a secure secret
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add to .env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"
```

#### Stripe Configuration (Development)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your **test mode** API keys from the Dashboard
```bash
STRIPE_SECRET_KEY="sk_test_51..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Leave empty for now, set up later
```

#### Email Configuration (Optional for local dev)

**Option A: Skip for now**
```bash
# Leave empty - emails will be logged to console
SENDGRID_API_KEY=""
```

**Option B: Use SendGrid**
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
```bash
SENDGRID_API_KEY="SG.xxx"
SENDGRID_FROM_EMAIL="dev@localhost"
SENDGRID_FROM_NAME="Fleet Feast Dev"
```

**Option C: Use Mailtrap (testing)**
```bash
# Mailtrap catches all emails for testing
# See mailtrap.io for SMTP settings
```

#### AWS S3 Configuration (Optional for local dev)

**For local development, you can skip S3 and use local file storage or mock uploads.**

```bash
# Leave empty for local dev
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""
AWS_S3_REGION=""
```

**If you need S3:**
1. Create an AWS account
2. Create an S3 bucket
3. Create an IAM user with S3 permissions
4. Add credentials to `.env`

#### Redis Configuration (Optional for local dev)

**Option A: Skip for now** (caching will fall back to in-memory)
```bash
REDIS_URL=""
```

**Option B: Local Redis**
```bash
# Install Redis locally or use Docker
docker run -d -p 6379:6379 redis:7-alpine
REDIS_URL="redis://localhost:6379"
```

**Option C: Upstash (Free Cloud Redis)**
```bash
# Sign up at upstash.com
REDIS_URL="rediss://default:xxx@xxx.upstash.io:6379"
REDIS_TOKEN="your-token"
```

#### Other Variables

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Platform settings
PLATFORM_FEE_PERCENTAGE=15
ESCROW_HOLD_DAYS=7
MAX_FILE_SIZE_MB=10

# Feature flags
ENABLE_REAL_TIME_MESSAGING=false
ENABLE_MOBILE_APP_API=false
```

---

## Database Setup

### 1. Create the Database

**If using local PostgreSQL:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fleet_feast;

# Quit
\q
```

**If using Neon or Docker, the database is already created.**

### 2. Run Migrations

```bash
# Generate Prisma Client (if not already done)
npx prisma generate

# Run all migrations to set up database schema
npx prisma migrate dev

# You'll be prompted to name the migration (e.g., "init")
```

**What this does:**
- Creates all tables, indexes, and constraints
- Applies any existing migration files
- Regenerates Prisma Client

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "fleet_feast"

Applying migration `20251204_init`

The following migration(s) have been applied:

migrations/
  └─ 20251204_init/
      └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client
```

### 3. Seed the Database (Optional)

```bash
# Populate database with sample data for development
npx prisma db seed
```

**What this creates:**
- Admin user account
- Sample vendor accounts
- Sample customer accounts
- Sample bookings
- Sample menu items

**Sample credentials** (after seeding):
```
Admin:
Email: admin@fleetfeast.com
Password: Admin123!

Vendor:
Email: vendor@example.com
Password: Vendor123!

Customer:
Email: customer@example.com
Password: Customer123!
```

### 4. Verify Database Setup

```bash
# Open Prisma Studio (database GUI)
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables
- Browse data
- Make manual edits (useful for development)

---

## Running the Application

### Development Mode

```bash
# Start the development server
npm run dev
```

**Expected output:**
```
> fleet-feast@0.1.0 dev
> next dev

  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.100:3000

 ✓ Ready in 3.2s
```

### Access the Application

Open your browser and navigate to:
- **Homepage**: [http://localhost:3000](http://localhost:3000)
- **Login**: [http://localhost:3000/login](http://localhost:3000/login)
- **Register**: [http://localhost:3000/register](http://localhost:3000/register)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

### Hot Reload

The development server supports **hot module replacement (HMR)**:
- Edit any file and save
- Browser automatically refreshes with changes
- State is preserved when possible

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Edit code in `app/`, `components/`, `lib/`, etc.
- Follow coding standards in `.claude/docs/standards/coding-standards.md`
- Use TypeScript strictly (avoid `any`)

### 3. Test Your Changes

```bash
# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Run tests (when available)
npm run test
```

### 4. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add booking cancellation flow"
```

**Commit message format:**
```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- refactor: Code refactoring
- test: Adding tests
- chore: Dependency updates, config changes
```

### 5. Push and Create PR

```bash
# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
# PR will auto-deploy to Vercel preview environment
```

---

## Common Commands

### Package Management

```bash
# Install a new package
npm install <package-name>

# Install as dev dependency
npm install -D <package-name>

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### Database Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npx prisma db seed

# Format schema file
npx prisma format
```

### Build and Production

```bash
# Build for production
npm run build

# Start production server locally
npm run start

# Check build size
npm run build -- --analyze
```

### Code Quality

```bash
# TypeScript type checking
npm run type-check

# ESLint
npm run lint

# Prettier formatting
npm run format

# Check formatting without changing files
npm run format -- --check
```

### Stripe Webhook Testing (Local)

```bash
# Install Stripe CLI
# See: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill the process using port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# OR use a different port
npm run dev -- -p 3001
```

### Database Connection Errors

**Error: "Can't reach database server"**

1. Check PostgreSQL is running:
```bash
# Mac/Linux
pg_isready

# Windows
pg_ctl status
```

2. Verify `DATABASE_URL` in `.env`
3. Check firewall/network settings
4. Try connecting with `psql`:
```bash
psql "postgresql://user:password@localhost:5432/fleet_feast"
```

**Error: "Authentication failed"**

- Check username and password in `DATABASE_URL`
- Verify PostgreSQL user exists and has permissions

**Error: "Database does not exist"**

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE fleet_feast;"
```

### Prisma Errors

**Error: "Prisma Client not generated"**

```bash
# Generate Prisma Client
npx prisma generate
```

**Error: "Migration failed"**

```bash
# Reset database and re-run migrations
npx prisma migrate reset
npx prisma migrate dev
```

### TypeScript Errors

**Error: "Cannot find module"**

1. Check import path uses `@/` alias for absolute imports
2. Restart TypeScript server in VS Code: `Cmd+Shift+P` → "Restart TS Server"
3. Delete `.next` folder and restart dev server

**Error: "Type errors after adding package"**

```bash
# Install type definitions
npm install -D @types/<package-name>
```

### Environment Variable Issues

**Error: "Environment variable is undefined"**

1. Check `.env` file exists in project root
2. Verify variable is defined in `.env`
3. Restart dev server (env vars are loaded at startup)
4. For client-side variables, use `NEXT_PUBLIC_` prefix

### Next.js Build Errors

**Error: "Module not found"**

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Error: "Out of memory"**

```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## Next Steps

### Learn the Codebase

1. **Read the architecture docs**:
   - [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md) - High-level system design
   - [architecture/ARCHITECTURE.md](./architecture/ARCHITECTURE.md) - Detailed architecture
   - [architecture/DATA_FLOW.md](./architecture/DATA_FLOW.md) - Key user flows

2. **Review coding standards**:
   - [.claude/docs/standards/coding-standards.md](../.claude/docs/standards/coding-standards.md)
   - [.claude/docs/standards/patterns.md](../.claude/docs/standards/patterns.md)

3. **Understand the tech stack**:
   - Next.js 14 App Router
   - TypeScript + Zod validation
   - Prisma ORM
   - NextAuth.js authentication
   - Stripe payments

### Start Contributing

1. **Pick a task**: Check the project board or talk to your team lead
2. **Set up your editor**: Install recommended VS Code extensions
3. **Run the app**: Follow steps above to get local environment running
4. **Make your first PR**: Start with a small bug fix or documentation improvement
5. **Ask questions**: Use Slack/Discord for help

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### Useful Resources

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://www.prisma.io/docs)
- **NextAuth.js**: [next-auth.js.org](https://next-auth.js.org)
- **Stripe API**: [stripe.com/docs/api](https://stripe.com/docs/api)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **TypeScript**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs)

---

## Getting Help

- **Documentation**: Check `/docs` folder first
- **Code comments**: Most complex logic has JSDoc comments
- **Team chat**: Ask in #dev-help channel
- **Office hours**: Tuesday/Thursday 2-3 PM EST
- **Pair programming**: Book time with senior devs

---

**Happy coding! Welcome to Fleet Feast!** 🚚🍔
