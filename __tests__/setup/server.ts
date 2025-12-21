/**
 * Server Test Setup Utilities
 * Provides test server and request helpers
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { UserRole } from "@prisma/client";

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(
  url: string,
  options: RequestInit & { session?: Session | null } = {}
): NextRequest {
  const { session, ...requestInit } = options;

  const request = new NextRequest(new Request(url, requestInit));

  // Mock session if provided
  if (session !== undefined) {
    // Mock both old and new NextAuth APIs
    jest.mocked(getServerSession).mockResolvedValue(session);
    jest.mocked(auth).mockResolvedValue(session);
  }

  return request;
}

/**
 * Create a mock authenticated session
 */
export function createMockSession(userId: string, role: UserRole = UserRole.CUSTOMER, email: string = "test@example.com"): Session {
  return {
    user: {
      id: userId,
      email,
      role,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };
}

/**
 * Create a POST request with JSON body
 */
export function createPostRequest(
  url: string,
  body: any,
  session?: Session | null
): NextRequest {
  return createMockRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    session,
  });
}

/**
 * Create a GET request with query params
 */
export function createGetRequest(
  url: string,
  params: Record<string, string> = {},
  session?: Session | null
): NextRequest {
  const urlWithParams = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlWithParams.searchParams.set(key, value);
  });

  return createMockRequest(urlWithParams.toString(), {
    method: "GET",
    session,
  });
}

/**
 * Create a PUT request with JSON body
 */
export function createPutRequest(
  url: string,
  body: any,
  session?: Session | null
): NextRequest {
  return createMockRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    session,
  });
}

/**
 * Create a DELETE request
 */
export function createDeleteRequest(
  url: string,
  session?: Session | null
): NextRequest {
  return createMockRequest(url, {
    method: "DELETE",
    session,
  });
}

/**
 * Helper to parse NextResponse JSON
 */
export async function getResponseJson(response: Response): Promise<any> {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Helper to assert response status and parse JSON
 */
export async function expectResponse(
  response: Response,
  expectedStatus: number
): Promise<any> {
  expect(response.status).toBe(expectedStatus);
  return getResponseJson(response);
}

/**
 * Mock NextAuth session
 */
export function mockAuthSession(session: Session | null) {
  jest.mocked(getServerSession).mockResolvedValue(session);
  jest.mocked(auth).mockResolvedValue(session);
}

/**
 * Clear all NextAuth mocks
 */
export function clearAuthMocks() {
  jest.mocked(getServerSession).mockClear();
  jest.mocked(auth).mockClear();
}
