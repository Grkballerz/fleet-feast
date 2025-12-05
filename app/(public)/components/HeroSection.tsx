"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export interface HeroSectionProps {
  /**
   * Main headline text
   */
  headline?: string;
  /**
   * Subheadline text
   */
  subheadline?: string;
  /**
   * Primary CTA configuration
   */
  ctaPrimary?: {
    text: string;
    href: string;
  };
  /**
   * Secondary CTA configuration
   */
  ctaSecondary?: {
    text: string;
    href: string;
  };
}

/**
 * HeroSection Component
 *
 * Large hero section for the homepage with headline, subheadline, and dual CTAs.
 * Optimized for conversion with clear value proposition.
 *
 * @example
 * ```tsx
 * <HeroSection
 *   headline="Find the Perfect Food Truck for Your Event"
 *   subheadline="Book trusted food trucks for corporate events, weddings, parties, and more"
 *   ctaPrimary={{ text: "Find Food Trucks", href: "/search" }}
 *   ctaSecondary={{ text: "Become a Vendor", href: "/vendor/apply" }}
 * />
 * ```
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  headline = "Find the Perfect Food Truck for Your Event",
  subheadline = "Book trusted food trucks for corporate events, weddings, parties, and more",
  ctaPrimary = { text: "Find Food Trucks", href: "/search" },
  ctaSecondary = { text: "Become a Vendor", href: "/vendor/apply" },
}) => {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="hero-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="#B91C1C" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {headline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
            {subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={ctaPrimary.href}>
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8 py-3 text-lg"
              >
                {ctaPrimary.text}
              </Button>
            </Link>
            <Link href={ctaSecondary.href}>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-3 text-lg"
              >
                {ctaSecondary.text}
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Verified Vendors</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>100+ Food Trucks</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
