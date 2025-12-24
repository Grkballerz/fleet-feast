"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  TruckIcon,
  Search,
  FileText,
  FileCheck,
  CreditCard,
  PartyPopper,
  Star,
  Shield,
  CheckCircle2,
  Award,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  DollarSign,
  Calendar,
  ThumbsUp,
  Settings,
  Bell,
  Banknote,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

export function HowItWorksClient() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
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

  const customerSteps = [
    {
      icon: Search,
      title: "Browse & Discover",
      description: "Search food trucks by cuisine, availability, location, and price. Filter by dietary needs and read reviews from past events.",
      gradient: "from-blue-500 to-cyan-500",
      color: "text-blue-500",
    },
    {
      icon: FileText,
      title: "Submit Inquiry",
      description: "Tell us about your event: date, location, number of guests, cuisine preferences, and budget. Takes less than 5 minutes.",
      gradient: "from-purple-500 to-pink-500",
      color: "text-purple-500",
    },
    {
      icon: FileCheck,
      title: "Receive Proposal",
      description: "Vendor sends a custom quote within 48 hours with menu options, pricing, and availability confirmation.",
      gradient: "from-amber-500 to-orange-500",
      color: "text-amber-500",
    },
    {
      icon: CreditCard,
      title: "Book & Pay Securely",
      description: "Pay through our secure escrow system. Funds are held safely until after your event is completed successfully.",
      gradient: "from-green-500 to-emerald-500",
      color: "text-green-500",
    },
    {
      icon: PartyPopper,
      title: "Enjoy Your Event",
      description: "Food truck arrives on time with fresh ingredients. Your guests enjoy delicious food while you relax.",
      gradient: "from-rose-500 to-pink-500",
      color: "text-rose-500",
    },
    {
      icon: Star,
      title: "Leave Review",
      description: "Share your experience and help other event planners. Your feedback helps maintain our quality standards.",
      gradient: "from-yellow-500 to-orange-500",
      color: "text-yellow-500",
    },
  ];

  const vendorSteps = [
    {
      icon: CheckCircle2,
      title: "Apply & Get Verified",
      description: "Submit your business documents, insurance, health permits, and photos. We review and verify within 5-7 business days.",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      icon: Settings,
      title: "Set Up Profile",
      description: "Add your menu, photos, pricing, service areas, and availability calendar. Make your profile stand out.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Bell,
      title: "Receive Bookings",
      description: "Get notified of inquiry requests. Review event details and send custom proposals. Accept or decline bookings.",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Banknote,
      title: "Get Paid",
      description: "Receive payment within 7 days after successful event completion. Track all earnings in your vendor dashboard.",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const trustFeatures = [
    {
      icon: Shield,
      title: "Verified Vendors",
      description: "All vendors pass rigorous verification including insurance, permits, and background checks.",
    },
    {
      icon: DollarSign,
      title: "Escrow Payments",
      description: "Secure payment system protects both parties. Funds held until successful event completion.",
    },
    {
      icon: Star,
      title: "Review System",
      description: "Transparent ratings and reviews help you make informed decisions and maintain quality.",
    },
    {
      icon: Award,
      title: "Platform Guarantee",
      description: "We mediate disputes fairly and offer refunds when service doesn't meet our standards.",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-float delay-500" />
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-float delay-300" />
            </div>
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in-up">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-white/90 text-sm font-medium">Simple, Secure, Seamless</span>
            </div>

            <h1 className="neo-heading-xl text-white mb-6 animate-fade-in-up delay-100">
              How{" "}
              <span className="bg-gradient-to-r from-primary via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Fleet Feast
              </span>{" "}
              Works
            </h1>

            <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-2xl mx-auto animate-fade-in-up delay-200">
              Book amazing food trucks for your events in minutes. Verified vendors, secure payments, unforgettable experiences.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-in-up delay-300">
              <Link href="/search" className="neo-btn-primary px-8 py-4">
                Browse Trucks
              </Link>
              <Link href="/vendor/apply" className="neo-btn-secondary px-8 py-4">
                Become a Vendor
              </Link>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
            </div>
          </div>
        </section>

        {/* For Customers Section */}
        <section
          id="customers"
          ref={setRef("customers")}
          className="py-24 bg-white"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-neo mb-4">
                For Customers
              </span>
              <h2 className="neo-heading text-4xl md:text-5xl text-gray-900 mb-4">
                Book Your Event in{" "}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  6 Simple Steps
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From browsing to booking, we've made event catering effortless.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {customerSteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`group relative transform transition-all duration-700 ${
                    visibleSections.has("customers")
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center neo-shadow z-10">
                    <span className="text-lg font-bold text-gray-900">{index + 1}</span>
                  </div>

                  {/* Card */}
                  <div className="h-full p-8 neo-card-glass rounded-neo neo-shadow hover:neo-shadow-lg transition-all duration-300">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-neo bg-gradient-to-br ${step.gradient} mb-6 neo-shadow transform group-hover:scale-110 transition-transform duration-300`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="neo-heading text-2xl text-gray-900 mb-4 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>

                  {/* Connector Arrow (not on last item in row) */}
                  {index < customerSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className={`w-8 h-8 ${step.color} opacity-30`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Vendors Section */}
        <section
          id="vendors"
          ref={setRef("vendors")}
          className="py-24 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-neo mb-4">
                For Vendors
              </span>
              <h2 className="neo-heading text-4xl md:text-5xl text-gray-900 mb-4">
                Grow Your Business{" "}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  With Fleet Feast
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join hundreds of food truck vendors getting more bookings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {vendorSteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`relative transform transition-all duration-700 ${
                    visibleSections.has("vendors")
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Timeline Connector */}
                  <div className="absolute top-0 left-8 w-0.5 h-full bg-gradient-to-b from-primary via-orange-500 to-yellow-500 -z-10 hidden lg:block" />

                  {/* Step Number Badge */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center neo-shadow">
                      <span className="text-2xl font-bold bg-gradient-to-br from-primary to-orange-500 bg-clip-text text-transparent">
                        {index + 1}
                      </span>
                    </div>
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-neo bg-gradient-to-br ${step.gradient} flex items-center justify-center neo-shadow`}
                    >
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="ml-4">
                    <h3 className="neo-heading text-2xl text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Vendor CTA */}
            <div className="mt-16 text-center">
              <Link
                href="/vendor/apply"
                className="inline-flex items-center gap-2 neo-btn-primary px-8 py-4 text-lg"
              >
                <TruckIcon className="w-6 h-6" />
                Start Your Vendor Application
              </Link>
            </div>
          </div>
        </section>

        {/* Trust & Safety Section */}
        <section
          id="trust"
          ref={setRef("trust")}
          className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(234,88,12,0.15),transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(234,88,12,0.1),transparent_50%)]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-white/10 text-primary text-sm font-semibold rounded-neo mb-4 backdrop-blur-sm">
                Trust & Safety
              </span>
              <h2 className="neo-heading text-4xl md:text-5xl text-white mb-4">
                Your{" "}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  Security
                </span>{" "}
                Is Our Priority
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                We've built comprehensive safeguards to protect customers and vendors at every step.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {trustFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`text-center transform transition-all duration-700 ${
                    visibleSections.has("trust")
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-neo bg-gradient-to-br from-primary/20 to-orange-500/20 backdrop-blur-sm border border-white/10 mb-6 neo-shadow">
                    <feature.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Comparison Section */}
        <section
          id="comparison"
          ref={setRef("comparison")}
          className="py-24 bg-white"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="neo-heading text-4xl md:text-5xl text-gray-900 mb-4">
                Traditional vs{" "}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  Fleet Feast
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                See how we make event catering faster, safer, and easier.
              </p>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto transform transition-all duration-1000 ${
                visibleSections.has("comparison")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            >
              {/* Traditional Way */}
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gray-100 rounded-neo opacity-50" />
                <div className="relative p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-gray-500" />
                    Traditional Way
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-gray-600">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-gray-600">1</span>
                      </div>
                      <span>Search Google for food trucks</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-gray-600">2</span>
                      </div>
                      <span>Call multiple vendors individually</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-gray-600">3</span>
                      </div>
                      <span>Verify insurance and permits yourself</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-gray-600">4</span>
                      </div>
                      <span>Negotiate pricing via email/phone</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-gray-600">5</span>
                      </div>
                      <span>Send check or cash (no protection)</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-gray-600">6</span>
                      </div>
                      <span>Hope everything goes smoothly</span>
                    </li>
                  </ul>
                  <div className="mt-6 text-center">
                    <span className="text-sm text-gray-500 font-medium">Takes 1-2 weeks</span>
                  </div>
                </div>
              </div>

              {/* Fleet Feast Way */}
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-neo" />
                <div className="relative p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Fleet Feast Way
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-gray-700">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-white font-bold">1</span>
                      </div>
                      <span className="font-medium">Browse verified food trucks in one place</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-white font-bold">2</span>
                      </div>
                      <span className="font-medium">Submit one inquiry form (5 minutes)</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-white font-bold">3</span>
                      </div>
                      <span className="font-medium">All vendors pre-verified by us</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-white font-bold">4</span>
                      </div>
                      <span className="font-medium">Receive custom proposal within 48 hours</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-white font-bold">5</span>
                      </div>
                      <span className="font-medium">Pay securely with escrow protection</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-white font-bold">6</span>
                      </div>
                      <span className="font-medium">Platform guarantee backs your event</span>
                    </li>
                  </ul>
                  <div className="mt-6 text-center">
                    <span className="text-sm font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                      Takes 2-3 days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="cta"
          ref={setRef("cta")}
          className="py-24 bg-gray-50 relative overflow-hidden"
        >
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-full blur-3xl" />
          </div>

          <div
            className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transform transition-all duration-1000 ${
              visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-8">
              <ThumbsUp className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">Ready to Get Started?</span>
            </div>

            <h2 className="neo-heading text-4xl md:text-5xl text-gray-900 mb-6">
              Let's Make Your Event{" "}
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                Unforgettable
              </span>
            </h2>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Join thousands of happy customers and vendors who trust Fleet Feast for their events.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="group neo-btn-primary inline-flex items-center justify-center gap-2 px-8 py-4"
              >
                <Search className="w-5 h-5 group-hover:animate-pulse" />
                Browse Food Trucks
              </Link>
              <Link
                href="/vendor/apply"
                className="neo-btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4"
              >
                <TruckIcon className="w-5 h-5" />
                Become a Vendor
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Footer */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "500+", label: "Food Trucks", icon: TruckIcon },
                { value: "10K+", label: "Events Catered", icon: Calendar },
                { value: "4.8", label: "Average Rating", icon: Star },
                { value: "50+", label: "Cities Served", icon: Users },
              ].map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-orange-500/10 mb-4">
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
