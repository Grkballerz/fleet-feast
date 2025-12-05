"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export interface CTASectionProps {
  /**
   * Section title
   */
  title?: string;
  /**
   * Section description
   */
  description?: string;
  /**
   * Primary CTA text
   */
  ctaText?: string;
  /**
   * Primary CTA href
   */
  ctaHref?: string;
  /**
   * Secondary CTA text (optional)
   */
  secondaryCtaText?: string;
  /**
   * Secondary CTA href (optional)
   */
  secondaryCtaHref?: string;
  /**
   * Background variant
   */
  variant?: "primary" | "secondary" | "dark";
}

/**
 * CTASection Component
 *
 * Call-to-action section with prominent heading and buttons.
 * Can be used for customer or vendor conversion.
 *
 * @example
 * ```tsx
 * <CTASection
 *   title="Ready to Get Started?"
 *   description="Join hundreds of satisfied customers"
 *   ctaText="Browse Food Trucks"
 *   ctaHref="/search"
 *   variant="primary"
 * />
 * ```
 */
export const CTASection: React.FC<CTASectionProps> = ({
  title = "Ready to Get Started?",
  description = "Join hundreds of satisfied customers who trust Fleet Feast for their catering needs.",
  ctaText = "Browse Food Trucks",
  ctaHref = "/search",
  secondaryCtaText,
  secondaryCtaHref,
  variant = "primary",
}) => {
  const bgClasses = {
    primary: "bg-primary text-white",
    secondary: "bg-gray-100 text-gray-900",
    dark: "bg-gray-900 text-white",
  };

  const buttonVariant = variant === "secondary" ? "primary" : "default";

  return (
    <section className={`py-16 md:py-24 ${bgClasses[variant]}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          {title}
        </h2>

        {/* Description */}
        <p
          className={`text-lg md:text-xl mb-10 ${
            variant === "secondary" ? "text-gray-600" : "opacity-90"
          }`}
        >
          {description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={ctaHref}>
            <Button
              variant={buttonVariant}
              size="lg"
              className={`w-full sm:w-auto px-8 py-3 text-lg ${
                variant === "primary"
                  ? "bg-white text-primary hover:bg-gray-100"
                  : ""
              }`}
            >
              {ctaText}
            </Button>
          </Link>

          {secondaryCtaText && secondaryCtaHref && (
            <Link href={secondaryCtaHref}>
              <Button
                variant="outline"
                size="lg"
                className={`w-full sm:w-auto px-8 py-3 text-lg ${
                  variant === "primary"
                    ? "border-white text-white hover:bg-white/10"
                    : ""
                }`}
              >
                {secondaryCtaText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
