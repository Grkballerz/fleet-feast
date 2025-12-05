"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProgressIndicator } from "./ProgressIndicator";
import { Step1BusinessInfo } from "./Step1BusinessInfo";
import { Step2Documents } from "./Step2Documents";
import { Step3Menu } from "./Step3Menu";
import { Step4Availability } from "./Step4Availability";
import { Step5Preview } from "./Step5Preview";
import {
  ApplicationState,
  BusinessInfoData,
  DocumentData,
  MenuItemData,
  AvailabilityData,
  ValidationErrors,
  DocumentType,
} from "@/types/vendor-application";
import { Alert } from "@/components/ui/Alert";

const STEPS = [
  { number: 1, label: "Business Info" },
  { number: 2, label: "Documents" },
  { number: 3, label: "Menu" },
  { number: 4, label: "Availability" },
  { number: 5, label: "Review" },
];

const STORAGE_KEY = "vendor-application-draft";

export const ApplicationForm: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error" | null>(
    null
  );

  // Application state
  const [applicationState, setApplicationState] = useState<ApplicationState>({
    currentStep: 1,
    businessInfo: {},
    documents: [],
    menu: [],
    availability: {},
    isDraft: true,
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setApplicationState(parsed);
        setCurrentStep(parsed.currentStep || 1);
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, []);

  // Auto-save draft to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applicationState));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [applicationState]);

  // Save draft to server
  const saveDraft = useCallback(async () => {
    setSaveStatus("saving");
    try {
      const response = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessInfo: applicationState.businessInfo,
          documents: applicationState.documents,
          menu: applicationState.menu,
          availability: applicationState.availability,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      setSaveStatus("saved");
      setApplicationState((prev) => ({
        ...prev,
        lastSavedAt: new Date(),
      }));
    } catch (error) {
      console.error("Save draft error:", error);
      setSaveStatus("error");
    }
  }, [applicationState]);

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {};
    const { businessInfo } = applicationState;

    if (!businessInfo.businessName?.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (!businessInfo.cuisineType || businessInfo.cuisineType.length === 0) {
      newErrors.cuisineType = "Please select at least one cuisine type";
    }
    if (!businessInfo.description?.trim()) {
      newErrors.description = "Description is required";
    } else if (businessInfo.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    } else if (businessInfo.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }
    if (!businessInfo.priceRange?.min || businessInfo.priceRange.min <= 0) {
      newErrors["priceRange.min"] = "Minimum price is required";
    }
    if (!businessInfo.priceRange?.max || businessInfo.priceRange.max <= 0) {
      newErrors["priceRange.max"] = "Maximum price is required";
    }
    if (
      businessInfo.priceRange?.min &&
      businessInfo.priceRange?.max &&
      businessInfo.priceRange.min > businessInfo.priceRange.max
    ) {
      newErrors["priceRange.max"] = "Maximum price must be greater than minimum";
    }
    if (!businessInfo.capacity?.min || businessInfo.capacity.min < 1) {
      newErrors["capacity.min"] = "Minimum guests is required";
    }
    if (!businessInfo.capacity?.max || businessInfo.capacity.max < 1) {
      newErrors["capacity.max"] = "Maximum guests is required";
    }
    if (
      businessInfo.capacity?.min &&
      businessInfo.capacity?.max &&
      businessInfo.capacity.min > businessInfo.capacity.max
    ) {
      newErrors["capacity.max"] = "Maximum must be greater than minimum";
    }
    if (!businessInfo.serviceArea?.trim()) {
      newErrors.serviceArea = "Service area is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {};
    const requiredDocs = [
      DocumentType.BUSINESS_LICENSE,
      DocumentType.HEALTH_PERMIT,
      DocumentType.INSURANCE,
    ];

    requiredDocs.forEach((docType) => {
      const hasDoc = applicationState.documents.some((d) => d.type === docType);
      if (!hasDoc) {
        newErrors[docType] = `${docType.replace(/_/g, " ")} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (applicationState.menu.length === 0) {
      newErrors.menu = "Please add at least one menu item";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!applicationState.availability.pricingModel) {
      newErrors.pricingModel = "Please select a pricing model";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    let isValid = true;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
    }

    if (isValid) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setApplicationState((prev) => ({ ...prev, currentStep: nextStep }));
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    setApplicationState((prev) => ({ ...prev, currentStep: prevStep }));
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      setApplicationState((prev) => ({ ...prev, currentStep: step }));
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Data change handlers
  const handleBusinessInfoChange = (data: Partial<BusinessInfoData>) => {
    setApplicationState((prev) => ({
      ...prev,
      businessInfo: data,
    }));
  };

  const handleDocumentsChange = (data: DocumentData[]) => {
    setApplicationState((prev) => ({
      ...prev,
      documents: data,
    }));
  };

  const handleMenuChange = (data: MenuItemData[]) => {
    setApplicationState((prev) => ({
      ...prev,
      menu: data,
    }));
  };

  const handleAvailabilityChange = (data: Partial<AvailabilityData>) => {
    setApplicationState((prev) => ({
      ...prev,
      availability: data,
    }));
  };

  // Submit application
  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/vendor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessInfo: applicationState.businessInfo,
          documents: applicationState.documents,
          menu: applicationState.menu,
          availability: applicationState.availability,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to submit application");
      }

      // Clear draft from localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Redirect to success page
      router.push("/vendor/apply/success");
    } catch (error) {
      console.error("Submit error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again."
      );
      throw error;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Save Status */}
      {saveStatus === "saved" && (
        <Alert variant="success" className="mb-4">
          Draft saved automatically
        </Alert>
      )}
      {saveStatus === "error" && (
        <Alert variant="error" className="mb-4">
          Failed to save draft. Your changes are saved locally.
        </Alert>
      )}

      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={currentStep}
        steps={STEPS}
        onStepClick={handleStepClick}
      />

      {/* Step Content */}
      {currentStep === 1 && (
        <Step1BusinessInfo
          data={applicationState.businessInfo}
          errors={errors}
          onDataChange={handleBusinessInfoChange}
          onNext={handleNext}
        />
      )}

      {currentStep === 2 && (
        <Step2Documents
          data={applicationState.documents}
          errors={errors}
          onDataChange={handleDocumentsChange}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 3 && (
        <Step3Menu
          data={applicationState.menu}
          errors={errors}
          onDataChange={handleMenuChange}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 4 && (
        <Step4Availability
          data={applicationState.availability}
          errors={errors}
          onDataChange={handleAvailabilityChange}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 5 && (
        <Step5Preview
          businessInfo={applicationState.businessInfo}
          documents={applicationState.documents}
          menu={applicationState.menu}
          availability={applicationState.availability}
          errors={errors}
          onBack={handleBack}
          onEdit={handleStepClick}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
