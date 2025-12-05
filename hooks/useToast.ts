/**
 * Fleet Feast - useToast Hook
 * Show toast notifications with auto-dismiss
 * Supports success, error, warning, and info types
 */

"use client";

import { useUIStore, ToastType } from "@/lib/store";

export interface UseToastReturn {
  // Actions
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => string;
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string) => string;
  showWarning: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // State
  toasts: ReturnType<typeof useUIStore>["toasts"];
}

/**
 * useToast Hook
 * Provides toast notification functions with auto-dismiss
 */
export function useToast(): UseToastReturn {
  const { toasts, addToast, removeToast, clearToasts } = useUIStore();

  const showToast = (
    type: ToastType,
    title: string,
    message?: string,
    duration: number = 5000
  ): string => {
    return addToast({
      type,
      title,
      message,
      duration,
    });
  };

  const showSuccess = (title: string, message?: string): string => {
    return showToast("success", title, message);
  };

  const showError = (title: string, message?: string): string => {
    return showToast("error", title, message, 7000); // Errors stay longer
  };

  const showWarning = (title: string, message?: string): string => {
    return showToast("warning", title, message, 6000);
  };

  const showInfo = (title: string, message?: string): string => {
    return showToast("info", title, message);
  };

  return {
    // Actions
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearToasts,

    // State
    toasts,
  };
}
