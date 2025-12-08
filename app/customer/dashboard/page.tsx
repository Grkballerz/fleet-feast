"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import {
  Calendar,
  MessageSquare,
  Heart,
  Star,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { BookingStatus } from "@/types";

// Mock data - replace with real API calls
const MOCK_STATS = {
  totalBookings: 12,
  upcomingBookings: 3,
  favoriteVendors: 5,
  pendingReviews: 2,
};

const MOCK_UPCOMING_BOOKINGS = [
  {
    id: "1",
    vendorName: "Taco Fiesta",
    eventDate: new Date("2025-12-15T14:00:00"),
    eventType: "Corporate Event",
    status: BookingStatus.ACCEPTED,
    totalAmount: 450,
  },
  {
    id: "2",
    vendorName: "Pizza Paradise",
    eventDate: new Date("2025-12-20T18:00:00"),
    eventType: "Birthday Party",
    status: BookingStatus.PENDING,
    totalAmount: 320,
  },
  {
    id: "3",
    vendorName: "BBQ Bros",
    eventDate: new Date("2025-12-28T12:00:00"),
    eventType: "Wedding",
    status: BookingStatus.ACCEPTED,
    totalAmount: 1200,
  },
];

const MOCK_RECENT_MESSAGES = [
  {
    id: "1",
    bookingId: "1",
    vendorName: "Taco Fiesta",
    lastMessage: "Thanks! See you on the 15th!",
    timestamp: new Date("2025-12-05T10:30:00"),
    unreadCount: 0,
  },
  {
    id: "2",
    bookingId: "2",
    vendorName: "Pizza Paradise",
    lastMessage: "I'd be happy to accommodate your dietary needs.",
    timestamp: new Date("2025-12-04T16:20:00"),
    unreadCount: 2,
  },
];

const MOCK_ACTION_ITEMS = [
  {
    id: "1",
    type: "review",
    title: "Review BBQ Bros",
    description: "Share your experience from your Nov 28 event",
    priority: "medium",
    link: "/dashboard/reviews",
  },
  {
    id: "2",
    type: "confirmation",
    title: "Confirm Pizza Paradise Booking",
    description: "Booking pending - awaiting vendor confirmation",
    priority: "high",
    link: "/bookings/2",
  },
];

/**
 * Dashboard Overview Page
 *
 * Customer dashboard with stats, upcoming bookings, messages preview, and action items
 */
export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error loading dashboard">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-1">
          Welcome back! Here's what's happening with your bookings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="neo-card-glass p-6 neo-shadow hover:neo-shadow-lg transition-all rounded-neo">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">
                Total Bookings
              </p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {MOCK_STATS.totalBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>3 this month</span>
          </div>
        </Card>

        <Card className="neo-card-glass p-6 neo-shadow hover:neo-shadow-lg transition-all rounded-neo">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">
                Upcoming Events
              </p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {MOCK_STATS.upcomingBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
          <Link
            href="/customer/bookings"
            className="mt-4 text-sm text-primary hover:underline inline-flex items-center"
          >
            View all bookings
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Card>

        <Card className="neo-card-glass p-6 neo-shadow hover:neo-shadow-lg transition-all rounded-neo">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">
                Favorite Vendors
              </p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {MOCK_STATS.favoriteVendors}
              </p>
            </div>
            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-error" />
            </div>
          </div>
          <Link
            href="/customer/dashboard/favorites"
            className="mt-4 text-sm text-primary hover:underline inline-flex items-center"
          >
            View favorites
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Card>

        <Card className="neo-card-glass p-6 neo-shadow hover:neo-shadow-lg transition-all rounded-neo">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">
                Pending Reviews
              </p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {MOCK_STATS.pendingReviews}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-warning" />
            </div>
          </div>
          <Link
            href="/customer/dashboard/reviews"
            className="mt-4 text-sm text-primary hover:underline inline-flex items-center"
          >
            Write reviews
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings (2 columns on desktop) */}
        <Card className="neo-card-glass lg:col-span-2 p-6 neo-shadow rounded-neo">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Upcoming Bookings
            </h2>
            <Link href="/customer/bookings">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {MOCK_UPCOMING_BOOKINGS.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary mb-4">No upcoming bookings</p>
              <Link href="/search">
                <Button>Browse Food Trucks</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {MOCK_UPCOMING_BOOKINGS.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => router.push(`/customer/bookings/${booking.id}`)}
                  className="flex items-center justify-between p-4 neo-border rounded-neo neo-shadow hover:neo-shadow-lg cursor-pointer transition-all bg-white"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-text-primary">
                        {booking.vendorName}
                      </h3>
                      <Badge
                        variant={
                          booking.status === BookingStatus.ACCEPTED
                            ? "success"
                            : booking.status === BookingStatus.PENDING
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(booking.eventDate, "MMM dd, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(booking.eventDate, "h:mm a")}
                      </span>
                      <span className="hidden sm:inline">{booking.eventType}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-text-primary">
                      ${booking.totalAmount}
                    </p>
                    <ChevronRight className="w-5 h-5 text-text-tertiary ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Action Items (1 column on desktop) */}
        <Card className="neo-card-glass p-6 neo-shadow rounded-neo">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            Action Items
          </h2>

          {MOCK_ACTION_ITEMS.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-text-secondary">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {MOCK_ACTION_ITEMS.map((item) => (
                <Link key={item.id} href={item.link}>
                  <div className="p-4 neo-border rounded-neo neo-shadow hover:neo-shadow-lg cursor-pointer transition-all bg-white">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.priority === "high"
                            ? "bg-error/10"
                            : "bg-warning/10"
                        }`}
                      >
                        {item.type === "review" ? (
                          <Star
                            className={`w-5 h-5 ${
                              item.priority === "high"
                                ? "text-error"
                                : "text-warning"
                            }`}
                          />
                        ) : (
                          <AlertCircle
                            className={`w-5 h-5 ${
                              item.priority === "high"
                                ? "text-error"
                                : "text-warning"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-tertiary flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Messages */}
      <Card className="neo-card-glass p-6 neo-shadow rounded-neo">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Recent Messages
          </h2>
          <Link href="/customer/messages">
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {MOCK_RECENT_MESSAGES.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {MOCK_RECENT_MESSAGES.map((message) => (
              <Link key={message.id} href={`/messages/${message.bookingId}`}>
                <div className="flex items-center justify-between p-4 neo-border rounded-neo neo-shadow hover:neo-shadow-lg cursor-pointer transition-all bg-white">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-text-primary truncate">
                          {message.vendorName}
                        </h3>
                        {message.unreadCount > 0 && (
                          <Badge variant="error" size="sm">
                            {message.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary truncate">
                        {message.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className="text-xs text-text-tertiary">
                      {format(message.timestamp, "MMM dd")}
                    </span>
                    <ChevronRight className="w-5 h-5 text-text-tertiary" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="neo-card-glass p-6 neo-shadow rounded-neo">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/search">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Book Event
            </Button>
          </Link>
          <Link href="/customer/dashboard/favorites">
            <Button variant="outline" className="w-full justify-start">
              <Heart className="w-4 h-4 mr-2" />
              Favorites
            </Button>
          </Link>
          <Link href="/customer/dashboard/payments">
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </Button>
          </Link>
          <Link href="/customer/dashboard/settings">
            <Button variant="outline" className="w-full justify-start">
              <Star className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
