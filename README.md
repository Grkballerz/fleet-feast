# Fleet Feast - Food Truck Marketplace

A full-stack food truck marketplace platform connecting NYC food trucks with corporate events and private parties. Built with Next.js 14+, TypeScript, Prisma, and Stripe Connect.

## Features

- **For Customers**: Browse verified food trucks, book for events, secure escrow payments
- **For Vendors**: Manage bookings, receive payouts via Stripe Connect, grow your business
- **For Admins**: Vendor verification, dispute resolution, platform analytics

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: Headless UI + Radix UI
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 20.x LTS
- **API**: Next.js API Routes
- **Authentication**: NextAuth.js v5
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 15+
- **Payments**: Stripe Connect
- **Email**: SendGrid / AWS SES
- **File Storage**: AWS S3

### Infrastructure
- **Hosting**: Vercel (serverless)
- **Database Hosting**: Neon / Railway
- **Cache**: Redis (Upstash)
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL database (or Neon account)
- Stripe account
- AWS account (for S3)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/fleet-feast.git
cd fleet-feast
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `SENDGRID_API_KEY` - From SendGrid
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` - From AWS IAM
- Other variables as needed

4. Set up the database:
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (if schema exists)
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
fleet-feast/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public pages (no auth)
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (customer)/        # Customer dashboard
│   ├── (vendor)/          # Vendor dashboard
│   ├── (admin)/           # Admin dashboard
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   ├── prisma.ts          # Prisma client singleton
│   ├── auth.ts            # NextAuth configuration
│   └── utils.ts           # Helper functions
├── modules/               # Domain modules
│   ├── auth/              # Authentication logic
│   ├── booking/           # Booking management
│   ├── payment/           # Payment processing
│   └── ...                # Other modules
├── prisma/                # Database schema & migrations
│   └── schema.prisma      # Prisma schema
├── types/                 # TypeScript type definitions
├── public/                # Static assets
├── .env.example           # Environment variables template
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript compiler check

## Database Management

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Documentation

### For Developers

| Document | Description |
|----------|-------------|
| **[Development Guide](docs/DEVELOPMENT.md)** | Local setup, installation, and getting started |
| **[Architecture Overview](docs/ARCHITECTURE_OVERVIEW.md)** | High-level system architecture and tech stack |
| **[Contributing Guidelines](docs/CONTRIBUTING.md)** | How to contribute, coding standards, PR process |
| **[Deployment Guide](docs/DEPLOYMENT.md)** | Production deployment and infrastructure setup |

### Architecture Documentation

| Document | Description |
|----------|-------------|
| **[Complete Architecture](docs/architecture/ARCHITECTURE.md)** | Detailed system architecture (18 sections) |
| **[Data Flow Diagrams](docs/architecture/DATA_FLOW.md)** | User flows and state transitions |
| **[Architecture Decisions](docs/architecture/DECISIONS.md)** | ADRs for major technology choices |
| **[Architecture Summary](docs/architecture/SUMMARY.md)** | Quick reference and highlights |

### Database & API

| Document | Description |
|----------|-------------|
| **[Database Schema](docs/database/schema-design.md)** | Complete database schema design |
| **[ERD Diagram](docs/database/erd-diagram.md)** | Entity relationship diagram |
| **[API Design](docs/api/api-design.md)** | API conventions and patterns |
| **[API Registry](docs/API_Registry.md)** | Complete API endpoint reference |

### Standards & Patterns

| Document | Description |
|----------|-------------|
| **[Coding Standards](.claude/docs/standards/coding-standards.md)** | TypeScript, React, and API standards |
| **[Design Patterns](.claude/docs/standards/patterns.md)** | Common patterns and best practices |

---

## Quick Start for Developers

### 1. Set Up Your Environment

```bash
# Clone the repository
git clone https://github.com/your-org/fleet-feast.git
cd fleet-feast

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Set up database
npx prisma migrate dev
npx prisma db seed
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Explore the Codebase

- **Frontend**: `app/`, `components/`
- **Backend**: `app/api/`, `lib/services/`
- **Database**: `prisma/schema.prisma`
- **Documentation**: `docs/`

For detailed setup instructions, see **[DEVELOPMENT.md](docs/DEVELOPMENT.md)**.

---

## Architecture

See [docs/ARCHITECTURE_OVERVIEW.md](docs/ARCHITECTURE_OVERVIEW.md) for a high-level overview or [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) for complete details.

### Key Design Decisions

- **Monolithic Architecture**: Start simple, scale later with clear module boundaries
- **App Router**: Modern Next.js pattern with React Server Components
- **Escrow Payments**: 7-day hold period for dispute resolution
- **Anti-Circumvention**: Multi-layer detection (content filtering + behavioral patterns)
- **Role-Based Access Control**: Customer, Vendor, and Admin roles

For detailed rationale, see [Architecture Decision Records](docs/architecture/DECISIONS.md).

## Security

- Password hashing with bcrypt (cost factor 12)
- JWT tokens with HTTP-only secure cookies
- Rate limiting on all API endpoints
- Content Security Policy headers
- SQL injection prevention via Prisma ORM
- XSS protection with React auto-escaping
- HTTPS-only in production (HSTS)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, email support@fleetfeast.com or open an issue in the repository.

---

Built with ❤️ by the Fleet Feast team
