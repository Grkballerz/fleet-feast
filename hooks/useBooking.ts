/**
 * Fleet Feast - useBooking Hook
 * Access draft booking state and booking flow navigation
 * Provides mutation for submitting bookings
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/lib/store";
import { BookingFormData, ApiResponse, Booking } from "@/types";
import { useToast } from "./useToast";

export interface UseBookingReturn {
  // Draft booking state
  draftBooking: ReturnType<typeof useBookingStore>["draftBooking"];

  // Actions
  setVendor: ReturnType<typeof useBookingStore>["setVendor"];
  setEventDetails: ReturnType<typeof useBookingStore>["setEventDetails"];
  setPayment: ReturnType<typeof useBookingStore>["setPayment"];
  setStep: ReturnType<typeof useBookingStore>["setStep"];
  nextStep: ReturnType<typeof useBookingStore>["nextStep"];
  previousStep: ReturnType<typeof useBookingStore>["previousStep"];
  clearDraft: ReturnType<typeof useBookingStore>["clearDraft"];

  // Helpers
  isStepComplete: ReturnType<typeof useBookingStore>["isStepComplete"];
  getTotalAmount: ReturnType<typeof useBookingStore>["getTotalAmount"];

  // Submit booking
  submitBooking: (paymentMethodId: string) => Promise<Booking>;
  isSubmitting: boolean;
}

/**
 * useBooking Hook
 * Manages booking draft state and submission
 */
export function useBooking(): UseBookingReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const bookingStore = useBookingStore();

  // Submit booking mutation
  const mutation = useMutation({
    mutationFn: async (paymentMethodId: string): Promise<Booking> => {
      const draft = bookingStore.draftBooking;

      // Validate draft
      if (!draft.vendorId || !draft.eventDate || !draft.eventLocation || !draft.guestCount) {
        throw new Error("Incomplete booking information");
      }

      const bookingData: BookingFormData = {
        vendorId: draft.vendorId,
        eventDate: draft.eventDate,
        eventLocation: draft.eventLocation,
        guestCount: draft.guestCount,
        specialRequests: draft.specialRequests || undefined,
      };

      // Submit booking
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingData,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const error: ApiResponse = await response.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const result: ApiResponse<Booking> = await response.json();
      return result.data!;
    },
    onSuccess: (booking) => {
      // Clear draft
      bookingStore.clearDraft();

      // Invalidate all booking queries using hierarchical keys
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });

      // Also invalidate vendor availability since a booking was created
      if (booking.vendorId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.vendors.availability(booking.vendorId)
        });
      }

      // Show success message
      showSuccess("Booking created successfully!", "Your booking has been submitted.");

      // Redirect to booking details
      router.push(`/dashboard/bookings/${booking.id}`);
    },
    onError: (error: Error) => {
      showError("Booking failed", error.message);
    },
  });

  return {
    // Draft booking state
    draftBooking: bookingStore.draftBooking,

    // Actions
    setVendor: bookingStore.setVendor,
    setEventDetails: bookingStore.setEventDetails,
    setPayment: bookingStore.setPayment,
    setStep: bookingStore.setStep,
    nextStep: bookingStore.nextStep,
    previousStep: bookingStore.previousStep,
    clearDraft: bookingStore.clearDraft,

    // Helpers
    isStepComplete: bookingStore.isStepComplete,
    getTotalAmount: bookingStore.getTotalAmount,

    // Submit booking
    submitBooking: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
}
