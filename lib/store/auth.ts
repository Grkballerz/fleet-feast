/**
 * Fleet Feast - Auth Store
 * Zustand store for authentication state management
 * Persists to localStorage for session continuity
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserRole } from "@/types";

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;

  // Helpers
  isAdmin: () => boolean;
  isVendor: () => boolean;
  isCustomer: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

/**
 * Auth store with localStorage persistence
 * Syncs with NextAuth session via useAuth hook
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Set user and update authenticated state
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      // Clear user on logout
      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // Update specific user fields
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Role helpers
      isAdmin: () => get().user?.role === UserRole.ADMIN,
      isVendor: () => get().user?.role === UserRole.VENDOR,
      isCustomer: () => get().user?.role === UserRole.CUSTOMER,
      hasRole: (role) => get().user?.role === role,
    }),
    {
      name: "fleet-feast-auth", // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
