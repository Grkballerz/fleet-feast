"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Trash2, Plus, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventType } from "@prisma/client";

// Constants
const PLATFORM_FEE_RATE = 0.05; // 5% platform fee
const DEFAULT_EXPIRATION_DAYS = 7;

// Type definitions
interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface ProposalData {
  lineItems: LineItem[];
  inclusions: string[];
  terms: string;
  expirationDays: number;
  subtotal: number;
  platformFee: number;
  customerTotal: number;
  vendorReceives: number;
}

interface InquiryData {
  eventDate: string;
  eventTime: string;
  guestCount: number;
  eventType: EventType;
  location: string;
  specialRequests?: string;
}

export interface ProposalBuilderProps {
  /**
   * Inquiry details from the customer
   */
  inquiry: InquiryData;
  /**
   * Callback when proposal is submitted
   */
  onSubmit: (proposal: ProposalData) => Promise<void>;
  /**
   * Loading state during submission
   */
  isLoading?: boolean;
}

// Predefined inclusion options
const PREDEFINED_INCLUSIONS = [
  "Delivery",
  "Setup",
  "Cleanup",
  "Staff",
  "Equipment",
  "Serving Utensils",
  "Plates & Napkins",
  "Tables & Chairs",
];

/**
 * ProposalBuilder Component
 *
 * Form component for vendors to create detailed proposals with line items,
 * inclusions, terms, and fee preview. Shows breakdown of platform fees
 * and what the vendor will actually receive.
 *
 * @example
 * ```tsx
 * <ProposalBuilder
 *   inquiry={{
 *     eventDate: "2025-01-15",
 *     eventTime: "18:00",
 *     guestCount: 100,
 *     eventType: "CORPORATE",
 *     location: "123 Main St, City"
 *   }}
 *   onSubmit={handleProposalSubmit}
 *   isLoading={submitting}
 * />
 * ```
 */
