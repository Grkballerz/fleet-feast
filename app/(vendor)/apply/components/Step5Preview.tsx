"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import {
  BusinessInfoData,
  DocumentData,
  MenuItemData,
  AvailabilityData,
  ValidationErrors,
} from "@/types/vendor-application";

interface Step5PreviewProps {
  businessInfo: Partial<BusinessInfoData>;
  documents: DocumentData[];
  menu: MenuItemData[];
  availability: Partial<AvailabilityData>;
  errors: ValidationErrors;
  onBack: () => void;
  onEdit: (step: number) => void;
  onSubmit: () => Promise<void>;
}

export const Step5Preview: React.FC<Step5PreviewProps> = ({
  businessInfo,
  documents,
  menu,
  availability,
  errors,
  onBack,
  onEdit,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async () => {
    if (!termsAccepted) {
      alert("Please accept the terms and conditions to continue");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Review Your Application
          </h2>
          <p className="text-text-secondary mb-6">
            Please review all information before submitting
          </p>

          {/* Business Information */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text-primary">
                Business Information
              </h3>
              <button
                onClick={() => onEdit(1)}
                className="text-primary hover:text-primary/80 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="bg-background rounded-lg p-4 space-y-3">
              <div>
                <span className="text-text-secondary text-sm">Business Name</span>
                <p className="font-medium text-text-primary">
                  {businessInfo.businessName || "—"}
                </p>
              </div>
              <div>
                <span className="text-text-secondary text-sm">Cuisine Type</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {businessInfo.cuisineType?.map((cuisine) => (
                    <Badge key={cuisine} variant="primary">
                      {cuisine.replace("_", " ")}
                    </Badge>
                  )) || <p className="text-text-secondary">—</p>}
                </div>
              </div>
              <div>
                <span className="text-text-secondary text-sm">Description</span>
                <p className="text-text-primary">{businessInfo.description || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-text-secondary text-sm">Price Range</span>
                  <p className="font-medium text-text-primary">
                    ${businessInfo.priceRange?.min?.toFixed(2) || "—"} - $
                    {businessInfo.priceRange?.max?.toFixed(2) || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary text-sm">Guest Capacity</span>
                  <p className="font-medium text-text-primary">
                    {businessInfo.capacity?.min || "—"} -{" "}
                    {businessInfo.capacity?.max || "—"} guests
                  </p>
                </div>
              </div>
              <div>
                <span className="text-text-secondary text-sm">Service Area</span>
                <p className="text-text-primary">{businessInfo.serviceArea || "—"}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text-primary">Documents</h3>
              <button
                onClick={() => onEdit(2)}
                className="text-primary hover:text-primary/80 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div
                    key={doc.type}
                    className="flex items-center gap-3 bg-background rounded-lg p-3"
                  >
                    <svg
                      className="h-6 w-6 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">
                        {doc.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-text-secondary">{doc.fileName}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text-secondary">No documents uploaded</p>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text-primary">
                Menu ({menu.length} items)
              </h3>
              <button
                onClick={() => onEdit(3)}
                className="text-primary hover:text-primary/80 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="space-y-3">
              {menu.length > 0 ? (
                menu.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="bg-background rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-text-primary">
                        {item.name}
                      </h4>
                      <span className="font-bold text-primary">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">
                      {item.description}
                    </p>
                    {item.dietaryTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.dietaryTags.map((tag) => (
                          <Badge key={tag} variant="success" className="text-xs">
                            {tag.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-text-secondary">No menu items added</p>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text-primary">
                Availability & Pricing
              </h3>
              <button
                onClick={() => onEdit(4)}
                className="text-primary hover:text-primary/80 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="bg-background rounded-lg p-4 space-y-3">
              <div>
                <span className="text-text-secondary text-sm">Pricing Model</span>
                <p className="font-medium text-text-primary">
                  {availability.pricingModel?.replace(/_/g, " ") || "—"}
                </p>
              </div>
              {availability.recurringPattern && (
                <div>
                  <span className="text-text-secondary text-sm">
                    Recurring Pattern
                  </span>
                  <p className="text-text-primary">
                    {availability.recurringPattern.replace(/_/g, " ")}
                  </p>
                </div>
              )}
              <div>
                <span className="text-text-secondary text-sm">
                  Available Dates
                </span>
                <p className="text-text-primary">
                  {availability.dates?.filter((d) => d.available).length || 0} dates
                  selected
                </p>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="border-2 border-border rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-text-primary">
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                . I confirm that all information provided is accurate and complete.
              </span>
            </label>
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert variant="error" className="mt-4">
              <p className="font-medium">Please correct the following errors:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key} className="text-sm">
                    {message}
                  </li>
                ))}
              </ul>
            </Alert>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost" size="lg" disabled={isSubmitting}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          variant="primary"
          size="lg"
          disabled={isSubmitting || !termsAccepted}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Submitting Application...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </div>
  );
};
