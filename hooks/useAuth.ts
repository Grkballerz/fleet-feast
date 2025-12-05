/**
 * Fleet Feast - useAuth Hook
 * Combines NextAuth session with Zustand auth store
 * Provides unified auth interface with role helpers
 */

"use client";

import { useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useAuthStore } from "@/lib/store";
import { UserRole } from "@/types";

export interface UseAuthReturn {
  // Session data
  user: ReturnType<typeof useAuthStore>["user"];
  isAuthenticated: boolean;
  isLoading: boolean;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;

  // Role helpers
  isAdmin: boolean;
  isVendor: boolean;
  isCustomer: boolean;
  hasRole: (role: UserRole) => boolean;
}

/**
 * useAuth Hook
 * Syncs NextAuth session with Zustand store
 * Provides login, logout, register functions and role helpers
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const { user, setUser, clearUser, isAdmin, isVendor, isCustomer, hasRole } =
    useAuthStore();

  // Sync NextAuth session with Zustand store
  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        createdAt: new Date(), // Not available in session
        updatedAt: new Date(), // Not available in session
      });
    } else if (status === "unauthenticated") {
      clearUser();
    }
  }, [session, status, setUser, clearUser]);

  // Login function
  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }
  };

  // Logout function
  const logout = async () => {
    await signOut({ redirect: false });
    clearUser();
  };

  // Register function
  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    // Auto-login after registration
    await login(data.email, data.password);
  };

  return {
    // Session data
    user,
    isAuthenticated: !!user,
    isLoading: status === "loading",

    // Auth actions
    login,
    logout,
    register,

    // Role helpers
    isAdmin: isAdmin(),
    isVendor: isVendor(),
    isCustomer: isCustomer(),
    hasRole,
  };
}
