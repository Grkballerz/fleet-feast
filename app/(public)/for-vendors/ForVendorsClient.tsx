"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  TruckIcon,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Shield,
  Star,
  TrendingUp,
  FileCheck,
  MessageSquare,
  BarChart3,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  Zap,
  BadgeCheck,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

export function ForVendorsClient() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const setRef = (id: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
  };

  const benefits = [
    {
      icon: Calendar,
      title: "More Bookings",
      description: "Access thousands of event planners actively seeking food trucks for corporate events, weddings, festivals, and private parties.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: DollarSign,
      title: "Reliable Payments",
      description: "Get paid 7 days after each event via our secure escrow system. No more chasing down payments or dealing with bounced checks.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Easy Management",
      description: "Manage your calendar, bookings, inquiries, and messages all in one intuitive dashboard. Track your revenue and growth.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: BadgeCheck,
      title: "Build Reputation",
      description: "Earn a verified badge, collect customer reviews, and build your rating. Top-rated vendors get featured placement.",
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Apply",
      description: "Submit your application with business licenses, insurance, and health permits.",
      icon: FileCheck,
      color: "text-blue-500",
      bgColor: "bg-blue-500",
    },
    {
      number: 2,
      title: "Get Verified",
      description: "Our team reviews your documents and credentials within 2-3 business days.",
      icon: Shield,
      color: "text-green-500",
      bgColor: "bg-green-500",
    },
    {
      number: 3,
      title: "Create Profile",
      description: "Build your profile with photos, menu, pricing, and service details.",
      icon: Star,
      color: "text-purple-500",
      bgColor: "bg-purple-500",
    },
    {
      number: 4,
      title: "Receive Bookings",
      description: "Start getting booking requests and inquiries from event planners.",
      icon: MessageSquare,
      color: "text-orange-500",
      bgColor: "bg-orange-500",
    },
    {
      number: 5,
      title: "Get Paid",
      description: "Deliver amazing food, collect reviews, and get paid reliably every time.",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500",
    },
  ];

  const requirements = [
    { icon: FileCheck, text: "Valid business license" },
    { icon: Shield, text: "Health department permits" },
    { icon: FileCheck, text: "General liability insurance ($1M minimum)" },
    { icon: BadgeCheck, text: "Food handler certifications for all staff" },
    { icon: Star, text: "High-quality photos of your truck and food" },
    { icon: TruckIcon, text: "Well-maintained, clean food truck" },
  ];

  const testimonials = [
    {
      name: "Maria Garcia",
      truck: "Taco Paradise",
      quote: "Fleet Feast tripled my bookings in the first 3 months. The platform is easy to use and customers love the secure payment system.",
      rating: 5,
      avatar: "🌮",
      gradient: "from-orange-500 to-red-500",
    },
    {
      name: "James Chen",
      truck: "Dragon Bites",
      quote: "Best decision for my business. I went from struggling to find gigs to having a fully booked calendar. The verified badge really builds trust.",
      rating: 5,
      avatar: "🥟",
      gradient: "from-red-500 to-pink-500",
    },
    {
      name: "Sarah Johnson",
      truck: "Sweet Wheels",
      quote: "The analytics dashboard helps me understand my business better. Love seeing my revenue grow and getting reliable payments on schedule.",
      rating: 5,
      avatar: "🧁",
      gradient: "from-pink-500 to-purple-500",
    },
  ];

  const faqs = [
    {
      question: "How much does it cost to join?",
      answer: "There are no upfront fees to join Fleet Feast. We charge a 10% platform fee split between customers (5%) and vendors (5%). You only pay when you get booked.",
    },
    {
      question: "How long does verification take?",
      answer: "Most applications are reviewed within 2-3 business days. Make sure all your documents are current and clearly legible to speed up the process.",
    },
    {
      question: "When do I get paid?",
      answer: "Payment is released 7 days after the event date via direct deposit. Our escrow system ensures you always get paid for completed bookings.",
    },
    {
      question: "Can I set my own prices?",
      answer: "Yes! You have complete control over your pricing. Set different rates for different service types, guest counts, and event durations.",
    },
    {
      question: "What if a customer cancels?",
      answer: "Our cancellation policy protects vendors. Cancellations within 48 hours of the event result in full payment to the vendor. Earlier cancellations follow a tiered refund schedule.",
    },
    {
      question: "Do I need insurance?",
      answer: "Yes, general liability insurance with at least $1M coverage is required. This protects you, the customer, and the platform.",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-float delay-500" />
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-float delay-300" />
            </div>
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in-up">
              <TruckIcon className="w-5 h-5 text-primary" />
              <span className="text-white/90 text-sm font-medium">Join 500+ Verified Food Truck Vendors</span>
            </div>

            <h1 className="neo-heading-xl text-white mb-6 animate-fade-in-up delay-100">
              Grow Your Food Truck Business with{" "}
              <span className="bg-gradient-to-r from-primary via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Fleet Feast
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto mb-12 animate-fade-in-up delay-200">
              Connect with event planners actively seeking food trucks. Manage bookings, grow your reputation, and get paid reliably.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link href="/vendor/apply" className="neo-btn-primary px-8 py-4 text-lg">
                Apply Now
              </Link>
              <a href="#how-it-works" className="neo-btn-secondary px-8 py-4 text-lg">
                See How It Works
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-white/60 text-sm animate-fade-in-up delay-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No upfront fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Verified badge</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Secure payments</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" ref={setRef("benefits")} className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-neo mb-4">
                Why Join Fleet Feast
              </span>
              <h2 className="neo-heading text-4xl md:text-5xl text-gray-900">
                Everything You Need to{" "}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  Succeed
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className={`group relative p-8 neo-card-glass rounded-neo neo-shadow transition-all duration-500 transform hover:scale-105 ${
                    visibleSections.has("benefits")
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-neo bg-gradient-to-br ${benefit.gradient} mb-6 neo-shadow transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="neo-heading text-2xl text-gray-900 mb-4 group-hover:text-primary transition-colors">
                    {benefit.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" ref={setRef("how-it-works")} className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-neo mb-4">
                Simple Process
              </span>
              <h2 className="neo-heading text-4xl md:text-5xl text-gray-900">
                How It Works for{" "}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  Vendors
                </span>
              </h2>
            </div>

            <div className="relative">
              {/* Timeline Line - Desktop */}
              <div className="hidden md:block absolute left-0 right-0 top-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />

              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    className={`relative transform transition-all duration-700 ${
                      visibleSections.has("how-it-works")
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-12"
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {/* Step Number Circle */}
                    <div className={`relative z-10 w-16 h-16 mx-auto mb-6 rounded-full ${step.bgColor} flex items-center justify-center neo-shadow`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Card */}
                    <div className="neo-card-glass rounded-neo p-6 text-center neo-shadow">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-gray-50 flex items-center justify-center">
                        <span className={`text-xl font-bold ${step.color}`}>{step.number}</span>
                      </div>

                      <h3 className="neo-heading text-xl text-gray-900 mb-3 mt-2">
                        {step.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Section */}
        <section id="earnings" ref={setRef("earnings")} className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.2),transparent_50%)]" />
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(234,88,12,0.15),transparent_50%)]" />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div
              className={`text-center transform transition-all duration-1000 ${
                visibleSections.has("earnings")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-8">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-white/90 font-medium">Transparent Pricing</span>
              </div>

              <h2 className="neo-heading text-4xl md:text-5xl text-white mb-6">
                Simple, Fair{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Commission
                </span>
              </h2>

              <div className="max-w-2xl mx-auto mb-12">
                <div className="neo-card-glass rounded-neo p-8 neo-shadow">
                  <div className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4">
                    10%
                  </div>
                  <div className="text-xl text-white/90 mb-6">Total Platform Fee</div>
                  <div className="text-white/70 leading-relaxed mb-6">
                    Split evenly: 5% paid by customer, 5% paid by vendor
                  </div>

                  <div className="border-t border-white/10 pt-6 space-y-3">
                    <div className="flex items-center justify-between text-white/80">
                      <span>Customer booking: $1,000</span>
                      <span className="font-semibold">$1,000</span>
                    </div>
                    <div className="flex items-center justify-between text-white/80">
                      <span>Platform fee (5%)</span>
                      <span className="font-semibold text-red-400">-$50</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex items-center justify-between text-white text-lg font-bold">
                      <span>You receive</span>
                      <span className="text-green-400">$950</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="neo-card-glass rounded-neo p-6 backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-white/90 font-medium">No Hidden Fees</div>
                </div>
                <div className="neo-card-glass rounded-neo p-6 backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-white/90 font-medium">No Monthly Charges</div>
                </div>
                <div className="neo-card-glass rounded-neo p-6 backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-white/90 font-medium">Only Pay When Booked</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section id="requirements" ref={setRef("requirements")} className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-neo mb-4">
                What You Need
              </span>
              <h2 className="neo-heading text-4xl md:text-5xl text-gray-900">
                Vendor{" "}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  Requirements
                </span>
              </h2>
              <p className="text-lg text-gray-600 mt-4">
                To maintain quality and trust, all vendors must meet these standards
              </p>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 transform transition-all duration-1000 ${
                visibleSections.has("requirements")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            >
              {requirements.map((req, index) => (
                <div
                  key={req.text}
                  className="flex items-start gap-4 p-6 neo-card-glass rounded-neo neo-shadow hover:scale-105 transition-transform duration-300"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-neo bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center neo-shadow">
                    <req.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{req.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">
                Don't have everything yet? We can guide you through the process.
              </p>
              <Link href="/contact" className="neo-btn-secondary inline-flex items-center gap-2 px-6 py-3">
                <Users className="w-5 h-5" />
                Get Help
              </Link>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section id="testimonials" ref={setRef("testimonials")} className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-neo mb-4">
                Success Stories
              </span>
              <h2 className="neo-heading text-4xl md:text-5xl text-gray-900">
                What Our Vendors{" "}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  Are Saying
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.name}
                  className={`group relative p-8 neo-card-glass rounded-neo neo-shadow transition-all duration-700 hover:scale-105 ${
                    visibleSections.has("testimonials")
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-600 leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-2xl neo-shadow`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.truck}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" ref={setRef("faq")} className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-neo mb-4">
                Common Questions
              </span>
              <h2 className="neo-heading text-4xl md:text-5xl text-gray-900">
                Frequently Asked{" "}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
            </div>

            <div
              className={`space-y-4 transform transition-all duration-1000 ${
                visibleSections.has("faq")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            >
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="neo-card-glass rounded-neo neo-shadow overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">
                Have more questions?
              </p>
              <Link href="/faq" className="neo-btn-secondary inline-flex items-center gap-2 px-6 py-3">
                View Full FAQ
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" ref={setRef("cta")} className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-primary/30 to-orange-500/30 rounded-full blur-3xl" />
          </div>

          <div
            className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transform transition-all duration-1000 ${
              visibleSections.has("cta")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-8">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white/90 font-medium">Ready to Grow Your Business?</span>
            </div>

            <h2 className="neo-heading text-4xl md:text-5xl text-white mb-6">
              Join Fleet Feast{" "}
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                Today
              </span>
            </h2>

            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Start receiving more bookings, building your reputation, and getting paid reliably. No upfront costs, just results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/vendor/apply"
                className="group neo-btn-primary inline-flex items-center justify-center gap-2 px-10 py-5 text-lg"
              >
                <TruckIcon className="w-6 h-6 group-hover:animate-bounce" />
                Apply Now
              </Link>
              <Link
                href="/contact"
                className="neo-btn-secondary inline-flex items-center justify-center gap-2 px-10 py-5 text-lg"
              >
                <MessageSquare className="w-6 h-6" />
                Contact Us
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-white/60 text-sm">Grow Revenue</div>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-white/60 text-sm">Secure Platform</div>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-white/60 text-sm">Save Time</div>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="text-white/60 text-sm">Join Community</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
