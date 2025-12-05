/**
 * Fleet Feast - UI Store
 * Zustand store for UI state (toasts, modals, sidebar)
 * NOT persisted - ephemeral UI state only
 */

import { create } from "zustand";
import { generateRandomString } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // milliseconds, null for persistent
  createdAt: number; // timestamp
}

export interface UIState {
  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id" | "createdAt">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modals
  openModals: Set<string>;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  isModalOpen: (modalId: string) => boolean;

  // Sidebar (for mobile/tablet)
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

/**
 * UI store (no persistence)
 * Manages ephemeral UI state like toasts, modals, sidebar
 */
export const useUIStore = create<UIState>((set, get) => ({
  // Toasts
  toasts: [],

  addToast: (toast) => {
    const id = generateRandomString(16);
    const newToast: Toast = {
      ...toast,
      id,
      createdAt: Date.now(),
      duration: toast.duration ?? 5000, // Default 5 seconds
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  clearToasts: () =>
    set({
      toasts: [],
    }),

  // Modals
  openModals: new Set(),

  openModal: (modalId) =>
    set((state) => ({
      openModals: new Set(state.openModals).add(modalId),
    })),

  closeModal: (modalId) =>
    set((state) => {
      const newSet = new Set(state.openModals);
      newSet.delete(modalId);
      return { openModals: newSet };
    }),

  isModalOpen: (modalId) => get().openModals.has(modalId),

  // Sidebar
  isSidebarOpen: false,

  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  openSidebar: () =>
    set({
      isSidebarOpen: true,
    }),

  closeSidebar: () =>
    set({
      isSidebarOpen: false,
    }),
}));
