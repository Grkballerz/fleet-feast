/**
 * Fleet Feast - State Management
 * Central exports for all Zustand stores
 */

export { useAuthStore } from "./auth";
export { useBookingStore } from "./booking";
export { useUIStore } from "./ui";
export { useSearchStore } from "./search";

// Re-export types
export type { AuthState } from "./auth";
export type { BookingState, DraftBooking } from "./booking";
export type { UIState, Toast, ToastType } from "./ui";
export type { SearchState } from "./search";
