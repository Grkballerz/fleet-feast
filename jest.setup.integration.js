/**
 * Jest Setup for Integration Tests (Node Environment)
 * Provides necessary polyfills and mocks for API route testing
 */

// Polyfill TextEncoder/TextDecoder for Node environment
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Import testing utilities
import '@testing-library/jest-dom';

// Mock @auth/prisma-adapter BEFORE any imports that use it
jest.mock('@auth/prisma-adapter', () => ({
  __esModule: true,
  PrismaAdapter: jest.fn(() => ({
    createUser: jest.fn(),
    getUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByAccount: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    linkAccount: jest.fn(),
    unlinkAccount: jest.fn(),
  })),
}));

// Mock next-auth for server-side testing
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('next-auth/next', () => ({
  __esModule: true,
  getServerSession: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    id: 'credentials',
    name: 'Credentials',
    type: 'credentials',
    credentials: {},
    authorize: jest.fn(),
  })),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/fleet_feast_test';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jest-integration-tests-32-chars-min';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Suppress console output in tests (optional)
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('punycode')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
