"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ChevronRight,
  Search,
  Filter,
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

interface BookingSummary {
  id: string;
  vendorId: string;
  vendorName: string;
  eventDate: string;
  eventTime: string;
  location: {
    city: string;
    state: string;
  };
  guestCount: number;
  eventType: string;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
}

const STATUS_FILTERS = [
  { value: "ALL", label: "All Bookings" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export default function BookingsListPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingSummary[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    // Filter bookings based on search and status
    let filtered = bookings;

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.vendorName.toLowerCase().includes(query) ||
          b.eventType.toLowerCase().includes(query) ||
          b.location.city.toLowerCase().includes(query) ||
          b.id.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, searchQuery, statusFilter]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await res.json();
      setBookings(data);
      setFilteredBookings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load bookings"
      );
    } finally {
      setLoading(false);
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

  const groupBookingsByStatus = () => {
    const upcoming = filteredBookings.filter(
      (b) =>
        (b.status === "ACCEPTED" ||
          b.status === "CONFIRMED" ||
          b.status === "PENDING") &&
        new Date(b.eventDate) >= new Date()
    );

    const past = filteredBookings.filter(
      (b) =>
        b.status === "COMPLETED" ||
        b.status === "CANCELLED" ||
        new Date(b.eventDate) < new Date()
    );

    return { upcoming, past };
  };

  const { upcoming, past } = groupBookingsByStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="heading-1 mb-2">My Bookings</h1>
            <p className="text-text-secondary">
              View and manage all your food truck bookings
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push("/vendors")}
          >
            Book New Truck
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by vendor, event type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full pl-10"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-text-secondary mx-auto mb-4" />
                <h3 className="heading-3 mb-2">No bookings yet</h3>
                <p className="text-text-secondary mb-6">
                  Start by browsing food trucks and making your first booking
                </p>
                <Button
                  variant="primary"
                  onClick={() => router.push("/vendors")}
                >
                  Browse Food Trucks
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* No Results from Filter */}
        {!loading && bookings.length > 0 && filteredBookings.length === 0 && (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-text-secondary mx-auto mb-4" />
                <h3 className="heading-3 mb-2">No bookings found</h3>
                <p className="text-text-secondary mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Upcoming Bookings */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="heading-2 mb-4">
              Upcoming Events ({upcoming.length})
            </h2>
            <div className="space-y-4">
              {upcoming.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onClick={() => router.push(`/customer/bookings/${booking.id}`)}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {past.length > 0 && (
          <div>
            <h2 className="heading-2 mb-4">Past Events ({past.length})</h2>
            <div className="space-y-4">
              {past.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onClick={() => router.push(`/customer/bookings/${booking.id}`)}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Booking Card Component
function BookingCard({
  booking,
  onClick,
  getStatusBadgeVariant,
}: {
  booking: BookingSummary;
  onClick: () => void;
  getStatusBadgeVariant: (status: BookingStatus) => string;
}) {
  const isPast = new Date(booking.eventDate) < new Date();

  return (
    <Card
      variant="interactive"
      onClick={onClick}
      className={cn(isPast && "opacity-75")}
    >
      <CardBody>
        <div className="flex items-start justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg mb-1 truncate">
                  {booking.vendorName}
                </h3>
                <Badge variant="primary" className="text-xs">
                  {booking.eventType}
                </Badge>
              </div>
              <Badge variant={getStatusBadgeVariant(booking.status)}>
                {booking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {/* Date & Time */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-text-secondary shrink-0" />
                <div>
                  <p className="text-text-secondary">
                    {format(new Date(booking.eventDate), "MMM d, yyyy")}
                  </p>
                  <p className="text-text-secondary text-xs">
                    {booking.eventTime}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-text-secondary shrink-0" />
                <p className="text-text-secondary truncate">
                  {booking.location.city}, {booking.location.state}
                </p>
              </div>

              {/* Guest Count */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-text-secondary shrink-0" />
                <p className="text-text-secondary">{booking.guestCount} guests</p>
              </div>
            </div>

            {/* Amount */}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-text-secondary" />
                <span className="font-semibold text-primary">
                  ${booking.totalAmount.toFixed(2)}
                </span>
              </div>
              <span className="text-xs text-text-secondary">
                Booked {format(new Date(booking.createdAt), "MMM d")}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-text-secondary shrink-0 mt-1" />
        </div>
      </CardBody>
    </Card>
  );
}
