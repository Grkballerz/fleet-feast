"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BusinessInfoData, ValidationErrors } from "@/types/vendor-application";
import { CuisineType } from "@/types";

interface Step1BusinessInfoProps {
  data: Partial<BusinessInfoData>;
  errors: ValidationErrors;
  onDataChange: (data: Partial<BusinessInfoData>) => void;
  onNext: () => void;
}

const cuisineOptions = Object.values(CuisineType);

export const Step1BusinessInfo: React.FC<Step1BusinessInfoProps> = ({
  data,
  errors,
  onDataChange,
  onNext,
}) => {
  const [formData, setFormData] = useState<Partial<BusinessInfoData>>(data);

  const handleChange = (field: keyof BusinessInfoData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onDataChange(updated);
  };

  const handleNestedChange = (
    parent: keyof BusinessInfoData,
    field: string,
    value: any
  ) => {
    const updated = {
      ...formData,
      [parent]: {
        ...(formData[parent] as any),
        [field]: value,
      },
    };
    setFormData(updated);
    onDataChange(updated);
  };

  const toggleCuisine = (cuisine: CuisineType) => {
    const current = formData.cuisineType || [];
    const updated = current.includes(cuisine)
      ? current.filter((c) => c !== cuisine)
      : [...current, cuisine];
    handleChange("cuisineType", updated);
  };

  const validateAndNext = () => {
    // Validation will be done by parent component
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="neo-card-glass neo-shadow-lg rounded-neo p-6">
        <div>
          <h2 className="neo-heading text-2xl mb-2">
            Business Information
          </h2>
          <p className="text-text-secondary mb-6">
            Tell us about your food truck business
          </p>

          <div className="space-y-4">
            {/* Business Name */}
            <div>
              <label className="label font-bold" htmlFor="businessName">
                Business Name <span className="text-error">*</span>
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="e.g., Taco Express"
                value={formData.businessName || ""}
                onChange={(e) => handleChange("businessName", e.target.value)}
                className={`neo-input w-full px-4 py-3 ${errors.businessName ? "border-error" : ""}`}
                required
              />
              {errors.businessName && (
                <p className="error-message">{errors.businessName}</p>
              )}
            </div>

            {/* Cuisine Type */}
            <div>
              <label className="label font-bold">
                Cuisine Type <span className="text-error">*</span>
              </label>
              <p className="text-sm text-text-secondary mb-2">
                Select all that apply
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {cuisineOptions.map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => toggleCuisine(cuisine)}
                    className={`px-4 py-2 rounded-neo neo-border-thick font-bold transition-all ${
                      formData.cuisineType?.includes(cuisine)
                        ? "neo-border-primary bg-primary/10 text-primary neo-shadow"
                        : "bg-white text-text-secondary hover:neo-shadow"
                    }`}
                  >
                    {cuisine.replace("_", " ")}
                  </button>
                ))}
              </div>
              {errors.cuisineType && (
                <p className="error-message">{errors.cuisineType}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="label font-bold" htmlFor="description">
                Business Description <span className="text-error">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe your food truck, specialty dishes, and what makes you unique..."
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className={`neo-input w-full min-h-[100px] resize-y ${errors.description ? "border-error" : ""}`}
                required
              />
              <p className="text-sm text-text-secondary mt-1">
                {formData.description?.length || 0} / 500 characters
              </p>
              {errors.description && (
                <p className="error-message">{errors.description}</p>
              )}
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label font-bold" htmlFor="priceMin">
                  Min Price Per Person <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">
                    $
                  </span>
                  <input
                    id="priceMin"
                    name="priceMin"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="10.00"
                    value={formData.priceRange?.min || ""}
                    onChange={(e) =>
                      handleNestedChange(
                        "priceRange",
                        "min",
                        parseFloat(e.target.value)
                      )
                    }
                    className={`neo-input w-full pl-10 pr-4 py-3 ${errors["priceRange.min"] ? "border-error" : ""}`}
                    required
                  />
                </div>
                {errors["priceRange.min"] && (
                  <p className="error-message">{errors["priceRange.min"]}</p>
                )}
              </div>

              <div>
                <label className="label font-bold" htmlFor="priceMax">
                  Max Price Per Person <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">
                    $
                  </span>
                  <input
                    id="priceMax"
                    name="priceMax"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="25.00"
                    value={formData.priceRange?.max || ""}
                    onChange={(e) =>
                      handleNestedChange(
                        "priceRange",
                        "max",
                        parseFloat(e.target.value)
                      )
                    }
                    className={`neo-input w-full pl-10 pr-4 py-3 ${errors["priceRange.max"] ? "border-error" : ""}`}
                    required
                  />
                </div>
                {errors["priceRange.max"] && (
                  <p className="error-message">{errors["priceRange.max"]}</p>
                )}
              </div>
            </div>

            {/* Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label font-bold" htmlFor="capacityMin">
                  Minimum Guests <span className="text-error">*</span>
                </label>
                <input
                  id="capacityMin"
                  name="capacityMin"
                  type="number"
                  min="1"
                  placeholder="10"
                  value={formData.capacity?.min || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "capacity",
                      "min",
                      parseInt(e.target.value)
                    )
                  }
                  className={`neo-input w-full px-4 py-3 ${errors["capacity.min"] ? "border-error" : ""}`}
                  required
                />
                {errors["capacity.min"] && (
                  <p className="error-message">{errors["capacity.min"]}</p>
                )}
              </div>

              <div>
                <label className="label font-bold" htmlFor="capacityMax">
                  Maximum Guests <span className="text-error">*</span>
                </label>
                <input
                  id="capacityMax"
                  name="capacityMax"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formData.capacity?.max || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "capacity",
                      "max",
                      parseInt(e.target.value)
                    )
                  }
                  className={`neo-input w-full px-4 py-3 ${errors["capacity.max"] ? "border-error" : ""}`}
                  required
                />
                {errors["capacity.max"] && (
                  <p className="error-message">{errors["capacity.max"]}</p>
                )}
              </div>
            </div>

            {/* Service Area */}
            <div>
              <label className="label font-bold" htmlFor="serviceArea">
                Service Area <span className="text-error">*</span>
              </label>
              <input
                id="serviceArea"
                name="serviceArea"
                type="text"
                placeholder="e.g., Los Angeles County, CA"
                value={formData.serviceArea || ""}
                onChange={(e) => handleChange("serviceArea", e.target.value)}
                className={`neo-input w-full px-4 py-3 ${errors.serviceArea ? "border-error" : ""}`}
                required
              />
              <p className="text-sm text-text-secondary mt-1">
                Enter the geographic area where you provide catering services
              </p>
              {errors.serviceArea && (
                <p className="error-message">{errors.serviceArea}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button onClick={validateAndNext} variant="primary" size="lg">
          Continue to Documents
        </Button>
      </div>
    </div>
  );
};
