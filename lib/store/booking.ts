/**
 * Fleet Feast - Booking Store
 * Zustand store for booking draft state during booking flow
 * Persists to localStorage to prevent data loss during multi-step flow
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DraftBooking {
  // Step 1: Vendor selection
  vendorId: string | null;
  vendorName: string | null;
  pricePerPerson: number | null;

  // Step 2: Event details
  eventDate: string | null; // ISO date string
  eventLocation: string | null;
  guestCount: number | null;
  specialRequests: string | null;

  // Step 3: Payment (not persisted)
  totalAmount: number | null;
  platformFee: number | null;

  // Metadata
  currentStep: 1 | 2 | 3;
  createdAt: string | null; // ISO timestamp
}

export interface BookingState {
  // State
  draftBooking: DraftBooking;

  // Actions - Vendor selection
  setVendor: (vendorId: string, vendorName: string, pricePerPerson: number) => void;

  // Actions - Event details
  setEventDetails: (details: {
    eventDate: string;
    eventLocation: string;
    guestCount: number;
    specialRequests?: string;
  }) => void;

  // Actions - Payment
  setPayment: (totalAmount: number, platformFee: number) => void;

  // Actions - Navigation
  setStep: (step: 1 | 2 | 3) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Actions - Reset
  clearDraft: () => void;

  // Helpers
  isStepComplete: (step: 1 | 2 | 3) => boolean;
  getTotalAmount: () => number | null;
}

const initialDraft: DraftBooking = {
  vendorId: null,
  vendorName: null,
  pricePerPerson: null,
  eventDate: null,
  eventLocation: null,
  guestCount: null,
  specialRequests: null,
  totalAmount: null,
  platformFee: null,
  currentStep: 1,
  createdAt: null,
};

/**
 * Booking store with localStorage persistence
 * Maintains booking draft across page refreshes during booking flow
 */
export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      // Initial state
      draftBooking: initialDraft,

      // Set vendor (Step 1)
      setVendor: (vendorId, vendorName, pricePerPerson) =>
        set((state) => ({
          draftBooking: {
            ...state.draftBooking,
            vendorId,
            vendorName,
            pricePerPerson,
            currentStep: 2,
            createdAt: state.draftBooking.createdAt || new Date().toISOString(),
          },
        })),

      // Set event details (Step 2)
      setEventDetails: (details) =>
        set((state) => ({
          draftBooking: {
            ...state.draftBooking,
            ...details,
            currentStep: 3,
          },
        })),

      // Set payment (Step 3)
      setPayment: (totalAmount, platformFee) =>
        set((state) => ({
          draftBooking: {
            ...state.draftBooking,
            totalAmount,
            platformFee,
          },
        })),

      // Navigation
      setStep: (step) =>
        set((state) => ({
          draftBooking: {
            ...state.draftBooking,
            currentStep: step,
          },
        })),

      nextStep: () =>
        set((state) => {
          const nextStep = Math.min(state.draftBooking.currentStep + 1, 3) as 1 | 2 | 3;
          return {
            draftBooking: {
              ...state.draftBooking,
              currentStep: nextStep,
            },
          };
        }),

      previousStep: () =>
        set((state) => {
          const prevStep = Math.max(state.draftBooking.currentStep - 1, 1) as 1 | 2 | 3;
          return {
            draftBooking: {
              ...state.draftBooking,
              currentStep: prevStep,
            },
          };
        }),

      // Clear draft
      clearDraft: () =>
        set({
          draftBooking: initialDraft,
        }),

      // Check if step is complete
      isStepComplete: (step) => {
        const draft = get().draftBooking;
        switch (step) {
          case 1:
            return !!(draft.vendorId && draft.pricePerPerson);
          case 2:
            return !!(draft.eventDate && draft.eventLocation && draft.guestCount);
          case 3:
            return !!(draft.totalAmount);
          default:
            return false;
        }
      },

      // Calculate total amount
      getTotalAmount: () => {
        const draft = get().draftBooking;
        if (!draft.pricePerPerson || !draft.guestCount) return null;
        return draft.pricePerPerson * draft.guestCount;
      },
    }),
    {
      name: "fleet-feast-booking", // localStorage key
      partialize: (state) => ({
        draftBooking: {
          ...state.draftBooking,
          // Don't persist payment info for security
          totalAmount: null,
          platformFee: null,
        },
      }),
    }
  )
);
