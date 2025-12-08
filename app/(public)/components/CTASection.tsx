"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export interface CTASectionProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
}

export const CTASection: React.FC<CTASectionProps> = ({
  title = "Ready to Get Started?",
  description = "Join hundreds of satisfied customers who trust Fleet Feast for their catering needs.",
  ctaText = "Browse Food Trucks",
  ctaHref = "/search",
  secondaryCtaText,
  secondaryCtaHref,
  variant = "gradient",
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary via-red-600 to-orange-500 transition-all duration-500"
        style={{
          backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
          backgroundSize: "400% 400%",
        }}
      />

      {/* Animated Mesh Gradient */}
      <div className="absolute inset-0 opacity-50">
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
            left: `${mousePosition.x - 20}%`,
            top: `${mousePosition.y - 20}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm animate-float"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${6 + i}s`,
            }}
          />
        ))}
      </div>

      {/* Glass Card Container */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="neo-glass-brutal-primary rounded-neo p-10 md:p-16 neo-shadow-primary-lg text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-neo neo-glass-brutal neo-shadow mb-8">
            <span className="text-4xl">🚚</span>
          </div>

          {/* Title */}
          <h2 className="neo-heading-xl text-white mb-6 leading-tight">
            {title}
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            {description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={ctaHref}>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto px-10 py-4 text-lg neo-btn bg-white text-primary hover:bg-gray-100 rounded-neo"
              >
                <span className="flex items-center gap-2">
                  {ctaText}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            </Link>

            {secondaryCtaText && secondaryCtaHref && (
              <Link href={secondaryCtaHref}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-10 py-4 text-lg neo-btn-secondary rounded-neo"
                >
                  {secondaryCtaText}
                </Button>
              </Link>
            )}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">No Hidden Fees</span>
            </div>
            <div className="w-px h-4 bg-white/30 hidden sm:block" />
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">Free Cancellation 7+ Days</span>
            </div>
            <div className="w-px h-4 bg-white/30 hidden sm:block" />
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">Secure Escrow Payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
