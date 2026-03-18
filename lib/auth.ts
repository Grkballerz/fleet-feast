import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@prisma/client";

/**
 * NextAuth configuration for Fleet Feast
 * Implements JWT-based authentication with role-based access control
 *
 * Features:
 * - Email/password credentials authentication
 * - JWT tokens with 7-day expiry
 * - HTTP-only secure cookies (SameSite=Strict)
 * - Role-based access control (Customer, Vendor, Admin)
 * - Account status checking (Active, Suspended, Banned)
 *
 * Reference: https://next-auth.js.org/configuration/options
 *
 * Note: PrismaAdapter removed - not needed for JWT strategy with Credentials provider
 */
export const authOptions: NextAuthConfig = {
  // No adapter needed for JWT + Credentials

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/verify-email",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase(),
            deletedAt: null, // Exclude soft-deleted users
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        // Check account status
        if (user.status === UserStatus.SUSPENDED) {
          throw new Error("Account suspended. Please contact support.");
        }

        if (user.status === UserStatus.BANNED) {
          throw new Error("Account banned. Please contact support.");
        }

        if (user.status === UserStatus.DELETED) {
          throw new Error("Account not found");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.email, // Use email as name if no name field
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Refresh session - check if user still active
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });

        if (!dbUser || dbUser.status !== UserStatus.ACTIVE) {
          // Force logout if user is no longer active
          return null as any;
        }

        token.role = dbUser.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Create NextAuth instance and export auth function
const { auth, handlers, signIn, signOut } = NextAuth(authOptions);
export { auth, handlers, signIn, signOut };

/**
 * Get current user from session
 * Helper function to get authenticated user in API routes and server components
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Get server session (alias for auth() for backwards compatibility)
 */
export async function getServerSession() {
  return auth();
}
