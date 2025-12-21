/**
 * InquiryForm Usage Examples
 *
 * This file demonstrates various usage patterns for the InquiryForm component.
 */

import React, { useState } from "react";
import { InquiryForm, InquiryRequestData } from "./InquiryForm";
import { CuisineType } from "@/types";

// Example 1: Basic usage in a booking page
export function BasicInquiryFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vendor = {
    id: "vendor-123",
    businessName: "Taco Truck Supreme",
    cuisineType: CuisineType.MEXICAN,
    capacityMin: 25,
    capacityMax: 150,
  };

  const handleSubmit = async (inquiry: InquiryRequestData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          ...inquiry,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      // Redirect to confirmation page
      const data = await response.json();
      window.location.href = `/inquiries/${data.id}/confirmation`;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="heading-1 mb-6">Request a Quote from {vendor.businessName}</h1>
        <InquiryForm
          vendor={vendor}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}

// Example 2: With custom success handling
export function InquiryFormWithCustomSuccessExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const vendor = {
    id: "vendor-456",
    businessName: "Burger Bonanza",
    cuisineType: CuisineType.AMERICAN,
    capacityMin: 50,
    capacityMax: 300,
  };

  const handleSubmit = async (inquiry: InquiryRequestData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          ...inquiry,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      // Show custom success modal instead of redirecting
      setShowSuccessModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <InquiryForm
        vendor={vendor}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h2 className="heading-2 mb-4">Quote Request Sent!</h2>
            <p className="mb-4">
              We've notified {vendor.businessName}. They typically respond within 24 hours.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="neo-btn-primary"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Example 3: With error handling and retry
export function InquiryFormWithErrorHandlingExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const vendor = {
    id: "vendor-789",
    businessName: "Pizza Paradise",
    cuisineType: CuisineType.ITALIAN,
    capacityMin: 20,
    capacityMax: 100,
  };

  const handleSubmit = async (inquiry: InquiryRequestData) => {
    setIsSubmitting(true);

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendorId: vendor.id,
            ...inquiry,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit inquiry");
        }

        setRetryCount(0);
        return; // Success
      } catch (error) {
        attempt++;
        setRetryCount(attempt);

        if (attempt >= maxRetries) {
          setIsSubmitting(false);
          throw new Error(`Failed after ${maxRetries} attempts. Please try again later.`);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div>
      {retryCount > 0 && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-900 rounded">
          Retry attempt {retryCount}/3...
        </div>
      )}

      <InquiryForm
        vendor={vendor}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}

// Example 4: Pre-filled form (from URL params or user preferences)
export function PrefilledInquiryFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vendor = {
    id: "vendor-101",
    businessName: "Dessert Dreams",
    cuisineType: CuisineType.DESSERT,
    capacityMin: 10,
    capacityMax: 80,
  };

  // In a real app, get these from URL params or localStorage
  const prefillData = {
    eventType: "BIRTHDAY" as const,
    guestCount: 30,
    location: "123 Main Street, City, State 12345",
  };

  const handleSubmit = async (inquiry: InquiryRequestData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          ...inquiry,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      const data = await response.json();
      console.log("Inquiry submitted:", data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p className="mb-4 text-sm text-gray-600">
        We've pre-filled some details based on your previous preferences.
      </p>
      <InquiryForm
        vendor={vendor}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}

// Example 5: With analytics tracking
export function InquiryFormWithAnalyticsExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vendor = {
    id: "vendor-202",
    businessName: "Asian Fusion Express",
    cuisineType: CuisineType.ASIAN,
    capacityMin: 30,
    capacityMax: 200,
  };

  const handleSubmit = async (inquiry: InquiryRequestData) => {
    setIsSubmitting(true);

    // Track inquiry start
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "inquiry_started", {
        vendor_id: vendor.id,
        event_type: inquiry.eventType,
        guest_count: inquiry.guestCount,
      });
    }

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          ...inquiry,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      const data = await response.json();

      // Track successful inquiry
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "inquiry_completed", {
          inquiry_id: data.id,
          vendor_id: vendor.id,
          event_type: inquiry.eventType,
          guest_count: inquiry.guestCount,
        });
      }

      return data;
    } catch (error) {
      // Track error
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "inquiry_failed", {
          vendor_id: vendor.id,
          error_message: error instanceof Error ? error.message : "Unknown error",
        });
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InquiryForm
      vendor={vendor}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
    />
  );
}
