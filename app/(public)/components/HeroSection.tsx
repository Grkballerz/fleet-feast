"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: {
    text: string;
    href: string;
  };
  ctaSecondary?: {
    text: string;
    href: string;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  headline = "Find the Perfect Food Truck for Your Event",
  subheadline = "Book trusted food trucks for corporate events, weddings, parties, and more",
  ctaPrimary = { text: "Find Food Trucks", href: "/search" },
  ctaSecondary = { text: "Become a Vendor", href: "/vendor/apply" },
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Hero Image with Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <Image
            src="/images/generated/hero-bg.webp"
            alt="Food truck festival"
            fill
            className="object-cover opacity-60 mix-blend-overlay"
            priority
            unoptimized
          />
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-3xl animate-pulse delay-500" />

        {/* Floating Food Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['🌮', '🍔', '🍕', '🌯', '🍜', '🥗'].map((emoji, i) => (
            <span
              key={i}
              className="absolute text-4xl opacity-20 animate-float"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i}s`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-neo neo-glass-brutal neo-shadow text-white/90 text-sm mb-8 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>100+ Food Trucks Available in NYC</span>
          </div>

          {/* Headline */}
          <h1 className="neo-heading-xl text-white mb-6 leading-tight">
            <span className="block">Find the Perfect</span>
            <span className="block bg-gradient-to-r from-orange-400 via-red-400 to-primary bg-clip-text text-transparent">
              Food Truck
            </span>
            <span className="block">for Your Event</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl lg:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            {subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href={ctaPrimary.href}>
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto neo-btn-primary px-8 py-4 text-lg rounded-neo"
              >
                <span className="flex items-center gap-2">
                  {ctaPrimary.text}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            </Link>
            <Link href={ctaSecondary.href}>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto neo-btn-secondary px-8 py-4 text-lg rounded-neo"
              >
                {ctaSecondary.text}
              </Button>
            </Link>
          </div>

          {/* Trust Indicators - Neo-brutalist Glass Cards */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            {[
              { icon: "✓", text: "Verified Vendors", color: "from-green-400 to-emerald-500" },
              { icon: "🔒", text: "Secure Payments", color: "from-blue-400 to-cyan-500" },
              { icon: "⭐", text: "4.8 Average Rating", color: "from-yellow-400 to-orange-500" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-5 py-3 rounded-neo neo-glass-brutal neo-shadow text-white transition-all duration-300 hover:neo-shadow-lg hover:scale-105"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <span className={`flex items-center justify-center w-8 h-8 rounded-neo bg-gradient-to-br ${item.color} text-white text-sm font-bold neo-border`}>
                  {item.icon}
                </span>
                <span className="text-sm font-bold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-white/60 animate-pulse" />
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};
