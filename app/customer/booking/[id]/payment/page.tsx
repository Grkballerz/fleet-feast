"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import {
  CreditCard,
  Shield,
  Calendar,
  MapPin,
  Users,
  DollarSign,
} from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface BookingDetails {
  id: string;
  vendorId: string;
  vendorName: string;
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
  eventType: string;
  specialRequests?: string;
  priceBreakdown: {
    basePrice: number;
    guestSurcharge: number;
    durationFee: number;
    travelFee: number;
    subtotal: number;
    platformFee: number;
    total: number;
  };
  status: string;
}

// Payment Form Component (inside Elements provider)
function PaymentForm({
  bookingId,
  clientSecret,
  booking,
}: {
  bookingId: string;
  clientSecret: string;
  booking: BookingDetails;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the terms and conditions");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setIsProcessing(false);
      } else if (
        paymentIntent?.status === "succeeded" ||
        paymentIntent?.status === "requires_capture"
      ) {
        // Payment successful, redirect to confirmation
        router.push(`/booking/${bookingId}/confirmation`);
      } else {
        setError("Payment processing failed. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <h2 className="heading-3">Order Summary</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {/* Vendor Name */}
            <div>
              <h3 className="font-semibold text-lg">{booking.vendorName}</h3>
              <Badge variant="primary">{booking.eventType}</Badge>
            </div>

            {/* Event Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-text-secondary mt-0.5" />
                <div>
                  <p className="font-medium">Event Date & Time</p>
                  <p className="text-text-secondary">
                    {new Date(booking.eventDate).toLocaleDateString()} at{" "}
                    {booking.eventTime}
                  </p>
                  <p className="text-text-secondary">
                    Duration: {booking.duration} hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-text-secondary mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  {booking.location.venueName && (
                    <p className="text-text-secondary">
                      {booking.location.venueName}
                    </p>
                  )}
                  <p className="text-text-secondary">
                    {booking.location.address}, {booking.location.city},{" "}
                    {booking.location.state} {booking.location.zipCode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-text-secondary mt-0.5" />
                <div>
                  <p className="font-medium">Guest Count</p>
                  <p className="text-text-secondary">{booking.guestCount} guests</p>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="pt-4 border-t border-border">
                <p className="font-medium text-sm mb-1">Special Requests</p>
                <p className="text-sm text-text-secondary">
                  {booking.specialRequests}
                </p>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Price</span>
                <span>${booking.priceBreakdown.basePrice.toFixed(2)}</span>
              </div>
              {booking.priceBreakdown.guestSurcharge > 0 && (
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Additional Guests</span>
                  <span>
                    +${booking.priceBreakdown.guestSurcharge.toFixed(2)}
                  </span>
                </div>
              )}
              {booking.priceBreakdown.durationFee > 0 && (
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Extended Duration</span>
                  <span>+${booking.priceBreakdown.durationFee.toFixed(2)}</span>
                </div>
              )}
              {booking.priceBreakdown.travelFee > 0 && (
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Travel Fee</span>
                  <span>+${booking.priceBreakdown.travelFee.toFixed(2)}</span>
                </div>
              )}
              <div className="divider" />
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>${booking.priceBreakdown.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Service Fee (15%)</span>
                <span>+${booking.priceBreakdown.platformFee.toFixed(2)}</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  ${booking.priceBreakdown.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="heading-3">Payment Method</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="p-4 border border-border rounded-lg bg-secondary">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#111827",
                    fontFamily: "Inter, sans-serif",
                    "::placeholder": {
                      color: "#6B7280",
                    },
                  },
                  invalid: {
                    color: "#DC2626",
                  },
                },
              }}
            />
          </div>

          <div className="mt-4 flex items-start gap-2">
            <Shield className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary">
              Your payment information is encrypted and secure. We use Stripe to
              process payments and never store your card details.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Platform Fee Disclosure */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-2">
            <DollarSign className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">About the Service Fee</p>
              <p className="text-text-secondary">
                The 15% service fee helps us maintain the platform, provide
                customer support, and ensure secure payments. Your payment will be
                held in escrow until 7 days after your event, protecting both you
                and the vendor.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardBody>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="text-sm text-text-secondary">
              I accept the{" "}
              <a
                href="/terms"
                target="_blank"
                className="text-primary hover:underline"
              >
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a
                href="/cancellation-policy"
                target="_blank"
                className="text-primary hover:underline"
              >
                Cancellation Policy
              </a>
              . I understand that payment will be held in escrow and released to
              the vendor 7 days after the event.
            </span>
          </label>
        </CardBody>
      </Card>

      {/* Error Alert */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isProcessing}
          disabled={!stripe || isProcessing || !termsAccepted}
          className="flex-1"
        >
          {isProcessing
            ? "Processing Payment..."
            : `Pay $${booking.priceBreakdown.total.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}

// Main Payment Page Component
export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError("Invalid booking ID");
      setLoading(false);
      return;
    }

    async function initPayment() {
      try {
        // Fetch booking details
        const bookingRes = await fetch(`/api/bookings/${bookingId}`);
        if (!bookingRes.ok) {
          throw new Error("Failed to fetch booking details");
        }
        const bookingData = await bookingRes.json();
        setBooking(bookingData);

        // Create payment intent
        const paymentRes = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });

        if (!paymentRes.ok) {
          throw new Error("Failed to create payment intent");
        }

        const { clientSecret } = await paymentRes.json();
        setClientSecret(clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize payment");
      } finally {
        setLoading(false);
      }
    }

    initPayment();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !booking || !clientSecret) {
    return (
      <div className="container-custom py-8">
        <Alert variant="error">
          {error || "Failed to load payment information"}
        </Alert>
        <Button
          variant="secondary"
          onClick={() => router.push("/customer/bookings")}
          className="mt-4"
        >
          View My Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-1 mb-2">Complete Your Booking</h1>
          <p className="text-text-secondary">
            Secure payment with Stripe. Your card will be charged immediately, but
            payment won't be released to the vendor until 7 days after your event.
          </p>
        </div>

        {/* Payment Form (wrapped in Stripe Elements) */}
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            bookingId={bookingId}
            clientSecret={clientSecret}
            booking={booking}
          />
        </Elements>
      </div>
    </div>
  );
}
