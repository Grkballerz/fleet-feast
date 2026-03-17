"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { InquiryForm, type InquiryRequestData } from "@/components/booking";
import { Truck } from "lucide-react";
import type { CuisineType } from "@/types";

interface VendorInfo {
  id: string;
  businessName: string;
  cuisineType: CuisineType;
  capacityMin: number;
  capacityMax: number;
}

export function BookingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("vendorId") || searchParams.get("vendor");

  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch vendor information
  useEffect(() => {
    if (!vendorId) {
      setError("No vendor selected");
      setLoading(false);
      return;
    }

    async function fetchVendor() {
      try {
        const res = await fetch(`/api/trucks/${vendorId}`);
        if (!res.ok) throw new Error("Failed to fetch vendor");
        const data = await res.json();
        const truck = data.data?.truck;
        if (!truck) throw new Error("Vendor not found");

        // Map truck data to vendor info format
        setVendor({
          id: truck.id,
          businessName: truck.businessName,
          cuisineType: truck.cuisineType,
          capacityMin: truck.capacityMin || 10,
          capacityMax: truck.capacityMax || 200,
        });
      } catch (err) {
        setError("Failed to load vendor information");
      } finally {
        setLoading(false);
      }
    }

    fetchVendor();
  }, [vendorId]);

  // Handle inquiry submission
  const handleInquirySubmit = async (inquiry: InquiryRequestData) => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor!.id,
          ...inquiry,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit inquiry");
      }

      const result = await res.json();
      // Redirect to the booking detail page
      router.push(`/customer/bookings/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit inquiry");
      setSubmitting(false);
      throw err; // Re-throw to let InquiryForm handle the error
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
          onClick={() => router.push("/trucks")}
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
        {/* Vendor Header with Quote Info */}
        <Card className="neo-card-glass neo-shadow rounded-neo mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Truck className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h1 className="heading-2 mb-1">Request a Quote from {vendor.businessName}</h1>
                <p className="text-text-secondary">
                  {vendor.cuisineType} • Serves {vendor.capacityMin}-{vendor.capacityMax} guests
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-text-secondary">
              Submit your event details below and {vendor.businessName} will review your request and send you a custom proposal with pricing and availability.
            </p>
          </CardBody>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError(null)} className="mb-6">
            {error}
          </Alert>
        )}

        {/* Inquiry Form */}
        <InquiryForm
          vendor={vendor}
          onSubmit={handleInquirySubmit}
          isLoading={submitting}
        />

        {/* Back Button */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Back to Vendor Details
          </Button>
        </div>
      </div>
    </div>
  );
}
