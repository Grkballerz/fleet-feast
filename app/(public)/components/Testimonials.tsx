"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Rating } from "@/components/ui/Rating";
import { Avatar } from "@/components/ui/Avatar";

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  rating: number;
  text: string;
  eventType?: string;
}

export interface TestimonialsProps {
  testimonials?: Testimonial[];
  title?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Event Coordinator, Tech Corp",
    rating: 5,
    text: "Fleet Feast made booking food trucks for our company picnic incredibly easy. The vendors were professional, the food was amazing, and our team loved the variety!",
    eventType: "Corporate Event",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Wedding Planner",
    rating: 5,
    text: "I've used Fleet Feast for multiple weddings now. The secure payment system gives my clients peace of mind, and the food trucks always show up on time with delicious food.",
    eventType: "Wedding",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "HR Manager, StartupXYZ",
    rating: 5,
    text: "Great selection of food trucks and easy booking process. Our employees look forward to our monthly food truck Fridays thanks to Fleet Feast!",
    eventType: "Company Lunch",
  },
  {
    id: "4",
    name: "James Wilson",
    role: "Festival Organizer",
    rating: 5,
    text: "Managing multiple food trucks for our street festival was a breeze with Fleet Feast. The platform's coordination tools are exactly what event organizers need.",
    eventType: "Street Festival",
  },
  {
    id: "5",
    name: "Lisa Park",
    role: "Private Party Host",
    rating: 5,
    text: "Booked a taco truck for my daughter's graduation party. Everyone raved about the food! The booking process was simple and the truck arrived exactly on time.",
    eventType: "Graduation Party",
  },
];

export const Testimonials: React.FC<TestimonialsProps> = ({
  testimonials = defaultTestimonials,
  title = "What Our Customers Say",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Stars Pattern - using deterministic positions based on index */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(20)].map((_, i) => {
          // Deterministic pseudo-random based on index to avoid hydration mismatch
          const left = ((i * 37 + 13) % 100);
          const top = ((i * 53 + 7) % 100);
          const delay = (i * 0.1) % 2;
          const size = 12 + (i % 5) * 3;
          return (
            <div
              key={i}
              className="absolute text-yellow-400 animate-pulse"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                fontSize: `${size}px`,
              }}
            >
              ★
            </div>
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-neo neo-glass-brutal-primary neo-shadow-primary bg-white/10 text-gray-900 text-sm font-bold mb-4">
            ⭐ Customer Reviews
          </span>
          <h2 className="neo-heading-xl text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-medium">
            Join thousands of satisfied customers who trust Fleet Feast for their event catering
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Testimonial Card */}
          <div className="flex justify-center">
            <div className="max-w-4xl w-full">
              <div className="relative neo-glass-brutal-primary rounded-neo p-8 md:p-12 neo-shadow-primary-lg">
                {/* Quote Icon */}
                <div className="absolute -top-6 left-8 text-6xl text-primary/30 neo-heading">"</div>

                {/* Rating Stars */}
                <div className="flex justify-center mb-6">
                  <Rating
                    value={testimonials[activeIndex].rating}
                    readOnly
                    size="lg"
                  />
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-xl md:text-2xl text-gray-900 text-center leading-relaxed mb-8 font-medium">
                  "{testimonials[activeIndex].text}"
                </blockquote>

                {/* Customer Info */}
                <div className="flex flex-col items-center">
                  <Avatar
                    src={testimonials[activeIndex].avatar}
                    alt={testimonials[activeIndex].name}
                    size="lg"
                    fallback={testimonials[activeIndex].name.charAt(0)}
                    className="ring-4 ring-white/20 mb-4"
                  />
                  <div className="text-center">
                    <div className="neo-heading text-gray-900 text-lg">
                      {testimonials[activeIndex].name}
                    </div>
                    {testimonials[activeIndex].role && (
                      <div className="text-gray-700 text-sm font-medium">
                        {testimonials[activeIndex].role}
                      </div>
                    )}
                    {testimonials[activeIndex].eventType && (
                      <div className="inline-block mt-2 px-3 py-1 rounded-neo bg-primary/20 text-primary text-xs font-bold neo-border-thin">
                        {testimonials[activeIndex].eventType}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quote Icon End */}
                <div className="absolute -bottom-6 right-8 text-6xl text-primary/30 rotate-180 neo-heading">"</div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous testimonial"
            className="absolute -left-4 xl:-left-14 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-neo neo-card-glass neo-shadow flex items-center justify-center text-gray-600 hover:text-primary hover:neo-shadow-lg transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next testimonial"
            className="absolute -right-4 xl:-right-14 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-neo neo-card-glass neo-shadow flex items-center justify-center text-gray-600 hover:text-primary hover:neo-shadow-lg transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`transition-all duration-300 rounded-neo neo-border-thin ${
                  index === activeIndex
                    ? "w-8 h-2 bg-primary neo-shadow"
                    : "w-2 h-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "500+", label: "Events Booked", icon: "🎉" },
            { value: "100+", label: "Food Trucks", icon: "🚚" },
            { value: "4.8", label: "Average Rating", icon: "⭐" },
            { value: "98%", label: "Satisfaction", icon: "💯" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-neo neo-glass-brutal neo-shadow hover:neo-shadow-lg transition-all duration-300 group"
            >
              <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl neo-heading text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-gray-900 text-sm font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
