"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
  isToday,
  isBefore,
  startOfToday,
} from "date-fns";

interface DayAvailability {
  date: string;
  available: boolean;
  bookings: number;
}

export default function VendorCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Map<string, DayAvailability>>(new Map());
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch availability
      const availRes = await fetch("/api/vendor/availability");
      if (availRes.ok) {
        const availData = await availRes.json();
        const availMap = new Map<string, DayAvailability>();
        (availData.data || []).forEach((item: any) => {
          availMap.set(item.date, {
            date: item.date,
            available: item.available,
            bookings: 0,
          });
        });
        setAvailability(availMap);
      }

      // Fetch bookings
      const bookingsRes = await fetch("/api/bookings");
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const bookingsList = bookingsData.data || [];
        setBookings(bookingsList);

        // Count bookings per date
        const availMapCopy = new Map(availMap);
        bookingsList.forEach((booking: any) => {
          const dateStr = format(parseISO(booking.eventDate), "yyyy-MM-dd");
          const existing = availMapCopy.get(dateStr);
          if (existing) {
            availMapCopy.set(dateStr, {
              ...existing,
              bookings: existing.bookings + 1,
            });
          } else {
            availMapCopy.set(dateStr, {
              date: dateStr,
              available: false,
              bookings: 1,
            });
          }
        });
        setAvailability(availMapCopy);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  const toggleDayAvailability = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const existing = availability.get(dateStr);
    const newAvailable = !existing?.available;

    // Optimistic update
    const newAvailability = new Map(availability);
    newAvailability.set(dateStr, {
      date: dateStr,
      available: newAvailable,
      bookings: existing?.bookings || 0,
    });
    setAvailability(newAvailability);

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const res = await fetch("/api/vendor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates: [{ date: dateStr, available: newAvailable }],
        }),
      });

      if (!res.ok) throw new Error("Failed to update availability");

      setSuccessMessage("Availability updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Revert on error
      setAvailability(availability);
      setError(err.message || "Failed to update availability");
    } finally {
      setSaving(false);
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const dateStr = format(currentDay, "yyyy-MM-dd");
        const dayData = availability.get(dateStr);
        const isCurrentMonth = isSameMonth(currentDay, monthStart);
        const isPast = isBefore(currentDay, startOfToday());
        const isAvailable = dayData?.available || false;
        const bookingCount = dayData?.bookings || 0;

        days.push(
          <div
            key={dateStr}
            className={`
              min-h-[100px] sm:min-h-[120px] border border-border p-2
              ${isCurrentMonth ? "bg-white" : "bg-background"}
              ${isPast ? "opacity-50" : "cursor-pointer hover:bg-background-hover"}
              ${isToday(currentDay) ? "ring-2 ring-primary" : ""}
            `}
            onClick={() => !isPast && toggleDayAvailability(currentDay)}
          >
            <div className="flex items-start justify-between mb-2">
              <span
                className={`
                text-sm font-medium
                ${isToday(currentDay) ? "text-primary font-bold" : ""}
                ${!isCurrentMonth ? "text-text-tertiary" : "text-text-primary"}
              `}
              >
                {format(currentDay, "d")}
              </span>
              {!isPast && isCurrentMonth && (
                <div>
                  {isAvailable ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error" />
                  )}
                </div>
              )}
            </div>

            {bookingCount > 0 && (
              <div className="space-y-1">
                <Badge variant="primary" size="sm">
                  {bookingCount} booking{bookingCount > 1 ? "s" : ""}
                </Badge>
              </div>
            )}

            {!isPast && isCurrentMonth && (
              <div className="mt-2 text-xs text-text-secondary">
                {isAvailable ? "Available" : "Blocked"}
              </div>
            )}
          </div>
        );

        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Availability Calendar</h2>
        <p className="text-text-secondary mt-1">
          Manage your availability and view upcoming bookings
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" title="Success">
          {successMessage}
        </Alert>
      )}

      {/* Instructions */}
      <Alert variant="info" title="How to use">
        Click on any future date to toggle availability. Available dates are marked with a green
        checkmark, blocked dates with a red X. Dates with bookings cannot be unmarked as
        unavailable.
      </Alert>

      {/* Calendar */}
      <Card>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-text-primary">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-text-secondary py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {renderCalendar()}
      </Card>

      {/* Legend */}
      <Card className="card-compact">
        <h4 className="font-medium text-text-primary mb-3">Legend</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm text-text-secondary">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-error" />
            <span className="text-sm text-text-secondary">Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full ring-2 ring-primary" />
            <span className="text-sm text-text-secondary">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              1
            </Badge>
            <span className="text-sm text-text-secondary">Has Booking</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
