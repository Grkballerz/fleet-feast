"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import {
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format, parseISO, isToday } from "date-fns";
import Link from "next/link";

interface DashboardStats {
  todaysBookings: number;
  pendingRequests: number;
  monthlyRevenue: number;
  averageRating: number;
}

interface BookingSummary {
  id: string;
  eventDate: string;
  eventTime: string;
  customerName: string;
  guestCount: number;
  status: string;
  totalAmount: number;
}

interface RecentReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function VendorDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todaysBookings, setTodaysBookings] = useState<BookingSummary[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BookingSummary[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [businessName, setBusinessName] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch bookings
      const bookingsRes = await fetch("/api/bookings");
      if (!bookingsRes.ok) throw new Error("Failed to fetch bookings");
      const bookingsData = await bookingsRes.json();

      // Ensure bookings is always an array
      const bookings = Array.isArray(bookingsData.data) ? bookingsData.data : [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter today's bookings
      const todays = bookings.filter((booking: any) => {
        const eventDate = new Date(booking.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
      });

      // Filter pending requests
      const pending = bookings.filter((booking: any) => booking.status === "PENDING");

      // Calculate monthly revenue
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = bookings
        .filter((booking: any) => {
          const bookingDate = new Date(booking.createdAt);
          return (
            bookingDate.getMonth() === currentMonth &&
            bookingDate.getFullYear() === currentYear &&
            (booking.status === "ACCEPTED" || booking.status === "COMPLETED")
          );
        })
        .reduce((sum: number, booking: any) => sum + (booking.totalAmount || 0), 0);

      // Fetch vendor profile for rating
      const profileRes = await fetch("/api/vendor/profile");
      const profileData = profileRes.ok ? await profileRes.json() : null;
      const vendorProfile = profileData?.data?.profile || profileData?.data;
      const avgRating = vendorProfile?.averageRating || 0;
      if (vendorProfile?.businessName) {
        setBusinessName(vendorProfile.businessName);
      }

      // Fetch recent reviews
      if (vendorProfile?.id) {
        const reviewsRes = await fetch(`/api/reviews/vendor/${vendorProfile.id}?limit=3`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setRecentReviews(reviewsData.data?.items || []);
        }
      }

      setStats({
        todaysBookings: todays.length,
        pendingRequests: pending.length,
        monthlyRevenue,
        averageRating: avgRating,
      });

      setTodaysBookings(todays.slice(0, 5));
      setPendingRequests(pending.slice(0, 5));
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "success" | "warning" | "error" | "neutral", label: string }> = {
      PENDING: { variant: "warning", label: "Pending" },
      ACCEPTED: { variant: "success", label: "Accepted" },
      CANCELLED: { variant: "error", label: "Cancelled" },
      COMPLETED: { variant: "neutral", label: "Completed" },
    };
    const config = statusConfig[status] || { variant: "neutral", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary neo-heading">
          Welcome back, {businessName || session?.user?.name || "Vendor"}!
        </h2>
        <p className="text-text-secondary mt-1">
          Here's what's happening with your food truck today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neo-card-glass neo-shadow rounded-neo p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Today's Bookings</p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {stats?.todaysBookings || 0}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-neo">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="neo-card-glass neo-shadow rounded-neo p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Pending Requests</p>
              <p className="text-3xl font-bold text-warning mt-2">
                {stats?.pendingRequests || 0}
              </p>
            </div>
            <div className="p-3 bg-warning/10 rounded-neo">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="neo-card-glass neo-shadow rounded-neo p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Revenue This Month</p>
              <p className="text-3xl font-bold text-success mt-2">
                ${((stats?.monthlyRevenue || 0) / 100).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-success/10 rounded-neo">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="neo-card-glass neo-shadow rounded-neo p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Average Rating</p>
              <p className="text-3xl font-bold text-primary mt-2">
                {stats?.averageRating?.toFixed(1) || "0.0"}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-neo">
              <Star className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="neo-card-glass neo-shadow rounded-neo p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary neo-heading">
              Pending Requests
            </h3>
            <Link href="/vendor/bookings?status=PENDING">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((booking) => (
              <div
                key={booking.id}
                className="p-4 neo-border rounded-neo hover:bg-background-hover transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      <span className="font-medium text-text-primary">
                        {booking.customerName}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="mt-2 text-sm text-text-secondary space-y-1">
                      <p>
                        {format(parseISO(booking.eventDate), "MMM dd, yyyy")} at{" "}
                        {booking.eventTime}
                      </p>
                      <p>{booking.guestCount} guests</p>
                      <p className="font-medium text-text-primary">
                        ${(booking.totalAmount / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/vendor/bookings?id=${booking.id}`}>
                      <Button size="sm">Review</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Bookings */}
        <div className="neo-card-glass neo-shadow rounded-neo p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary neo-heading">
              Today's Schedule
            </h3>
            <Link href="/vendor/calendar">
              <Button variant="ghost" size="sm">
                View Calendar
              </Button>
            </Link>
          </div>
          {todaysBookings.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-text-tertiary" />
              <p>No bookings scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-3 neo-border rounded-neo"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-text-primary">
                        {booking.eventTime} - {booking.customerName}
                      </p>
                      <p className="text-sm text-text-secondary mt-1">
                        {booking.guestCount} guests • $
                        {(booking.totalAmount / 100).toFixed(2)}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="neo-card-glass neo-shadow rounded-neo p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary neo-heading">
              Recent Reviews
            </h3>
            <Link href="/vendor/reviews">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          {recentReviews.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Star className="w-12 h-12 mx-auto mb-3 text-text-tertiary" />
              <p>No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="pb-4 border-b last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-text-primary">
                        {review.customerName}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-warning text-warning"
                                : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-text-secondary">
                      {format(parseISO(review.createdAt), "MMM dd")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-text-secondary">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="neo-card-glass neo-shadow rounded-neo p-6">
        <h3 className="text-lg font-semibold text-text-primary neo-heading mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/vendor/bookings">
            <Button variant="secondary" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Manage Bookings
            </Button>
          </Link>
          <Link href="/vendor/calendar">
            <Button variant="secondary" className="w-full justify-start">
              <Clock className="w-4 h-4 mr-2" />
              Update Calendar
            </Button>
          </Link>
          <Link href="/vendor/profile">
            <Button variant="secondary" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
          <Link href="/vendor/analytics">
            <Button variant="secondary" className="w-full justify-start">
              <Star className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
