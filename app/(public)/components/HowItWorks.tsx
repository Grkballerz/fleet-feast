"use client";

import React, { useEffect, useRef, useState } from "react";

export interface HowItWorksStep {
  number: number;
  title: string;
  description: string;
  icon?: string;
}

export interface HowItWorksProps {
  steps?: HowItWorksStep[];
  title?: string;
}

const defaultSteps: HowItWorksStep[] = [
  {
    number: 1,
    title: "Search & Compare",
    description: "Browse food trucks by cuisine, availability, and reviews. Filter by your event type and location.",
    icon: "🔍",
  },
  {
    number: 2,
    title: "Book & Pay Securely",
    description: "Request your date, confirm details, and pay securely through our protected escrow system.",
    icon: "📅",
  },
  {
    number: 3,
    title: "Enjoy Your Event",
    description: "Your food truck arrives ready to serve delicious food. Rate and review your experience!",
    icon: "🎉",
  },
];

const stepColors = [
  { bg: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/30" },
  { bg: "from-primary to-orange-500", shadow: "shadow-primary/30" },
  { bg: "from-green-500 to-emerald-500", shadow: "shadow-green-500/30" },
];

export const HowItWorks: React.FC<HowItWorksProps> = ({
  steps = defaultSteps,
  title = "How It Works",
}) => {
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([]);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = stepRefs.current.map((ref, index) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSteps(prev => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer, index) => {
        if (observer && stepRefs.current[index]) {
          observer.disconnect();
        }
      });
    };
  }, []);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-neo neo-glass-brutal neo-shadow bg-primary/10 text-primary text-sm font-bold mb-4">
            Simple Process
          </span>
          <h2 className="neo-heading-xl text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Book your perfect food truck in three easy steps
          </p>
        </div>

        {/* Steps Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connector Lines (Desktop) */}
          <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gray-200">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-primary to-green-500 transform origin-left transition-all duration-1000 ease-out"
              style={{ transform: `scaleX(${visibleSteps.filter(Boolean).length / 3})` }}
            />
          </div>

          {steps.map((step, index) => (
            <div
              key={step.number}
              ref={el => { stepRefs.current[index] = el; }}
              className={`relative transition-all duration-700 ${
                visibleSteps[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Step Card */}
              <div className="text-center group">
                {/* Animated Icon Circle */}
                <div className={`relative inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-neo bg-gradient-to-br ${stepColors[index].bg} text-white text-4xl mb-8 neo-shadow-lg ${stepColors[index].shadow} transition-all duration-500 group-hover:scale-110 group-hover:neo-shadow-xl neo-border`}>
                  {/* Pulse Ring */}
                  <div className="absolute inset-0 rounded-neo bg-inherit opacity-20 animate-ping" style={{ animationDuration: '2s' }} />
                  {/* Icon */}
                  <span className="relative z-10">{step.icon || step.number}</span>
                  {/* Step Number Badge */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-neo bg-white neo-shadow neo-border flex items-center justify-center text-gray-900 font-bold text-sm">
                    {step.number}
                  </div>
                </div>

                {/* Step Content Card */}
                <div className="neo-card-glass rounded-neo p-6 neo-shadow hover:neo-shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl md:text-2xl neo-heading text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-neo bg-gradient-to-r from-gray-900 to-gray-800 text-white neo-border neo-shadow">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="font-bold">Ready in minutes</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="font-bold">100% Secure</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl">💯</span>
              <span className="font-bold">Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
