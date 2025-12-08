"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Calendar, MapPin, Users, Clock, DollarSign } from "lucide-react";

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

interface BookingFormData {
  vendorId: string;
  eventDate: string;
  eventTime: string;
  duration: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    venueName?: string;
  };
  guestCount: number;
  eventType: EventType;
  specialRequests?: string;
}

interface PriceBreakdown {
  basePrice: number;
  guestSurcharge: number;
  durationFee: number;
  travelFee: number;
  subtotal: number;
  platformFee: number;
  total: number;
}

interface VendorInfo {
  id: string;
  businessName: string;
  minimumGuests: number;
  maximumGuests: number;
  pricePerPerson: number;
  baseRate: number;
}

export function BookingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("vendor");

  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(
    null
  );

  const [formData, setFormData] = useState<BookingFormData>({
    vendorId: vendorId || "",
    eventDate: "",
    eventTime: "",
    duration: 4,
    location: {
      address: "",
      city: "",
      state: "NY",
      zipCode: "",
      venueName: "",
    },
    guestCount: 50,
    eventType: "CORPORATE",
    specialRequests: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>(
    {}
  );

  // Fetch vendor information
  useEffect(() => {
    if (!vendorId) {
      setError("No vendor selected");
      setLoading(false);
      return;
    }

    async function fetchVendor() {
      try {
        const res = await fetch(`/api/vendors/${vendorId}`);
        if (!res.ok) throw new Error("Failed to fetch vendor");
        const data = await res.json();
        setVendor(data);
        setFormData((prev) => ({ ...prev, vendorId }));
      } catch (err) {
        setError("Failed to load vendor information");
      } finally {
        setLoading(false);
      }
    }

    fetchVendor();
  }, [vendorId]);

  // Calculate price when relevant fields change
  useEffect(() => {
    if (!vendor || !formData.guestCount || !formData.duration) return;

    async function calculatePrice() {
      try {
        const res = await fetch("/api/bookings/calculate-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendorId: vendor.id,
            guestCount: formData.guestCount,
            duration: formData.duration,
            location: formData.location,
          }),
        });

        if (!res.ok) throw new Error("Failed to calculate price");
        const breakdown = await res.json();
        setPriceBreakdown(breakdown);
      } catch (err) {
        console.error("Price calculation error:", err);
      }
    }

    calculatePrice();
  }, [vendor, formData.guestCount, formData.duration, formData.location]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<Record<string, string>> = {};

    if (!formData.eventDate) {
      errors.eventDate = "Event date is required";
    } else {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.eventDate = "Event date cannot be in the past";
      }
    }

    if (!formData.eventTime) {
      errors.eventTime = "Event time is required";
    }

    if (!formData.location.address) {
      errors.address = "Address is required";
    }

    if (!formData.location.city) {
      errors.city = "City is required";
    }

    if (!formData.location.zipCode) {
      errors.zipCode = "ZIP code is required";
    }

    if (vendor) {
      if (formData.guestCount < vendor.minimumGuests) {
        errors.guestCount = `Minimum ${vendor.minimumGuests} guests required`;
      }
      if (formData.guestCount > vendor.maximumGuests) {
        errors.guestCount = `Maximum ${vendor.maximumGuests} guests allowed`;
      }
    }

    if (formData.duration < 1) {
      errors.duration = "Duration must be at least 1 hour";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      const booking = await res.json();
      router.push(`/booking/${booking.id}/payment`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container-custom py-8">
        <Alert variant="error">
          {error || "Vendor not found. Please select a vendor first."}
        </Alert>
        <Button
          variant="secondary"
          onClick={() => router.push("/vendors")}
          className="mt-4"
        >
          Browse Vendors
        </Button>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-1 mb-2">Book {vendor.businessName}</h1>
          <p className="text-text-secondary">
            Fill out the details below to request a booking
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Details Card */}
          <Card className="neo-card-glass neo-shadow rounded-neo">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="heading-3">Event Details</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Event Date"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                  error={formErrors.eventDate}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />

                <Input
                  label="Event Time"
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) =>
                    setFormData({ ...formData, eventTime: e.target.value })
                  }
                  error={formErrors.eventTime}
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Duration (hours) <span className="text-error">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-text-secondary" />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value) || 1,
                        })
                      }
                      className="neo-input w-full"
                    />
                  </div>
                  {formErrors.duration && (
                    <p className="mt-1 text-sm text-error">
                      {formErrors.duration}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Guest Count <span className="text-error">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-text-secondary" />
                    <input
                      type="number"
                      min={vendor.minimumGuests}
                      max={vendor.maximumGuests}
                      value={formData.guestCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          guestCount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="neo-input w-full"
                    />
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    Min: {vendor.minimumGuests}, Max: {vendor.maximumGuests}
                  </p>
                  {formErrors.guestCount && (
                    <p className="mt-1 text-sm text-error">
                      {formErrors.guestCount}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Event Type <span className="text-error">*</span>
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eventType: e.target.value as EventType,
                      })
                    }
                    className="neo-input w-full"
                    required
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Location Card */}
          <Card className="neo-card-glass neo-shadow rounded-neo">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="heading-3">Event Location</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input
                  label="Venue Name (Optional)"
                  value={formData.location.venueName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        venueName: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Central Park, City Hall"
                />

                <Input
                  label="Street Address"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: e.target.value,
                      },
                    })
                  }
                  error={formErrors.address}
                  required
                  placeholder="123 Main Street"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, city: e.target.value },
                      })
                    }
                    error={formErrors.city}
                    required
                    placeholder="New York"
                  />

                  <Input
                    label="State"
                    value={formData.location.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          state: e.target.value,
                        },
                      })
                    }
                    required
                    placeholder="NY"
                  />

                  <Input
                    label="ZIP Code"
                    value={formData.location.zipCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          zipCode: e.target.value,
                        },
                      })
                    }
                    error={formErrors.zipCode}
                    required
                    placeholder="10001"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Special Requests Card */}
          <Card className="neo-card-glass neo-shadow rounded-neo">
            <CardHeader>
              <h2 className="heading-3">Special Requests (Optional)</h2>
            </CardHeader>
            <CardBody>
              <textarea
                value={formData.specialRequests}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequests: e.target.value })
                }
                placeholder="Any special dietary requirements, setup preferences, or other notes..."
                rows={4}
                className="textarea w-full"
              />
            </CardBody>
          </Card>

          {/* Price Breakdown Card */}
          {priceBreakdown && (
            <Card className="neo-card-glass neo-shadow rounded-neo">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h2 className="heading-3">Price Breakdown</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Price</span>
                    <span>${priceBreakdown.basePrice.toFixed(2)}</span>
                  </div>
                  {priceBreakdown.guestSurcharge > 0 && (
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Additional Guests</span>
                      <span>+${priceBreakdown.guestSurcharge.toFixed(2)}</span>
                    </div>
                  )}
                  {priceBreakdown.durationFee > 0 && (
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Extended Duration</span>
                      <span>+${priceBreakdown.durationFee.toFixed(2)}</span>
                    </div>
                  )}
                  {priceBreakdown.travelFee > 0 && (
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Travel Fee</span>
                      <span>+${priceBreakdown.travelFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="divider" />
                  <div className="flex justify-between font-medium">
                    <span>Subtotal</span>
                    <span>${priceBreakdown.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Service Fee (15%)</span>
                    <span>+${priceBreakdown.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="divider" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      ${priceBreakdown.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={submitting || !priceBreakdown}
              className="flex-1"
            >
              {submitting ? "Creating Booking..." : "Continue to Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