export const ProposalBuilder: React.FC<ProposalBuilderProps> = ({
  inquiry,
  onSubmit,
  isLoading = false,
}) => {
  // State management
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), name: "", quantity: 1, unitPrice: 0 },
  ]);
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([]);
  const [customInclusions, setCustomInclusions] = useState<string[]>([]);
  const [newCustomInclusion, setNewCustomInclusion] = useState("");
  const [terms, setTerms] = useState("");
  const [expirationDays, setExpirationDays] = useState(DEFAULT_EXPIRATION_DAYS);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      return sum + itemTotal;
    }, 0);

    const platformFee = subtotal * PLATFORM_FEE_RATE;
    const vendorReceives = subtotal - platformFee;
    const customerTotal = subtotal + platformFee;

    return {
      subtotal,
      platformFee,
      vendorReceives,
      customerTotal,
    };
  }, [lineItems]);

  // Line item handlers
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: crypto.randomUUID(), name: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
      // Clear validation error for this item
      const newErrors = { ...validationErrors };
      delete newErrors[`lineItem-${id}-name`];
      delete newErrors[`lineItem-${id}-price`];
      setValidationErrors(newErrors);
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
    // Clear validation error for this field
    if (validationErrors[`lineItem-${id}-${field}`]) {
      const newErrors = { ...validationErrors };
      delete newErrors[`lineItem-${id}-${field}`];
      setValidationErrors(newErrors);
    }
  };

  // Inclusion handlers
  const toggleInclusion = (inclusion: string) => {
    setSelectedInclusions((prev) =>
      prev.includes(inclusion)
        ? prev.filter((i) => i !== inclusion)
        : [...prev, inclusion]
    );
  };

  const addCustomInclusion = () => {
    const trimmed = newCustomInclusion.trim();
    if (trimmed && !customInclusions.includes(trimmed)) {
      setCustomInclusions([...customInclusions, trimmed]);
      setNewCustomInclusion("");
    }
  };

  const removeCustomInclusion = (inclusion: string) => {
    setCustomInclusions(customInclusions.filter((i) => i !== inclusion));
  };

  // Validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // Check for at least one line item
    if (lineItems.length === 0) {
      errors.lineItems = "At least one line item is required";
    }

    // Validate each line item
    lineItems.forEach((item) => {
      if (!item.name.trim()) {
        errors[`lineItem-${item.id}-name`] = "Item name is required";
      }
      if (item.unitPrice <= 0) {
        errors[`lineItem-${item.id}-price`] = "Price must be greater than 0";
      }
    });

    // Check total
    if (calculations.subtotal <= 0) {
      errors.total = "Total must be greater than $0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    const proposalData: ProposalData = {
      lineItems: lineItems.filter(
        (item) => item.name.trim() && item.unitPrice > 0
      ),
      inclusions: [...selectedInclusions, ...customInclusions],
      terms,
      expirationDays,
      subtotal: calculations.subtotal,
      platformFee: calculations.platformFee,
      customerTotal: calculations.customerTotal,
      vendorReceives: calculations.vendorReceives,
    };

    try {
      await onSubmit(proposalData);
      setShowConfirmModal(false);
    } catch (error) {
      // Error handling is done by parent component
      setShowConfirmModal(false);
    }
  };

  // Format event type for display
  const formatEventType = (type: EventType): string => {
    return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Inquiry Summary Card */}
      <Card className="neo-card-glass neo-shadow rounded-neo">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="heading-3">Event Details</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-text-secondary">Date:</span>
              <span className="ml-2 text-text-primary">
                {new Date(inquiry.eventDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-text-secondary">Time:</span>
              <span className="ml-2 text-text-primary">{inquiry.eventTime}</span>
            </div>
            <div>
              <span className="font-medium text-text-secondary">Guests:</span>
              <span className="ml-2 text-text-primary">{inquiry.guestCount}</span>
            </div>
            <div>
              <span className="font-medium text-text-secondary">Type:</span>
              <span className="ml-2 text-text-primary">
                {formatEventType(inquiry.eventType)}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-text-secondary">Location:</span>
              <span className="ml-2 text-text-primary">{inquiry.location}</span>
            </div>
            {inquiry.specialRequests && (
              <div className="md:col-span-2">
                <span className="font-medium text-text-secondary">Special Requests:</span>
                <p className="mt-1 text-text-primary">{inquiry.specialRequests}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Line Items Card */}
      <Card className="neo-card-glass neo-shadow rounded-neo">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h2 className="heading-3">Line Items</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLineItem}
              iconLeft={<Plus className="h-4 w-4" />}
            >
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row gap-3 p-4 rounded-neo bg-background/50 border border-border"
              >
                <div className="flex-1">
                  <Input
                    label="Item Name"
                    value={item.name}
                    onChange={(e) => updateLineItem(item.id, "name", e.target.value)}
                    placeholder="e.g., Taco Bar Package"
                    error={validationErrors[`lineItem-${item.id}-name`]}
                    required
                  />
                </div>
                <div className="w-full md:w-24">
                  <label className="mb-2 block text-sm font-bold text-white/90">
                    Quantity <span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)
                    }
                    className="neo-input w-full"
                  />
                </div>
                <div className="w-full md:w-32">
                  <label className="mb-2 block text-sm font-bold text-white/90">
                    Unit Price <span className="ml-1 text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice || ""}
                      onChange={(e) =>
                        updateLineItem(
                          item.id,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={cn(
                        "neo-input w-full pl-7",
                        validationErrors[`lineItem-${item.id}-price`] && "border-error"
                      )}
                    />
                  </div>
                  {validationErrors[`lineItem-${item.id}-price`] && (
                    <p className="mt-1 text-sm text-red-400">
                      {validationErrors[`lineItem-${item.id}-price`]}
                    </p>
                  )}
                </div>
                <div className="w-full md:w-32 flex items-end">
                  <div className="w-full">
                    <label className="mb-2 block text-sm font-bold text-white/90">
                      Total
                    </label>
                    <div className="neo-input w-full bg-secondary/20 text-text-primary font-medium">
                      ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(item.id)}
                    disabled={lineItems.length === 1}
                    iconLeft={<Trash2 className="h-4 w-4" />}
                    className="text-error hover:bg-error/10"
                    aria-label="Remove line item"
                  />
                </div>
              </div>
            ))}

            {validationErrors.lineItems && (
              <p className="text-sm text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.lineItems}
              </p>
            )}

            {/* Running Subtotal */}
            <div className="flex justify-end pt-4 border-t border-border">
              <div className="text-right">
                <span className="text-sm text-text-secondary">Subtotal:</span>
                <span className="ml-3 text-lg font-bold text-text-primary">
                  ${calculations.subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Fee Preview Card */}
      <Card className="neo-card-glass neo-shadow rounded-neo border-2 border-primary/20">
        <CardHeader>
          <h2 className="heading-3">Fee Breakdown</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div className="flex justify-between text-base">
              <span className="text-text-secondary">Subtotal:</span>
              <span className="font-medium">${calculations.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-base text-warning">
              <span className="flex items-center gap-2">
                <span>Platform Fee (5%):</span>
                <span className="text-xs text-text-secondary">(deducted from subtotal)</span>
              </span>
              <span className="font-medium">-${calculations.platformFee.toFixed(2)}</span>
            </div>

            <div className="divider" />

            <div className="flex justify-between text-base text-text-secondary">
              <span>Customer Pays:</span>
              <span className="font-medium">
                ${calculations.customerTotal.toFixed(2)}
                <span className="ml-2 text-xs">(+5% service fee)</span>
              </span>
            </div>

            <div className="divider" />

            <div className="flex justify-between text-xl font-bold text-primary">
              <span>You Receive:</span>
              <span>${calculations.vendorReceives.toFixed(2)}</span>
            </div>

            {validationErrors.total && (
              <p className="text-sm text-red-400 flex items-center gap-2 mt-2">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.total}
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Inclusions Card */}
      <Card className="neo-card-glass neo-shadow rounded-neo">
        <CardHeader>
          <h2 className="heading-3">What's Included</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {/* Predefined inclusions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PREDEFINED_INCLUSIONS.map((inclusion) => (
                <label
                  key={inclusion}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-neo border-2 cursor-pointer transition-all",
                    selectedInclusions.includes(inclusion)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedInclusions.includes(inclusion)}
                    onChange={() => toggleInclusion(inclusion)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">{inclusion}</span>
                </label>
              ))}
            </div>

            {/* Custom inclusions */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-white/90">
                Custom Inclusions
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCustomInclusion}
                  onChange={(e) => setNewCustomInclusion(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomInclusion();
                    }
                  }}
                  placeholder="Add a custom inclusion..."
                  className="neo-input flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomInclusion}
                  disabled={!newCustomInclusion.trim()}
                  iconLeft={<Plus className="h-4 w-4" />}
                >
                  Add
                </Button>
              </div>

              {/* Display custom inclusions */}
              {customInclusions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {customInclusions.map((inclusion) => (
                    <div
                      key={inclusion}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-neo bg-primary/10 border border-primary"
                    >
                      <span className="text-sm">{inclusion}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomInclusion(inclusion)}
                        className="text-error hover:text-error/80"
                        aria-label={`Remove ${inclusion}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Terms Card */}
      <Card className="neo-card-glass neo-shadow rounded-neo">
        <CardHeader>
          <h2 className="heading-3">Terms & Conditions (Optional)</h2>
        </CardHeader>
        <CardBody>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Enter any terms and conditions, cancellation policy, or additional notes..."
            rows={4}
            className="textarea w-full"
          />
          <p className="mt-2 text-sm text-text-secondary">
            These terms will be included in the proposal sent to the customer.
          </p>
        </CardBody>
      </Card>

      {/* Expiration Card */}
      <Card className="neo-card-glass neo-shadow rounded-neo">
        <CardHeader>
          <h2 className="heading-3">Proposal Expiration</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <label className="text-sm font-medium text-text-primary">
              This proposal expires in:
            </label>
            <div className="flex gap-2">
              {[3, 5, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setExpirationDays(days)}
                  className={cn(
                    "px-4 py-2 rounded-neo border-2 transition-all font-medium",
                    expirationDays === days
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  {days} {days === 1 ? "day" : "days"}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Expires on:{" "}
            {new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </p>
        </CardBody>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4 justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading || calculations.subtotal <= 0}
          loading={isLoading}
          className="min-w-[200px]"
        >
          Send Proposal
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Proposal"
        description="Please review your proposal before sending."
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-neo bg-background/50 border border-border">
            <h4 className="font-semibold mb-2">Proposal Summary</h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-text-secondary">Line Items:</span>{" "}
                {lineItems.filter((item) => item.name.trim() && item.unitPrice > 0).length}
              </p>
              <p>
                <span className="text-text-secondary">Inclusions:</span>{" "}
                {selectedInclusions.length + customInclusions.length}
              </p>
              <p>
                <span className="text-text-secondary">Customer Total:</span>{" "}
                <span className="font-bold">${calculations.customerTotal.toFixed(2)}</span>
              </p>
              <p>
                <span className="text-text-secondary">You Receive:</span>{" "}
                <span className="font-bold text-primary">
                  ${calculations.vendorReceives.toFixed(2)}
                </span>
              </p>
              <p>
                <span className="text-text-secondary">Expires:</span>{" "}
                {new Date(
                  Date.now() + expirationDays * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            Once sent, the customer will be able to review and accept this proposal.
          </p>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="ghost"
            onClick={() => setShowConfirmModal(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={confirmSubmit}
            loading={isLoading}
            disabled={isLoading}
          >
            Send Proposal
          </Button>
        </div>
      </Modal>
    </form>
  );
};

ProposalBuilder.displayName = "ProposalBuilder";
