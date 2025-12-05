# Task Briefing: Fleet-Feast-2c9

**Generated**: 2025-12-05T12:20:00Z
**Agent**: Taylor_Tester
**Task**: BLOCKER: Fix Jest configuration for Next.js 14 integration tests
**Priority**: P0 (CRITICAL)
**Invocation**: 1

---

## Objective

Fix Jest configuration to properly support Next.js 14 integration tests. Current tests fail with `Request is not defined` and ESM module errors.

## Current Errors

### Error 1: Request is not defined
```
ReferenceError: Request is not defined
  at Object.Request (node_modules/next/src/server/web/spec-extension/request.ts:15:34)
```

**Cause**: Integration tests use `jest-environment-jsdom` which doesn't have Web APIs like `Request`/`Response`. Route handlers require Node.js environment.

### Error 2: NextAuth ESM Error
```
Jest encountered an unexpected token
  SyntaxError: Cannot use import statement outside a module
```

**Cause**: NextAuth uses ESM, Jest configured for CommonJS.

## Current Configuration

**jest.config.js**:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',  // PROBLEM: Wrong for integration tests
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // ... rest of config
}

module.exports = createJestConfig(customJestConfig)
```

## Solution

### 1. Separate Test Environments

Create separate Jest configurations for unit tests (jsdom) and integration tests (node):

**jest.config.js** (updated):
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'jest-environment-jsdom',
      testMatch: [
        '<rootDir>/__tests__/unit/**/*.test.{ts,tsx}',
        '<rootDir>/__tests__/components/**/*.test.{ts,tsx}',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/integration/**/*.test.ts',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.integration.js'],
    },
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### 2. Create Integration Test Setup

**jest.setup.integration.js**:
```javascript
// Polyfill Request/Response for Node environment
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve(null)),
}));

// Import test utilities
import '@testing-library/jest-dom';

// Set test environment variables
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/fleet_feast_test';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jest';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
```

### 3. Update transformIgnorePatterns

Add to jest.config.js to handle ESM modules:

```javascript
transformIgnorePatterns: [
  'node_modules/(?!(next-auth|@auth|jose|uuid|nanoid)/)',
],
```

### 4. Fix Test Mocks

**__tests__/mocks/nextauth.ts** (update):
```typescript
import { jest } from '@jest/globals';

// Mock getServerSession
export const mockGetServerSession = jest.fn();

jest.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
}));

jest.mock('next-auth/next', () => ({
  getServerSession: mockGetServerSession,
}));

// Helper to set mock session
export function setMockSession(session: any) {
  mockGetServerSession.mockResolvedValue(session);
}

export function clearMockSession() {
  mockGetServerSession.mockResolvedValue(null);
}
```

### 5. Update Test Server Utilities

**__tests__/setup/server.ts**:
```typescript
// Ensure Request/Response available in Node environment
export function createPostRequest(url: string, body: any): Request {
  return new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export function createGetRequest(url: string): Request {
  return new Request(url, {
    method: 'GET',
  });
}

export async function expectResponse(response: Response, expectedStatus: number) {
  expect(response.status).toBe(expectedStatus);
  return response.json();
}
```

## Files to Modify

1. `jest.config.js` - Add projects configuration
2. `jest.setup.integration.js` - Create new file for integration tests
3. `__tests__/mocks/nextauth.ts` - Update mocks
4. `__tests__/setup/server.ts` - Ensure compatibility

## Verification Steps

1. Run unit tests: `npm test -- --selectProjects unit`
2. Run integration tests: `npm test -- --selectProjects integration`
3. Run all tests: `npm test`
4. Verify CI/CD pipeline passes

## Acceptance Criteria

- [ ] `npm test` runs without errors
- [ ] All integration tests pass
- [ ] No `Request is not defined` errors
- [ ] No ESM/CommonJS module errors
- [ ] Unit tests still work (jsdom environment)
- [ ] CI/CD test job succeeds

## Test Files to Verify

```
__tests__/
├── integration/
│   ├── auth.integration.test.ts
│   ├── booking.integration.test.ts
│   ├── payment.integration.test.ts
│   ├── messaging.integration.test.ts
│   └── index.test.ts
├── unit/
│   └── ... (should still work)
└── components/
    └── ... (should still work)
```

---

*Briefing generated by MASTER Orchestrator*
