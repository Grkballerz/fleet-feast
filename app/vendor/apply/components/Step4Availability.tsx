"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  AvailabilityData,
  AvailabilityDate,
  AvailabilityPattern,
  PricingModel,
  ValidationErrors,
} from "@/types/vendor-application";

interface Step4AvailabilityProps {
  data: Partial<AvailabilityData>;
  errors: ValidationErrors;
  onDataChange: (data: Partial<AvailabilityData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const daysOfWeek = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

// Generate next 90 days
const generateCalendarDates = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

export const Step4Availability: React.FC<Step4AvailabilityProps> = ({
  data,
  errors,
  onDataChange,
  onNext,
  onBack,
}) => {
  const [availabilityData, setAvailabilityData] =
    useState<Partial<AvailabilityData>>(data);
  const [selectedDates, setSelectedDates] = useState<AvailabilityDate[]>(
    data.dates || []
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [noteText, setNoteText] = useState("");
  const [noteDate, setNoteDate] = useState<string | null>(null);

  const calendarDates = generateCalendarDates();

  const handlePricingModelChange = (model: PricingModel) => {
    const updated = { ...availabilityData, pricingModel: model };
    setAvailabilityData(updated);
    onDataChange(updated);
  };

  const handlePatternChange = (pattern: AvailabilityPattern) => {
    const updated = {
      ...availabilityData,
      recurringPattern: pattern,
    };

    // Auto-select days based on pattern
    if (pattern === AvailabilityPattern.WEEKDAYS) {
      updated.recurringDays = [1, 2, 3, 4, 5]; // Mon-Fri
    } else if (pattern === AvailabilityPattern.WEEKENDS) {
      updated.recurringDays = [0, 6]; // Sun, Sat
    } else {
      updated.recurringDays = [];
    }

    setAvailabilityData(updated);
    onDataChange(updated);
  };

  const handleDayToggle = (day: number) => {
    const current = availabilityData.recurringDays || [];
    const updated = {
      ...availabilityData,
      recurringDays: current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day],
    };
    setAvailabilityData(updated);
    onDataChange(updated);
  };

  const handleDateToggle = (dateStr: string) => {
    const existing = selectedDates.find((d) => d.date === dateStr);
    let updated: AvailabilityDate[];

    if (existing) {
      // Toggle availability
      updated = selectedDates.map((d) =>
        d.date === dateStr ? { ...d, available: !d.available } : d
      );
    } else {
      // Add new date
      updated = [...selectedDates, { date: dateStr, available: true }];
    }

    setSelectedDates(updated);
    const updatedData = { ...availabilityData, dates: updated };
    setAvailabilityData(updatedData);
    onDataChange(updatedData);
  };

  const handleAddNote = (dateStr: string) => {
    setNoteDate(dateStr);
    const existing = selectedDates.find((d) => d.date === dateStr);
    setNoteText(existing?.note || "");
  };

  const handleSaveNote = () => {
    if (!noteDate) return;

    const updated = selectedDates.map((d) =>
      d.date === noteDate ? { ...d, note: noteText } : d
    );

    setSelectedDates(updated);
    const updatedData = { ...availabilityData, dates: updated };
    setAvailabilityData(updatedData);
    onDataChange(updatedData);

    setNoteDate(null);
    setNoteText("");
  };

  const isDateSelected = (dateStr: string): boolean => {
    return selectedDates.some((d) => d.date === dateStr && d.available);
  };

  const getDateNote = (dateStr: string): string | undefined => {
    return selectedDates.find((d) => d.date === dateStr)?.note;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const validateAndNext = () => {
    if (!availabilityData.pricingModel) {
      alert("Please select a pricing model");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="neo-card-glass neo-shadow-lg rounded-neo p-6">
        <div>
          <h2 className="neo-heading text-2xl mb-2">
            Availability & Pricing
          </h2>
          <p className="text-text-secondary mb-6">
            Set your pricing model and available dates
          </p>

          {/* Pricing Model */}
          <div className="mb-8">
            <label className="label font-bold mb-3">
              Pricing Model <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handlePricingModelChange(PricingModel.PER_PERSON)}
                className={`p-4 neo-border-thick rounded-neo text-left transition-all ${
                  availabilityData.pricingModel === PricingModel.PER_PERSON
                    ? "neo-border-primary bg-primary/5 neo-shadow-primary"
                    : "bg-white hover:neo-shadow"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-6 h-6 rounded-neo neo-border-thick flex items-center justify-center ${
                      availabilityData.pricingModel === PricingModel.PER_PERSON
                        ? "neo-border-primary bg-primary"
                        : ""
                    }`}
                  >
                    {availabilityData.pricingModel === PricingModel.PER_PERSON && (
                      <div className="w-3 h-3 rounded-neo bg-white" />
                    )}
                  </div>
                  <h3 className="font-bold text-text-primary">Per Person</h3>
                </div>
                <p className="text-sm text-text-secondary ml-9">
                  Charge per guest attending the event
                </p>
              </button>

              <button
                type="button"
                onClick={() => handlePricingModelChange(PricingModel.FLAT_RATE)}
                className={`p-4 neo-border-thick rounded-neo text-left transition-all ${
                  availabilityData.pricingModel === PricingModel.FLAT_RATE
                    ? "neo-border-primary bg-primary/5 neo-shadow-primary"
                    : "bg-white hover:neo-shadow"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-6 h-6 rounded-neo neo-border-thick flex items-center justify-center ${
                      availabilityData.pricingModel === PricingModel.FLAT_RATE
                        ? "neo-border-primary bg-primary"
                        : ""
                    }`}
                  >
                    {availabilityData.pricingModel === PricingModel.FLAT_RATE && (
                      <div className="w-3 h-3 rounded-neo bg-white" />
                    )}
                  </div>
                  <h3 className="font-bold text-text-primary">Flat Rate</h3>
                </div>
                <p className="text-sm text-text-secondary ml-9">
                  Charge a fixed price per event
                </p>
              </button>
            </div>
            {errors.pricingModel && (
              <p className="error-message mt-2">{errors.pricingModel}</p>
            )}
          </div>

          {/* Recurring Availability Pattern */}
          <div className="mb-8">
            <label className="label font-bold mb-3">Recurring Availability (Optional)</label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handlePatternChange(AvailabilityPattern.WEEKDAYS)}
                  className={`px-4 py-2 rounded-neo neo-border-thick font-bold transition-all ${
                    availabilityData.recurringPattern ===
                    AvailabilityPattern.WEEKDAYS
                      ? "neo-border-primary bg-primary/10 text-primary neo-shadow"
                      : "bg-white hover:neo-shadow"
                  }`}
                >
                  Weekdays (Mon-Fri)
                </button>
                <button
                  type="button"
                  onClick={() => handlePatternChange(AvailabilityPattern.WEEKENDS)}
                  className={`px-4 py-2 rounded-neo neo-border-thick font-bold transition-all ${
                    availabilityData.recurringPattern ===
                    AvailabilityPattern.WEEKENDS
                      ? "neo-border-primary bg-primary/10 text-primary neo-shadow"
                      : "bg-white hover:neo-shadow"
                  }`}
                >
                  Weekends
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handlePatternChange(AvailabilityPattern.SPECIFIC_DAYS)
                  }
                  className={`px-4 py-2 rounded-neo neo-border-thick font-bold transition-all ${
                    availabilityData.recurringPattern ===
                    AvailabilityPattern.SPECIFIC_DAYS
                      ? "neo-border-primary bg-primary/10 text-primary neo-shadow"
                      : "bg-white hover:neo-shadow"
                  }`}
                >
                  Specific Days
                </button>
              </div>

              {availabilityData.recurringPattern ===
                AvailabilityPattern.SPECIFIC_DAYS && (
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleDayToggle(value)}
                      className={`px-2 py-2 text-sm rounded-neo neo-border-thick font-bold transition-all ${
                        availabilityData.recurringDays?.includes(value)
                          ? "neo-border-primary bg-primary/10 text-primary neo-shadow"
                          : "bg-white hover:neo-shadow"
                      }`}
                    >
                      {label.slice(0, 3)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div>
            <label className="label font-bold mb-3">Select Specific Dates</label>
            <p className="text-sm text-text-secondary mb-4">
              Click on dates to mark them as available or unavailable
            </p>
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {daysOfWeek.map(({ label }) => (
                <div
                  key={label}
                  className="text-center text-sm font-black text-text-primary py-2"
                >
                  {label.slice(0, 3)}
                </div>
              ))}

              {/* Calendar dates */}
              {calendarDates.slice(0, 42).map((date) => {
                const dateStr = formatDate(date);
                const isSelected = isDateSelected(dateStr);
                const note = getDateNote(dateStr);
                const isToday =
                  formatDate(new Date()) === dateStr;

                return (
                  <div key={dateStr} className="relative">
                    <button
                      type="button"
                      onClick={() => handleDateToggle(dateStr)}
                      className={`w-full aspect-square rounded-neo neo-border-thick text-sm font-bold transition-all relative ${
                        isSelected
                          ? "bg-success/10 text-success neo-shadow neo-border-primary"
                          : "bg-white hover:neo-shadow"
                      } ${isToday ? "neo-border-primary neo-shadow-primary" : ""}`}
                    >
                      {date.getDate()}
                      {note && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-warning rounded-full neo-border" />
                      )}
                    </button>
                    {isSelected && (
                      <button
                        type="button"
                        onClick={() => handleAddNote(dateStr)}
                        className="absolute -bottom-1 -right-1 text-xs text-primary hover:text-primary/80"
                        title="Add note"
                      >
                        📝
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note Modal */}
          {noteDate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-neo neo-border-thick neo-shadow-lg max-w-md w-full p-6">
                <h3 className="font-bold text-lg mb-4">
                  Add Note for {noteDate}
                </h3>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g., Only available after 3 PM"
                  className="neo-input w-full mb-4 min-h-[80px]"
                  rows={3}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => setNoteDate(null)}
                    variant="ghost"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveNote}
                    variant="primary"
                    className="flex-1"
                  >
                    Save Note
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost" size="lg">
          Back
        </Button>
        <Button onClick={validateAndNext} variant="primary" size="lg">
          Continue to Preview
        </Button>
      </div>
    </div>
  );
};
