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
        <div className="mb-2 text-sm font-bold text-text-primary">
          Step {currentStep} of {steps.length}
        </div>
        <div className="overflow-hidden rounded-neo neo-border bg-white">
          <div
            className="h-4 bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-sm font-bold text-text-primary">
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
                  className={`flex items-center justify-center w-12 h-12 rounded-neo neo-border-thick transition-all ${
                    status === "completed"
                      ? "bg-primary text-white neo-shadow"
                      : status === "current"
                      ? "bg-white text-primary neo-border-primary neo-shadow-primary"
                      : "bg-white text-text-secondary"
                  } ${
                    status !== "upcoming"
                      ? "group-hover:neo-shadow-hover"
                      : ""
                  }`}
                >
                  {status === "completed" ? (
                    <svg
                      className="w-6 h-6"
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
                    <span className="font-black text-lg">{step.number}</span>
                  )}
                </span>

                {/* Step Label */}
                <span
                  className={`ml-3 text-sm font-bold transition-colors ${
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
                <div className="flex-1 h-1 mx-4 neo-border-thin">
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
