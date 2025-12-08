"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle,
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Printer,
  Download,
  MessageCircle,
} from "lucide-react";
import { format, addHours } from "date-fns";

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
    total: number;
  };
  status: string;
  createdAt: string;
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError("Invalid booking ID");
      setLoading(false);
      return;
    }

    async function fetchBooking() {
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
    }

    fetchBooking();
  }, [bookingId]);

  // Generate calendar event data
  const generateCalendarLinks = () => {
    if (!booking) return { googleUrl: "", icsUrl: "" };

    const eventStart = new Date(`${booking.eventDate}T${booking.eventTime}`);
    const eventEnd = addHours(eventStart, booking.duration);

    const title = `Food Truck Event - ${booking.vendorName}`;
    const location = booking.location.venueName
      ? `${booking.location.venueName}, ${booking.location.address}, ${booking.location.city}, ${booking.location.state}`
      : `${booking.location.address}, ${booking.location.city}, ${booking.location.state}`;
    const description = `Booking #${booking.id}\n\nGuest Count: ${booking.guestCount}\nEvent Type: ${booking.eventType}`;

    // Google Calendar URL
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${format(eventStart, "yyyyMMdd'T'HHmmss")}/${format(
      eventEnd,
      "yyyyMMdd'T'HHmmss"
    )}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(
      location
    )}`;

    // ICS content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${format(eventStart, "yyyyMMdd'T'HHmmss")}
DTEND:${format(eventEnd, "yyyyMMdd'T'HHmmss")}
SUMMARY:${title}
DESCRIPTION:${description.replace(/\n/g, "\\n")}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

    const icsUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(
      icsContent
    )}`;

    return { googleUrl, icsUrl };
  };

  const { googleUrl, icsUrl } = generateCalendarLinks();

  // Copy booking ID to clipboard
  const copyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print page
  const handlePrint = () => {
    window.print();
  };

  // Share booking (if Web Share API is available)
  const handleShare = async () => {
    if (navigator.share && booking) {
      try {
        await navigator.share({
          title: `Booking Confirmation - ${booking.vendorName}`,
          text: `My food truck booking for ${format(
            new Date(booking.eventDate),
            "MMMM d, yyyy"
          )}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share not available
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
        <Alert variant="error">
          {error || "Booking not found"}
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
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="heading-1 mb-2">Booking Confirmed!</h1>
          <p className="text-text-secondary">
            Your booking request has been sent to {booking.vendorName}
          </p>
        </div>

        {/* Booking ID Card */}
        <Card className="neo-card-glass mb-6 neo-shadow rounded-neo">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">
                  Booking Reference
                </p>
                <p className="font-mono font-semibold text-lg">
                  #{bookingId.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyBookingId}
              >
                {copied ? "Copied!" : "Copy ID"}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Next Steps */}
        <Card className="neo-card-glass mb-6 neo-shadow rounded-neo">
          <CardHeader>
            <h2 className="heading-3">What Happens Next?</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Vendor Review</h3>
                  <p className="text-sm text-text-secondary">
                    {booking.vendorName} will review your booking request and
                    respond within 48 hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Confirmation</h3>
                  <p className="text-sm text-text-secondary">
                    Once the vendor accepts, you'll receive an email confirmation
                    and can coordinate details via in-app messaging.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Event Day</h3>
                  <p className="text-sm text-text-secondary">
                    Your payment is held in escrow and will be released to the
                    vendor 7 days after your event, giving you time to report any
                    issues.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Event Details */}
        <Card className="neo-card-glass mb-6 neo-shadow rounded-neo">
          <CardHeader>
            <h2 className="heading-3">Event Details</h2>
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
                  <p className="text-text-secondary">{booking.guestCount} guests</p>
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

              {/* Total Amount */}
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="font-semibold text-lg">Total Paid</span>
                <span className="text-2xl font-bold text-primary">
                  ${booking.priceBreakdown.total.toFixed(2)}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Add to Calendar */}
        <Card className="neo-card-glass mb-6 neo-shadow rounded-neo">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="heading-3">Add to Calendar</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(googleUrl, "_blank")}
                iconLeft={<Calendar className="h-4 w-4" />}
              >
                Google Calendar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = icsUrl;
                  link.download = `booking-${bookingId}.ics`;
                  link.click();
                }}
                iconLeft={<Download className="h-4 w-4" />}
              >
                Download ICS
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            iconLeft={<Share2 className="h-4 w-4" />}
          >
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            iconLeft={<Printer className="h-4 w-4" />}
          >
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/customer/bookings/${bookingId}`)}
            iconLeft={<Clock className="h-4 w-4" />}
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/messages?booking=${bookingId}`)}
            iconLeft={<MessageCircle className="h-4 w-4" />}
          >
            Message
          </Button>
        </div>

        {/* Primary Actions */}
        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={() => router.push("/vendors")}
            className="flex-1"
          >
            Book Another Truck
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push("/customer/bookings")}
            className="flex-1"
          >
            View All Bookings
          </Button>
        </div>

        {/* Important Notice */}
        <Alert variant="info" className="mt-6">
          <p className="font-semibold mb-1">Important Reminder</p>
          <p className="text-sm">
            The vendor has 48 hours to respond to your booking request. You'll
            receive an email notification once they accept or decline. Check your
            booking status anytime in the "My Bookings" section.
          </p>
        </Alert>
      </div>
    </div>
  );
}
