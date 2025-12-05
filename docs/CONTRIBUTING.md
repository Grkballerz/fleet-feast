# Contributing to Fleet Feast

**Last Updated**: 2025-12-04
**Status**: Active
**Audience**: All contributors

---

Welcome to Fleet Feast! We're excited to have you contribute to our food truck marketplace platform. This guide will help you understand our development workflow, coding standards, and best practices.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Conventions](#commit-conventions)
6. [Pull Request Process](#pull-request-process)
7. [Testing Requirements](#testing-requirements)
8. [Code Review](#code-review)
9. [Issue Tracking](#issue-tracking)
10. [Getting Help](#getting-help)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and professional
- Accept constructive feedback gracefully
- Focus on what's best for the community
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Any conduct that could be considered inappropriate

---

## Getting Started

### Prerequisites

Before you start contributing, ensure you have:

1. **Completed the setup**: Follow [DEVELOPMENT.md](./DEVELOPMENT.md) to set up your local environment
2. **Read the architecture**: Review [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md) to understand the system
3. **Reviewed coding standards**: Familiarize yourself with [.claude/docs/standards/coding-standards.md](../.claude/docs/standards/coding-standards.md)

### Your First Contribution

**Good first issues**:
- Documentation improvements
- Bug fixes with clear reproduction steps
- Adding tests for existing features
- UI/UX improvements

**Look for labels**:
- `good-first-issue`: Great for newcomers
- `help-wanted`: We need community help
- `bug`: Something isn't working
- `enhancement`: New feature or improvement

---

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/fleet-feast.git
cd fleet-feast

# Add upstream remote
git remote add upstream https://github.com/fleet-feast/fleet-feast.git
```

### 2. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Branch naming conventions:
# - feature/add-booking-filters
# - fix/payment-duplicate-charge
# - refactor/vendor-service
# - docs/update-readme
# - test/booking-integration
```

### 3. Make Changes

- Write clean, readable code
- Follow TypeScript strict mode
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### 4. Run Quality Checks

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format

# Run tests (when available)
npm run test

# All checks must pass before submitting PR
```

### 5. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add booking filter by cuisine type"
```

See [Commit Conventions](#commit-conventions) below.

### 6. Push to Your Fork

```bash
# Push to your fork
git push origin feature/your-feature-name
```

### 7. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill out PR template (auto-generated)
5. Link related issues
6. Request review from maintainers

---

## Coding Standards

We maintain strict coding standards to ensure consistency and quality. **All contributions must follow these standards.**

### TypeScript Standards

**DO**: Use explicit types for function parameters and return values
```typescript
// Good
function createBooking(data: BookingRequest): Promise<Booking> {
  // implementation
}

// Bad
function createBooking(data: any) {
  // implementation
}
```

**DO**: Use type inference for simple variables
```typescript
// Good
const vendorName = "Joe's Tacos";
const ratings = [4, 5, 3];

// Bad (over-specified)
const vendorName: string = "Joe's Tacos";
```

**DON'T**: Use `any` type
```typescript
// Bad
const data: any = await fetch('/api/vendors');

// Good
const data: VendorList = await fetch('/api/vendors').then(r => r.json());
```

### React Standards

**DO**: Use Server Components by default
```typescript
// Good - Server Component
export default async function VendorsPage() {
  const vendors = await getVendors();
  return <VendorList vendors={vendors} />;
}
```

**DO**: Use Client Components only when needed
```typescript
// Good - Client Component (uses state)
'use client'

import { useState } from 'react';

export function BookingForm() {
  const [date, setDate] = useState<Date>();
  // ...
}
```

**DO**: Destructure props in function signature
```typescript
// Good
function VendorCard({ vendor, onBook }: VendorCardProps) {
  return <div>{vendor.name}</div>;
}

// Bad
function VendorCard(props: VendorCardProps) {
  return <div>{props.vendor.name}</div>;
}
```

### API Standards

**DO**: Follow RESTful conventions
```
GET    /api/bookings       # List all bookings
POST   /api/bookings       # Create booking
GET    /api/bookings/:id   # Get single booking
PATCH  /api/bookings/:id   # Update booking
DELETE /api/bookings/:id   # Delete booking
```

**DO**: Use standard error handling pattern
```typescript
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session) return unauthorized();

    // 2. Validate
    const data = schema.parse(await req.json());

    // 3. Authorize
    if (!canPerformAction(session, data)) return forbidden();

    // 4. Business logic
    const result = await service.execute(data);

    // 5. Return response
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
```

### Database Standards

**DO**: Use Prisma transactions for multi-step operations
```typescript
// Good
await prisma.$transaction(async (tx) => {
  const booking = await tx.booking.create({ data });
  await tx.availability.update({ /* update */ });
  return booking;
});
```

**DO**: Select only needed fields
```typescript
// Good
const vendor = await prisma.vendor.findUnique({
  where: { id },
  select: {
    id: true,
    businessName: true,
    cuisineType: true,
  },
});

// Bad (retrieves all fields)
const vendor = await prisma.vendor.findUnique({ where: { id } });
```

### File Organization

```
components/
├── ui/                    # Radix UI wrappers
├── features/              # Feature-specific
│   └── booking/
│       ├── BookingCard.tsx
│       ├── BookingForm.tsx
│       └── index.ts       # Barrel export
└── layout/                # Layout components
```

**DO**: Use barrel exports for clean imports
```typescript
// components/features/booking/index.ts
export { BookingCard } from './BookingCard';
export { BookingForm } from './BookingForm';

// Usage
import { BookingCard, BookingForm } from '@/components/features/booking';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `BookingCard.tsx` |
| Utilities | camelCase | `formatDate.ts` |
| Hooks | camelCase with `use` | `useBooking.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_GUESTS` |
| Types/Interfaces | PascalCase | `BookingRequest` |
| API Routes | lowercase kebab | `booking-request.ts` |

**For complete standards, see**: [.claude/docs/standards/coding-standards.md](../.claude/docs/standards/coding-standards.md)

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add booking cancellation` |
| `fix` | Bug fix | `fix: resolve duplicate payment` |
| `docs` | Documentation | `docs: update API documentation` |
| `refactor` | Code refactoring | `refactor: extract booking service` |
| `test` | Adding tests | `test: add booking integration tests` |
| `chore` | Maintenance | `chore: update dependencies` |
| `style` | Code formatting | `style: format with prettier` |
| `perf` | Performance | `perf: optimize vendor search` |

### Examples

```bash
# Feature
git commit -m "feat: add cuisine filter to vendor search"

# Bug fix
git commit -m "fix: prevent duplicate booking creation"

# Documentation
git commit -m "docs: add deployment guide"

# Refactoring
git commit -m "refactor: extract payment logic to service"

# Test
git commit -m "test: add integration tests for booking flow"

# Breaking change
git commit -m "feat!: change booking API response format

BREAKING CHANGE: booking response now returns nested vendor object"
```

### Best Practices

- **Keep commits atomic**: One logical change per commit
- **Write clear descriptions**: Explain what and why, not how
- **Use present tense**: "add feature" not "added feature"
- **Reference issues**: `fix: resolve payment bug (closes #123)`
- **Keep first line under 72 characters**

---

## Pull Request Process

### Before Submitting

- [ ] All tests pass
- [ ] Code is properly formatted (`npm run format`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Documentation updated (if needed)
- [ ] Self-review completed

### PR Template

When you create a PR, you'll see a template. Fill it out completely:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123
Related to #456

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows coding standards
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Review Process

1. **Automated checks**: CI/CD runs tests, linting, type-check
2. **Code review**: At least 1 approval required from maintainers
3. **Address feedback**: Make requested changes
4. **Final approval**: Maintainer approves PR
5. **Merge**: Squash and merge to main

### Merge Criteria

- All automated checks pass
- At least 1 approval from maintainer
- No merge conflicts
- Branch is up-to-date with main
- All conversations resolved

---

## Testing Requirements

### Test Coverage

We aim for:
- **Unit tests**: 80%+ coverage
- **Integration tests**: Critical user flows
- **E2E tests**: Core functionality

### Writing Tests

**Unit tests** (components, utilities):
```typescript
// BookingCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BookingCard } from './BookingCard';

describe('BookingCard', () => {
  it('should display booking details', () => {
    const booking = createMockBooking();
    render(<BookingCard booking={booking} />);
    expect(screen.getByText(booking.vendorName)).toBeInTheDocument();
  });
});
```

**Integration tests** (API routes):
```typescript
// booking.test.ts
describe('POST /api/bookings', () => {
  it('should create booking with valid data', async () => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(validBookingData),
    });
    expect(response.status).toBe(201);
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test BookingCard.test.tsx

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test -- --watch
```

---

## Code Review

### As a Contributor

**When you receive feedback**:
- Respond to all comments
- Ask questions if unclear
- Make requested changes promptly
- Push new commits (don't force push)
- Mark conversations as resolved

### As a Reviewer

**What to look for**:
- Code follows standards
- Logic is correct and efficient
- Tests are adequate
- Documentation is updated
- No security vulnerabilities
- Performance considerations

**How to review**:
- Be respectful and constructive
- Explain the "why" behind suggestions
- Approve when ready or request changes
- Use "Request changes" for blocking issues
- Use "Comment" for non-blocking suggestions

---

## Issue Tracking

### Creating Issues

**Bug reports**:
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., macOS]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]
```

**Feature requests**:
```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features.

**Additional context**
Add any other context or screenshots.
```

### Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `good-first-issue` | Good for newcomers |
| `help-wanted` | Extra attention needed |
| `documentation` | Improvements or additions to docs |
| `duplicate` | This issue already exists |
| `wontfix` | This will not be worked on |

---

## Getting Help

### Resources

- **Documentation**: Start with `/docs` folder
- **Architecture**: See [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)
- **Development**: See [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Standards**: See [.claude/docs/standards/coding-standards.md](../.claude/docs/standards/coding-standards.md)

### Communication Channels

- **GitHub Discussions**: For questions and discussions
- **GitHub Issues**: For bug reports and feature requests
- **Slack** (if team member): #dev-help channel
- **Email**: dev@fleetfeast.com for private matters

### Office Hours

- **Tuesday & Thursday**: 2-3 PM EST
- Join via Zoom link in #dev-help channel
- Ask questions, pair program, get unblocked

### Mentorship

New contributors can request a mentor to help with:
- Setting up development environment
- Understanding the codebase
- Reviewing PRs before submission
- Learning best practices

Contact via #dev-help or email dev@fleetfeast.com

---

## Additional Guidelines

### Security

- **Never commit secrets**: Use `.env.local` (gitignored)
- **Report vulnerabilities privately**: Email security@fleetfeast.com
- **Follow security best practices**: See [.claude/docs/standards/coding-standards.md](../.claude/docs/standards/coding-standards.md)

### Performance

- Use React Server Components by default
- Optimize database queries
- Enable caching where appropriate
- Use Next.js Image component for images

### Accessibility

- Use semantic HTML
- Include ARIA labels
- Test with keyboard navigation
- Support screen readers
- Use Radix UI primitives (built-in accessibility)

### Documentation

- Update README.md for major changes
- Add JSDoc comments for complex functions
- Update API documentation for endpoint changes
- Include inline comments for non-obvious logic

---

## Recognition

We value all contributions! Contributors will be:
- Listed in `CONTRIBUTORS.md`
- Mentioned in release notes
- Given credit in documentation
- Invited to contributor events

---

## License

By contributing to Fleet Feast, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Fleet Feast! Your efforts help make our platform better for everyone.** 🚚🍔
