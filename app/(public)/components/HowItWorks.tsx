"use client";

import React from "react";

export interface HowItWorksStep {
  /**
   * Step number
   */
  number: number;
  /**
   * Step title
   */
  title: string;
  /**
   * Step description
   */
  description: string;
  /**
   * Optional icon name
   */
  icon?: string;
}

export interface HowItWorksProps {
  /**
   * Array of steps to display
   */
  steps?: HowItWorksStep[];
  /**
   * Section title
   */
  title?: string;
}

const defaultSteps: HowItWorksStep[] = [
  {
    number: 1,
    title: "Search & Compare",
    description: "Browse food trucks by cuisine, availability, and reviews",
  },
  {
    number: 2,
    title: "Book & Pay",
    description: "Request your date, confirm, and pay securely through the platform",
  },
  {
    number: 3,
    title: "Enjoy Your Event",
    description: "Your food truck arrives ready to serve delicious food",
  },
];

/**
 * HowItWorks Component
 *
 * Displays a 3-step process for how the platform works.
 * Visual, numbered steps with clear descriptions.
 *
 * @example
 * ```tsx
 * <HowItWorks
 *   title="How It Works"
 *   steps={[
 *     { number: 1, title: "Search", description: "Find your food truck" },
 *     { number: 2, title: "Book", description: "Request and confirm" },
 *     { number: 3, title: "Enjoy", description: "Great food at your event" },
 *   ]}
 * />
 * ```
 */
export const HowItWorks: React.FC<HowItWorksProps> = ({
  steps = defaultSteps,
  title = "How It Works",
}) => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          {title}
        </h2>

        {/* Steps Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gray-200 -z-10">
                  <div
                    className="h-full bg-primary"
                    style={{ width: "0%" }}
                  />
                </div>
              )}

              {/* Step Card */}
              <div className="text-center">
                {/* Step Number Circle */}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary text-white text-3xl font-bold mb-6 shadow-lg">
                  {step.number}
                </div>

                {/* Step Title */}
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-6">
            Ready to get started? It only takes a few minutes!
          </p>
        </div>
      </div>
    </section>
  );
};
