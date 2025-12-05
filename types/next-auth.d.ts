/**
 * NextAuth Type Extensions for Fleet Feast
 *
 * Extends default NextAuth types to include custom user properties.
 */

import { UserRole } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extended session user
   */
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  /**
   * Extended user object
   */
  interface User extends DefaultUser {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT token
   */
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
  }
}
