"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Calendar, MapPin, Users, Clock, FileText } from "lucide-react";
import { CuisineType } from "@/types";

// Event type options
const EVENT_TYPES = [
  { value: "CORPORATE", label: "Corporate Event" },
  { value: "WEDDING", label: "Wedding" },
  { value: "BIRTHDAY", label: "Birthday Party" },
  { value: "FESTIVAL", label: "Festival" },
  { value: "PRIVATE_PARTY", label: "Private Party" },
  { value: "OTHER", label: "Other" },
] as const;

type EventType = typeof EVENT_TYPES[number]["value"];

export interface InquiryRequestData {
  eventDate: string;
  eventTime: string;
  eventType: EventType;
  location: string;
  guestCount: number;
  specialRequests?: string;
}

export interface InquiryFormProps {
  /**
   * Vendor information to validate guest count and display context
   */
  vendor: {
    id: string;
    businessName: string;
    cuisineType: CuisineType;
    capacityMin: number;
    capacityMax: number;
  };
  /**
   * Callback when form is submitted successfully
   */
  onSubmit: (inquiry: InquiryRequestData) => Promise<void>;
  /**
   * Loading state during submission
   */
  isLoading?: boolean;
}

/**
 * InquiryForm Component
 *
 * Customer booking inquiry form without price calculator or payment info.
 * Allows customers to request a custom quote from vendors.
 *
 * Features:
 * - Event date/time selection (min tomorrow)
 * - Event type selection
 * - Location input
 * - Guest count validation against vendor capacity
 * - Optional special requests
 * - Clear messaging about quote process
 * - Success state after submission
 *
 * @example
 * ```tsx
 * <InquiryForm
 *   vendor={vendorData}
 *   onSubmit={handleInquirySubmit}
 *   isLoading={submitting}
 * />
 * ```
 */
export function InquiryForm({ vendor, onSubmit, isLoading = false }: InquiryFormProps) {
  const [formData, setFormData] = useState<InquiryRequestData>({
    eventDate: "",
    eventTime: "",
    eventType: "CORPORATE",
    location: "",
    guestCount: vendor.capacityMin || 50,
    specialRequests: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof InquiryRequestData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Get tomorrow's date in YYYY-MM-DD format for min date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof InquiryRequestData, string>> = {};

    if (!formData.eventDate) {
      errors.eventDate = "Event date is required";
    } else {
      const selectedDate = new Date(formData.eventDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      if (selectedDate < tomorrow) {
        errors.eventDate = "Event date must be at least 1 day in advance";
      }
    }

    if (!formData.eventTime) {
      errors.eventTime = "Event time is required";
    }

    if (!formData.location || formData.location.trim().length === 0) {
      errors.location = "Event location is required";
    }

    if (formData.guestCount < vendor.capacityMin) {
      errors.guestCount = `Minimum ${vendor.capacityMin} guests required`;
    }

    if (formData.guestCount > vendor.capacityMax) {
      errors.guestCount = `Maximum ${vendor.capacityMax} guests allowed`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitError("Please fix the errors in the form");
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await onSubmit(formData);
      setSubmitSuccess(true);

      // Reset form after successful submission
      setFormData({
        eventDate: "",
        eventTime: "",
        eventType: "CORPORATE",
        location: "",
        guestCount: vendor.capacityMin || 50,
        specialRequests: "",
      });
      setFormErrors({});
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit inquiry");
      setSubmitSuccess(false);
    }
  };

  // Handle field changes
  const handleFieldChange = <K extends keyof InquiryRequestData>(
    field: K,
    value: InquiryRequestData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert variant="info" title="Request a Quote">
        Submit your event details below and {vendor.businessName} will review your request and send you a custom proposal with pricing and availability.
      </Alert>

      {/* Success Alert */}
      {submitSuccess && (
        <Alert variant="success" title="Inquiry Submitted!" dismissible onDismiss={() => setSubmitSuccess(false)}>
          Your inquiry has been sent to {vendor.businessName}. They will respond within 24-48 hours with a custom quote.
        </Alert>
      )}

      {/* Error Alert */}
      {submitError && (
        <Alert variant="error" dismissible onDismiss={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Details Card */}
        <Card className="neo-card-glass neo-shadow rounded-neo">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="heading-3">Event Details</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Date */}
              <Input
                label="Event Date"
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleFieldChange("eventDate", e.target.value)}
                error={formErrors.eventDate}
                required
                min={getTomorrowDate()}
                helperText="Must be at least 1 day in advance"
              />

              {/* Event Time */}
              <Input
                label="Event Time"
                type="time"
                value={formData.eventTime}
                onChange={(e) => handleFieldChange("eventTime", e.target.value)}
                error={formErrors.eventTime}
                required
                helperText="When should the vendor arrive?"
              />

              {/* Event Type */}
              <div className="md:col-span-2">
                <label
                  htmlFor="eventType"
                  className="mb-2 block text-sm font-bold text-white/90"
                >
                  Event Type <span className="ml-1 text-red-400" aria-label="required">*</span>
                </label>
                <select
                  id="eventType"
                  value={formData.eventType}
                  onChange={(e) => handleFieldChange("eventType", e.target.value as EventType)}
                  className="neo-input w-full"
                  required
                  aria-required="true"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest Count */}
              <div>
                <label
                  htmlFor="guestCount"
                  className="mb-2 block text-sm font-bold text-white/90"
                >
                  Guest Count <span className="ml-1 text-red-400" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="guestCount"
                    type="number"
                    min={vendor.capacityMin}
                    max={vendor.capacityMax}
                    value={formData.guestCount}
                    onChange={(e) => handleFieldChange("guestCount", parseInt(e.target.value) || vendor.capacityMin)}
                    className="neo-input w-full pl-10"
                    required
                    aria-required="true"
                    aria-describedby="guestCount-helper"
                    aria-invalid={!!formErrors.guestCount}
                  />
                </div>
                <p id="guestCount-helper" className="mt-1 text-sm text-white/60">
                  Min: {vendor.capacityMin}, Max: {vendor.capacityMax}
                </p>
                {formErrors.guestCount && (
                  <p className="mt-1 text-sm text-red-400 font-medium" role="alert" aria-live="polite">
                    {formErrors.guestCount}
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Location Card */}
        <Card className="neo-card-glass neo-shadow rounded-neo">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="heading-3">Event Location</h2>
            </div>
          </CardHeader>
          <CardBody>
            <Input
              label="Event Address"
              value={formData.location}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              error={formErrors.location}
              required
              placeholder="Enter the full event address"
              helperText="Include street, city, and state"
            />
          </CardBody>
        </Card>

        {/* Special Requests Card */}
        <Card className="neo-card-glass neo-shadow rounded-neo">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="heading-3">Special Requests (Optional)</h2>
            </div>
          </CardHeader>
          <CardBody>
            <Textarea
              label="Additional Details"
              value={formData.specialRequests}
              onChange={(e) => handleFieldChange("specialRequests", e.target.value)}
              placeholder="Any dietary requirements, setup preferences, menu preferences, or other special requests..."
              rows={4}
              maxLength={1000}
              showCharCount
              helperText="Help the vendor prepare the best quote for your event"
            />
          </CardBody>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
            iconLeft={<Clock className="h-5 w-5" aria-hidden="true" />}
          >
            {isLoading ? "Submitting..." : "Request a Quote"}
          </Button>
        </div>
      </form>
    </div>
  );
}
