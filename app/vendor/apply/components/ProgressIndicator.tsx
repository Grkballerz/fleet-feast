"use client";

import React from "react";

interface Step {
  number: number;
  label: string;
}

interface ProgressIndicatorProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (step: number) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  steps,
  onStepClick,
}) => {
  const getStepStatus = (stepNumber: number): "completed" | "current" | "upcoming" => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "current";
    return "upcoming";
  };

  return (
    <nav aria-label="Progress" className="mb-8">
      {/* Mobile Progress */}
      <div className="lg:hidden">
        <div className="mb-2 text-sm text-text-secondary">
          Step {currentStep} of {steps.length}
        </div>
        <div className="overflow-hidden rounded-full bg-background">
          <div
            className="h-2 bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-sm font-medium text-text-primary">
          {steps.find((s) => s.number === currentStep)?.label}
        </div>
      </div>

      {/* Desktop Progress */}
      <ol className="hidden lg:flex items-center w-full">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.number}
              className={`flex items-center ${!isLast ? "flex-1" : ""}`}
            >
              <button
                onClick={() => onStepClick?.(step.number)}
                disabled={status === "upcoming"}
                className={`group flex items-center ${
                  status === "upcoming" ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {/* Step Circle */}
                <span
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    status === "completed"
                      ? "bg-primary border-primary text-white"
                      : status === "current"
                      ? "border-primary bg-white text-primary ring-4 ring-primary/20"
                      : "border-border bg-white text-text-secondary"
                  } ${
                    status !== "upcoming"
                      ? "group-hover:border-primary/80 group-hover:ring-4 group-hover:ring-primary/10"
                      : ""
                  }`}
                >
                  {status === "completed" ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </span>

                {/* Step Label */}
                <span
                  className={`ml-3 text-sm font-medium transition-colors ${
                    status === "current"
                      ? "text-primary"
                      : status === "completed"
                      ? "text-text-primary group-hover:text-primary"
                      : "text-text-secondary"
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-4">
                  <div
                    className={`h-full transition-colors ${
                      status === "completed" ? "bg-primary" : "bg-border"
                    }`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
