"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface Booking {
  id: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventType: string;
  guestCount: number;
  status: string;
  totalAmount: number;
  specialRequests?: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}

type StatusFilter = "ALL" | "PENDING" | "ACCEPTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchQuery, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");

      const data = await res.json();
      setBookings(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Ensure bookings is an array before filtering
    const safeBookingsArr = Array.isArray(bookings) ? bookings : [];
    let filtered = [...safeBookingsArr];

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.customer?.name?.toLowerCase().includes(query) ||
          b.eventType?.toLowerCase().includes(query) ||
          b.eventLocation?.toLowerCase().includes(query) ||
          b.id?.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error("Failed to accept booking");

      await fetchBookings();
      setShowDetailsModal(false);
      setSelectedBooking(null);
    } catch (err: any) {
      alert(err.message || "Failed to accept booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to decline this booking request?")) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/bookings/${bookingId}/decline`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error("Failed to decline booking");

      await fetchBookings();
      setShowDetailsModal(false);
      setSelectedBooking(null);
    } catch (err: any) {
      alert(err.message || "Failed to decline booking");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "success" | "warning" | "error" | "neutral", label: string }> = {
      PENDING: { variant: "warning", label: "Pending" },
      ACCEPTED: { variant: "success", label: "Accepted" },
      CONFIRMED: { variant: "success", label: "Confirmed" },
      COMPLETED: { variant: "neutral", label: "Completed" },
      CANCELLED: { variant: "error", label: "Cancelled" },
    };
    const { variant, label } = config[status] || { variant: "neutral", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Ensure bookings is always an array for filter operations
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const statusCounts = {
    ALL: safeBookings.length,
    PENDING: safeBookings.filter((b) => b.status === "PENDING").length,
    ACCEPTED: safeBookings.filter((b) => b.status === "ACCEPTED").length,
    CONFIRMED: safeBookings.filter((b) => b.status === "CONFIRMED").length,
    COMPLETED: safeBookings.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: safeBookings.filter((b) => b.status === "CANCELLED").length,
  };

  if (loading) {
    return (
      <DashboardLayout title="Manage Bookings">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Manage Bookings">
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Bookings">
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary neo-heading">Manage Bookings</h2>
        <p className="text-text-secondary mt-1">
          Review and manage your booking requests and confirmed events
        </p>
      </div>

      {/* Search and Filter */}
      <div className="neo-card-glass neo-shadow rounded-neo p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by customer, event type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {(["ALL", "PENDING", "ACCEPTED", "CONFIRMED", "COMPLETED", "CANCELLED"] as StatusFilter[]).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "primary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="whitespace-nowrap"
          >
            {status} ({statusCounts[status]})
          </Button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="neo-card-glass neo-shadow rounded-neo p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {searchQuery || statusFilter !== "ALL"
              ? "No bookings found"
              : "No bookings yet"}
          </h3>
          <p className="text-text-secondary mb-4">
            {searchQuery || statusFilter !== "ALL"
              ? "Try adjusting your filters"
              : "When customers book your truck, they'll appear here"}
          </p>
          {(searchQuery || statusFilter !== "ALL") && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="neo-card-glass neo-shadow rounded-neo p-4 cursor-pointer hover:neo-shadow-lg transition-all"
              onClick={() => {
                setSelectedBooking(booking);
                setShowDetailsModal(true);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-text-primary truncate">
                          {booking.customer.name}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="space-y-2 text-sm text-text-secondary">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {format(parseISO(booking.eventDate), "MMM dd, yyyy")} at{" "}
                            {booking.eventTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{booking.eventLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 flex-shrink-0" />
                          <span>{booking.guestCount} guests</span>
                          <span className="mx-2">•</span>
                          <span className="font-medium text-text-primary">
                            ${(booking.totalAmount / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-tertiary flex-shrink-0 ml-4" />
              </div>

              {/* Quick Actions for Pending */}
              {booking.status === "PENDING" && (
                <div
                  className="mt-4 pt-4 border-t border-border flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAcceptBooking(booking.id)}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDeclineBooking(booking.id)}
                    disabled={actionLoading}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
          title="Booking Details"
        >
          <div className="space-y-4">
            {/* Status */}
            <div>
              <label className="text-sm font-medium text-text-secondary">Status</label>
              <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
            </div>

            {/* Customer Info */}
            <div>
              <label className="text-sm font-medium text-text-secondary">Customer</label>
              <div className="mt-1">
                <p className="text-text-primary font-medium">{selectedBooking.customer.name}</p>
                <p className="text-sm text-text-secondary">{selectedBooking.customer.email}</p>
              </div>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">Event Date</label>
                <p className="mt-1 text-text-primary">
                  {format(parseISO(selectedBooking.eventDate), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Event Time</label>
                <p className="mt-1 text-text-primary">{selectedBooking.eventTime}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary">Event Type</label>
              <p className="mt-1 text-text-primary">{selectedBooking.eventType}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary">Location</label>
              <p className="mt-1 text-text-primary">{selectedBooking.eventLocation}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary">Guest Count</label>
              <p className="mt-1 text-text-primary">{selectedBooking.guestCount} guests</p>
            </div>

            {selectedBooking.specialRequests && (
              <div>
                <label className="text-sm font-medium text-text-secondary">Special Requests</label>
                <p className="mt-1 text-text-primary">{selectedBooking.specialRequests}</p>
              </div>
            )}

            {/* Pricing */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-text-secondary">Total Amount</label>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                ${(selectedBooking.totalAmount / 100).toFixed(2)}
              </p>
            </div>

            {/* Actions */}
            {selectedBooking.status === "PENDING" && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleAcceptBooking(selectedBooking.id)}
                  disabled={actionLoading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Booking
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleDeclineBooking(selectedBooking.id)}
                  disabled={actionLoading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
    </DashboardLayout>
  );
}
