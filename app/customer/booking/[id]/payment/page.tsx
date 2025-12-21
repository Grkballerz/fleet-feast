"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { HelcimPaymentForm } from "@/components/payment/HelcimPaymentForm";
import { ArrowLeft, CheckCircle2, AlertTriangle, Calendar, MapPin, Users, DollarSign } from "lucide-react";
import type { BookingDetails } from "@/modules/booking/booking.types";
import { BookingStatus } from "@prisma/client";

interface PaymentPageProps {
  params: {
    id: string;
  };
}

/**
 * Payment Page
 *
 * Allows customers to pay for accepted bookings using Helcim.
 * Features:
 * - Fetches booking details and validates status
 * - Displays fee breakdown (proposal amount + platform fee)
 * - Integrates HelcimPaymentForm for secure card tokenization
 * - Processes payment via /api/payments
 * - Handles success/error states with proper redirects
 */
export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter();
  const { id: bookingId } = params;

  // State management
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  /**
   * Fetch booking details on mount
   */
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to load booking details");
        }

        const data = await response.json();
        setBooking(data.booking);

        // Validate booking is ready for payment
        if (data.booking.status !== BookingStatus.ACCEPTED) {
          setError("This booking is not ready for payment. Only accepted bookings can be paid.");
        }
      } catch (err) {
        console.error("[Payment Page] Error fetching booking:", err);
        setError(err instanceof Error ? err.message : "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  /**
   * Handle successful payment tokenization
   */
  const handlePaymentSuccess = async (cardToken: string) => {
    try {
      setProcessing(true);
      setError(null);

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bookingId,
          cardToken,
          amount: booking?.totalAmount,
          currency: "USD",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Payment processing failed");
      }

      // Payment successful
      setPaymentSuccess(true);

      // Redirect to booking details with success message after 2 seconds
      setTimeout(() => {
        router.push(`/customer/bookings/${bookingId}?payment=success`);
      }, 2000);
    } catch (err) {
      console.error("[Payment Page] Payment processing error:", err);
      setError(err instanceof Error ? err.message : "Payment processing failed");
      setProcessing(false);
    }
  };

  /**
   * Handle payment tokenization error
   */
  const handlePaymentError = (error: Error) => {
    console.error("[Payment Page] Payment tokenization error:", error);
    setError(error.message || "Failed to process payment information");
    setProcessing(false);
  };

  /**
   * Calculate fee breakdown
   */
  const calculateFees = () => {
    if (!booking || !booking.proposalAmount || !booking.platformFeeCustomer) {
      return null;
    }

    const proposalAmount = Number(booking.proposalAmount);
    const platformFee = Number(booking.platformFeeCustomer);
    const totalAmount = Number(booking.totalAmount);

    return {
      proposalAmount,
      platformFee,
      totalAmount,
    };
  };

  const fees = calculateFees();

  // Loading state
  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" className="mb-4" />
            <p className="text-text-secondary">Loading payment details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (booking not found or other errors)
  if (error && !booking) {
    return (
      <div className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <Alert variant="error" className="mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Unable to Load Payment</strong>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </Alert>

          <Button
            variant="outline"
            onClick={() => router.push("/customer/bookings")}
            iconLeft={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  // Booking status not valid for payment
  if (booking && booking.status !== BookingStatus.ACCEPTED) {
    return (
      <div className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <Alert variant="warning" className="mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Payment Not Available</strong>
                <p className="text-sm mt-1">
                  This booking is not ready for payment. Current status: {booking.status}
                </p>
                <p className="text-sm mt-2">
                  Only bookings with ACCEPTED status can be paid.
                </p>
              </div>
            </div>
          </Alert>

          <Button
            variant="outline"
            onClick={() => router.push(`/customer/bookings/${bookingId}`)}
            iconLeft={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Booking Details
          </Button>
        </div>
      </div>
    );
  }

  // Payment success state
  if (paymentSuccess) {
    return (
      <div className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="neo-card-glass neo-shadow rounded-neo">
            <CardBody className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
              <h1 className="heading-2 mb-2">Payment Successful!</h1>
              <p className="text-text-secondary mb-6">
                Your payment has been processed successfully.
              </p>
              <p className="text-sm text-text-secondary">
                Redirecting you to booking details...
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/customer/bookings/${bookingId}`)}
            iconLeft={<ArrowLeft className="h-4 w-4" />}
            className="mb-4"
          >
            Back to Booking
          </Button>
          <h1 className="heading-1 mb-2">Complete Payment</h1>
          <p className="text-text-secondary">
            Review your booking details and complete your payment securely.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Booking Details */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card className="neo-card-glass neo-shadow rounded-neo">
              <CardHeader>
                <h2 className="heading-3">Booking Details</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {/* Vendor */}
                {booking?.vendor && (
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Vendor</p>
                    <p className="font-medium">{booking.vendor.businessName}</p>
                    <p className="text-sm text-text-secondary">{booking.vendor.cuisineType}</p>
                  </div>
                )}

                {/* Event Date & Time */}
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary">Event Date & Time</p>
                    <p className="font-medium">
                      {new Date(booking!.eventDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-text-secondary">{booking!.eventTime}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary">Location</p>
                    <p className="font-medium">{booking!.location}</p>
                  </div>
                </div>

                {/* Guest Count */}
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary">Guests</p>
                    <p className="font-medium">{booking!.guestCount} people</p>
                  </div>
                </div>

                {/* Event Type */}
                <div>
                  <p className="text-sm text-text-secondary mb-1">Event Type</p>
                  <p className="font-medium capitalize">{booking!.eventType.toLowerCase().replace('_', ' ')}</p>
                </div>
              </CardBody>
            </Card>

            {/* Fee Breakdown */}
            {fees && (
              <Card className="neo-card-glass neo-shadow rounded-neo">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h2 className="heading-3">Payment Breakdown</h2>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Service Amount</span>
                    <span className="font-medium">
                      ${fees.proposalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Platform Fee (5%)</span>
                    <span className="font-medium">
                      ${fees.platformFee.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total Due</span>
                      <span className="text-2xl font-bold text-primary">
                        ${fees.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Column: Payment Form */}
          <div>
            <Card className="neo-card-glass neo-shadow rounded-neo sticky top-6">
              <CardHeader>
                <h2 className="heading-3">Payment Information</h2>
              </CardHeader>
              <CardBody>
                {error && (
                  <Alert variant="error" className="mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Payment Error</strong>
                        <p className="text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  </Alert>
                )}

                <HelcimPaymentForm
                  amount={Math.round((fees?.totalAmount || 0) * 100)} // Convert to cents
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  disabled={processing || !fees}
                  buttonText={
                    processing
                      ? "Processing Payment..."
                      : fees
                      ? `Pay $${fees.totalAmount.toFixed(2)}`
                      : "Process Payment"
                  }
                />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
