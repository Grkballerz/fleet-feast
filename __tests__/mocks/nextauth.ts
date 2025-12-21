/**
 * NextAuth Mock Helper
 * Provides mock implementation of NextAuth for testing
 */

import type { Session } from "next-auth";

export const mockGetServerSession = jest.fn<Promise<Session | null>, []>();
export const mockAuth = jest.fn<Promise<Session | null>, []>();

// Mock next-auth/next module (old API)
jest.mock("next-auth/next", () => ({
  getServerSession: mockGetServerSession,
}));

// Mock next-auth (new API v5)
jest.mock("next-auth", () => {
  const actual = jest.requireActual("next-auth");
  return {
    ...actual,
    default: jest.fn(() => ({
      auth: mockAuth,
      handlers: { GET: jest.fn(), POST: jest.fn() },
      signIn: jest.fn(),
      signOut: jest.fn(),
    })),
  };
});

// Mock lib/auth module directly
jest.mock("@/lib/auth", () => ({
  auth: mockAuth,
  handlers: { GET: jest.fn(), POST: jest.fn() },
  signIn: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn(async () => {
    const session = await mockAuth();
    return session?.user ?? null;
  }),
}));

// Reset mocks before each test
beforeEach(() => {
  mockGetServerSession.mockClear();
  mockAuth.mockClear();
});

export default {
  getServerSession: mockGetServerSession,
  auth: mockAuth,
};
