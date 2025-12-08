"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface AvailabilityEntry {
  date: string; // ISO date string (YYYY-MM-DD)
  isAvailable: boolean;
  notes?: string;
}

export interface AvailabilityCalendarProps {
  vendorId: string;
  availability: AvailabilityEntry[];
  onDateSelect?: (date: string) => void;
  className?: string;
}

/**
 * Get days in a month
 */
const getDaysInMonth = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Add empty slots for days before the first day of the month
  const firstDayOfWeek = firstDay.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(new Date(year, month, -firstDayOfWeek + i + 1));
  }

  // Add all days in the month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  return days;
};

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
const formatDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Check if a date is in the past
 */
const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * AvailabilityCalendar Component
 *
 * Monthly calendar view showing available and blocked dates for a food truck.
 * Allows users to select a date to start the booking process.
 *
 * @example
 * ```tsx
 * <AvailabilityCalendar
 *   vendorId={vendorId}
 *   availability={availabilityData}
 *   onDateSelect={(date) => router.push(`/booking?vendorId=${vendorId}&date=${date}`)}
 * />
 * ```
 */
export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  vendorId,
  availability,
  onDateSelect,
  className,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = getDaysInMonth(year, month);

  // Create a lookup map for availability
  const availabilityMap = new Map<string, AvailabilityEntry>();
  availability.forEach((entry) => {
    availabilityMap.set(entry.date, entry);
  });

  // Get day status
  const getDayStatus = (date: Date): "available" | "blocked" | "past" | "other-month" => {
    // Check if date is in current month
    if (date.getMonth() !== month) {
      return "other-month";
    }

    // Check if date is in the past
    if (isPastDate(date)) {
      return "past";
    }

    // Check availability
    const dateStr = formatDateISO(date);
    const entry = availabilityMap.get(dateStr);

    if (entry) {
      return entry.isAvailable ? "available" : "blocked";
    }

    // Default to blocked if no availability data
    return "blocked";
  };

  // Navigate to previous month
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    const status = getDayStatus(date);
    if (status === "available" && onDateSelect) {
      const dateStr = formatDateISO(date);
      onDateSelect(dateStr);
    }
  };

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="neo-heading text-2xl">Availability</h2>

      <div className="neo-card-glass rounded-neo neo-shadow p-4 md:p-6">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePrevMonth}
            className="flex items-center gap-1 px-3 py-2 rounded-neo neo-border font-bold hover:neo-shadow transition-all bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <h3 className="text-lg font-black">
            {monthNames[month]} {year}
          </h3>

          <button
            onClick={handleNextMonth}
            className="flex items-center gap-1 px-3 py-2 rounded-neo neo-border font-bold hover:neo-shadow transition-all bg-white"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs md:text-sm font-bold text-text-primary py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((date, idx) => {
            const status = getDayStatus(date);
            const dateStr = formatDateISO(date);
            const entry = availabilityMap.get(dateStr);
            const isClickable = status === "available" && onDateSelect;

            return (
              <button
                key={idx}
                onClick={() => handleDateClick(date)}
                disabled={status !== "available"}
                className={cn(
                  "aspect-square min-w-[44px] min-h-[44px] flex items-center justify-center rounded-neo text-sm md:text-base font-bold transition-all relative",
                  // Other month
                  status === "other-month" && "text-gray-300 cursor-default bg-white neo-border-thin",
                  // Past date
                  status === "past" && "text-gray-400 cursor-not-allowed bg-gray-50 neo-border-thin",
                  // Blocked date
                  status === "blocked" && "bg-gray-100 text-gray-500 cursor-not-allowed neo-border",
                  // Available date
                  status === "available" && "bg-success/10 text-success neo-border neo-shadow hover:neo-shadow-hover hover:bg-success/20 cursor-pointer",
                  // Focus styles
                  isClickable && "focus:outline-none"
                )}
                title={entry?.notes || undefined}
                aria-label={`${monthNames[month]} ${date.getDate()}, ${year} - ${status}`}
              >
                {date.getDate()}

                {/* Tooltip for notes */}
                {entry?.notes && (
                  <div className="absolute inset-0 group">
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 neo-card rounded-neo text-xs whitespace-nowrap z-10 neo-shadow">
                      {entry.notes}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 neo-border-thin border-t flex flex-wrap gap-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success/10 neo-border-thick border-success rounded-neo" />
            <span className="text-text-secondary">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 neo-border rounded-neo" />
            <span className="text-text-secondary">Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white neo-border-thin rounded-neo opacity-50" />
            <span className="text-text-secondary">Past Date</span>
          </div>
        </div>
      </div>
    </div>
  );
};
