"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Phone,
  Mail,
  MessageCircle,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "DISPUTED";

interface BookingDetails {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone?: string;
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
  status: BookingStatus;
  createdAt: string;
  acceptedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  cancellationPolicy?: {
    refundPercentage: number;
    penalty: number;
  };
}

const STATUS_STEPS = [
  {
    status: "PENDING" as const,
    label: "Request Sent",
    description: "Awaiting vendor response",
    icon: Clock,
  },
  {
    status: "ACCEPTED" as const,
    label: "Accepted",
    description: "Vendor accepted your request",
    icon: CheckCircle,
  },
  {
    status: "CONFIRMED" as const,
    label: "Confirmed",
    description: "Payment received and confirmed",
    icon: CheckCircle,
  },
  {
    status: "COMPLETED" as const,
    label: "Completed",
    description: "Event finished successfully",
    icon: CheckCircle,
  },
];

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError("Invalid booking ID");
      setLoading(false);
      return;
    }

    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch booking details");
      }
      const data = await res.json();
      setBooking(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load booking details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to cancel booking");
      }

      // Refresh booking data
      await fetchBooking();
      setShowCancelModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "ACCEPTED":
      case "CONFIRMED":
        return "success";
      case "COMPLETED":
        return "neutral";
      case "CANCELLED":
      case "DISPUTED":
        return "error";
      default:
        return "neutral";
    }
  };

  const getCurrentStatusIndex = (status: BookingStatus) => {
    if (status === "CANCELLED" || status === "DISPUTED") return -1;
    return STATUS_STEPS.findIndex((step) => step.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container-custom py-8">
        <Alert variant="error">{error || "Booking not found"}</Alert>
        <Button
          variant="secondary"
          onClick={() => router.push("/customer/bookings")}
          className="mt-4"
        >
          Back to My Bookings
        </Button>
      </div>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex(booking.status);
  const canCancel =
    booking.status === "PENDING" || booking.status === "ACCEPTED";

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="heading-1 mb-2">Booking Details</h1>
            <p className="text-text-secondary">
              Reference: #{bookingId.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <Badge variant={getStatusBadgeVariant(booking.status)}>
            {booking.status}
          </Badge>
        </div>

        {/* Status Timeline */}
        {currentStatusIndex >= 0 && (
          <Card className="neo-card-glass mb-6 neo-shadow rounded-neo">
            <CardHeader>
              <h2 className="heading-3">Booking Status</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.status} className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          isCompleted
                            ? "bg-success text-white"
                            : "bg-gray-200 text-gray-400"
                        )}
                      >
                        {isCompleted ? (
                          <Icon className="h-5 w-5" />
                        ) : (
                          <span className="font-semibold">{index + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6 border-b border-border last:border-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4
                              className={cn(
                                "font-semibold mb-1",
                                isCurrent && "text-primary"
                              )}
                            >
                              {step.label}
                            </h4>
                            <p className="text-sm text-text-secondary">
                              {step.description}
                            </p>
                          </div>
                          {isCompleted && step.status === "ACCEPTED" && booking.acceptedAt && (
                            <p className="text-xs text-text-secondary">
                              {format(new Date(booking.acceptedAt), "MMM d, h:mm a")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Cancelled/Disputed Status */}
        {(booking.status === "CANCELLED" || booking.status === "DISPUTED") && (
          <Alert
            variant={booking.status === "CANCELLED" ? "warning" : "error"}
            className="mb-6"
          >
            <p className="font-semibold mb-1">
              {booking.status === "CANCELLED"
                ? "Booking Cancelled"
                : "Booking Disputed"}
            </p>
            <p className="text-sm">
              {booking.status === "CANCELLED"
                ? "This booking has been cancelled. If you were charged, you should receive a refund according to the cancellation policy."
                : "This booking is under dispute. Our support team will contact you shortly."}
            </p>
          </Alert>
        )}

        {/* Event Details */}
        <Card className="neo-card-glass mb-6 neo-shadow rounded-neo">
          <CardHeader>
            <h2 className="heading-3">Event Information</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Vendor */}
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {booking.vendorName}
                </h3>
                <Badge variant="primary">{booking.eventType}</Badge>
              </div>

              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-text-secondary">
                    {format(new Date(booking.eventDate), "MMMM d, yyyy")} at{" "}
                    {booking.eventTime}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Duration: {booking.duration} hours
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  {booking.location.venueName && (
                    <p className="text-text-secondary">
                      {booking.location.venueName}
                    </p>
                  )}
                  <p className="text-text-secondary">
                    {booking.location.address}
                    <br />
                    {booking.location.city}, {booking.location.state}{" "}
                    {booking.location.zipCode}
                  </p>
                </div>
              </div>

              {/* Guest Count */}
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Guest Count</p>
                  <p className="text-text-secondary">
                    {booking.guestCount} guests
                  </p>
                </div>
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="pt-4 border-t border-border">
                  <p className="font-medium mb-2">Special Requests</p>
                  <p className="text-sm text-text-secondary">
                    {booking.specialRequests}
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Vendor Contact (only if accepted) */}
        {(booking.status === "ACCEPTED" ||
          booking.status === "CONFIRMED" ||
          booking.status === "COMPLETED") && (
          <Card className="neo-card-glass mb-6 neo-shadow rounded-neo">
            <CardHeader>
              <h2 className="heading-3">Vendor Contact</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-text-secondary" />
                  <a
                    href={`mailto:${booking.vendorEmail}`}
                    className="text-primary hover:underline"
                  >
                    {booking.vendorEmail}
                  </a>
                </div>
                {booking.vendorPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-text-secondary" />
                    <a
                      href={`tel:${booking.vendorPhone}`}
                      className="text-primary hover:underline"
                    >
                      {booking.vendorPhone}
                    </a>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/messages?booking=${bookingId}`)
                  }
                  iconLeft={<MessageCircle className="h-4 w-4" />}
                  className="w-full"
                >
                  Send Message
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Price Breakdown */}
        <Card className="neo-card-glass mb-6 neo-shadow rounded-neo">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h2 className="heading-3">Payment Details</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
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
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={() => router.push("/customer/bookings")}
            className="flex-1"
          >
            Back to Bookings
          </Button>
          {canCancel && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelModal(true)}
              iconLeft={<XCircle className="h-4 w-4" />}
              className="flex-1"
            >
              Cancel Booking
            </Button>
          )}
        </div>

        {/* Cancellation Policy Info */}
        {canCancel && booking.cancellationPolicy && (
          <Alert variant="info" className="mt-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Cancellation Policy</p>
                <p className="text-sm">
                  If you cancel now, you'll receive a{" "}
                  {booking.cancellationPolicy.refundPercentage}% refund
                  {booking.cancellationPolicy.penalty > 0 &&
                    ` minus a $${booking.cancellationPolicy.penalty} cancellation fee`}
                  .
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Cancel Booking Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Booking"
        >
          <div className="space-y-4">
            <p>
              Are you sure you want to cancel this booking? This action cannot be
              undone.
            </p>

            {booking.cancellationPolicy && (
              <Alert variant="warning">
                <p className="font-semibold mb-1">Refund Information</p>
                <p className="text-sm">
                  You will receive a {booking.cancellationPolicy.refundPercentage}
                  % refund
                  {booking.cancellationPolicy.penalty > 0 &&
                    ` (${booking.priceBreakdown.total * (booking.cancellationPolicy.refundPercentage / 100)} minus $${booking.cancellationPolicy.penalty} cancellation fee)`}
                  .
                </p>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1"
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelBooking}
                loading={cancelling}
                disabled={cancelling}
                className="flex-1"
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
