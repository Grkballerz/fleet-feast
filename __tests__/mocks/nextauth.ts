/**
 * NextAuth Mock Helper
 * Provides mock implementation of NextAuth for testing
 */

import type { Session } from "next-auth";

export const mockGetServerSession = jest.fn<Promise<Session | null>, []>();

// Mock next-auth/next module
jest.mock("next-auth/next", () => ({
  getServerSession: mockGetServerSession,
}));

// Reset mocks before each test
beforeEach(() => {
  mockGetServerSession.mockClear();
});

export default {
  getServerSession: mockGetServerSession,
};
