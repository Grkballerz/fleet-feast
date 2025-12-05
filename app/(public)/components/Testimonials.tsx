"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { Avatar } from "@/components/ui/Avatar";

export interface Testimonial {
  /**
   * Testimonial ID
   */
  id: string;
  /**
   * Customer name
   */
  name: string;
  /**
   * Customer role/company
   */
  role?: string;
  /**
   * Customer avatar URL
   */
  avatar?: string;
  /**
   * Rating (1-5)
   */
  rating: number;
  /**
   * Testimonial text
   */
  text: string;
  /**
   * Event type
   */
  eventType?: string;
}

export interface TestimonialsProps {
  /**
   * Array of testimonials to display
   */
  testimonials?: Testimonial[];
  /**
   * Section title
   */
  title?: string;
}

// Default testimonials for demo
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
    rating: 4.5,
    text: "Great selection of food trucks and easy booking process. Our employees look forward to our monthly food truck Fridays thanks to Fleet Feast!",
    eventType: "Company Lunch",
  },
];

/**
 * Testimonials Component
 *
 * Displays customer testimonials in a grid layout with ratings and customer info.
 * Social proof section for homepage.
 *
 * @example
 * ```tsx
 * <Testimonials
 *   title="What Our Customers Say"
 *   testimonials={testimonials}
 * />
 * ```
 */
export const Testimonials: React.FC<TestimonialsProps> = ({
  testimonials = defaultTestimonials,
  title = "What Our Customers Say",
}) => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Fleet Feast for their event catering
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6">
              {/* Rating */}
              <div className="mb-4">
                <Rating value={testimonial.rating} readonly size="sm" />
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </blockquote>

              {/* Customer Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <Avatar
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  size="md"
                  fallback={testimonial.name.charAt(0)}
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  {testimonial.role && (
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  )}
                  {testimonial.eventType && (
                    <div className="text-xs text-gray-500 mt-1">
                      {testimonial.eventType}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              500+
            </div>
            <div className="text-gray-600">Events Booked</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              100+
            </div>
            <div className="text-gray-600">Food Trucks</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              4.8
            </div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              98%
            </div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};
