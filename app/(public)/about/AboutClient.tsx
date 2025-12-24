"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TruckIcon, Shield, Star, Clock, Users, Heart, Zap, Award, MapPin } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

export function AboutClient() {
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

  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Every vendor is verified, insured, and committed to quality. Our secure escrow payment system protects both parties.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Star,
      title: "Quality First",
      description: "We curate our vendor network to ensure consistently high quality. Customer reviews and ratings keep standards high.",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Clock,
      title: "Simplicity",
      description: "Event catering shouldn't be complicated. We streamline every step from search to payment to make booking effortless.",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const stats = [
    { value: "500+", label: "Food Trucks", icon: TruckIcon },
    { value: "10K+", label: "Events Catered", icon: Heart },
    { value: "4.8", label: "Average Rating", icon: Star },
    { value: "50+", label: "Cities", icon: MapPin },
  ];

  const team = [
    { name: "Sarah Chen", role: "Founder & CEO", emoji: "👩‍💼", gradient: "from-pink-500 to-rose-500" },
    { name: "Marcus Rodriguez", role: "Head of Operations", emoji: "👨‍💻", gradient: "from-blue-500 to-indigo-500" },
    { name: "Emily Park", role: "Vendor Relations", emoji: "👩‍🍳", gradient: "from-amber-500 to-orange-500" },
    { name: "David Thompson", role: "Tech Lead", emoji: "🧑‍💻", gradient: "from-green-500 to-emerald-500" },
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
            <TruckIcon className="w-5 h-5 text-primary" />
            <span className="text-white/90 text-sm font-medium">#1 Food Truck Marketplace</span>
          </div>

          <h1 className="neo-heading-xl text-white mb-6 animate-fade-in-up delay-100">
            About{" "}
            <span className="bg-gradient-to-r from-primary via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Fleet Feast
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-2xl mx-auto animate-fade-in-up delay-200">
            We're on a mission to make event catering delicious, easy, and stress-free by connecting you with the best food trucks.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-in-up delay-300">
            <Link
              href="/search"
              className="neo-btn-primary px-8 py-4"
            >
              Browse Trucks
            </Link>
            <Link
              href="/vendor/apply"
              className="neo-btn-secondary px-8 py-4"
            >
              Join as Vendor
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

      {/* Stats Section */}
      <section
        id="stats"
        ref={setRef("stats")}
        className="py-16 bg-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-orange-500/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center transform transition-all duration-700 ${
                  visibleSections.has("stats")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
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

      {/* Our Story */}
      <section
        id="story"
        ref={setRef("story")}
        className="py-24 bg-gray-50"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`transform transition-all duration-1000 ${
              visibleSections.has("story")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-neo mb-4">
                Our Story
              </span>
              <h2 className="neo-heading text-4xl md:text-5xl text-gray-900">
                How It All{" "}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  Started
                </span>
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-primary via-orange-500 to-yellow-500 rounded-full" />

              <div className="space-y-8 pl-8">
                <div className="relative">
                  <div className="absolute -left-10 top-2 w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50" />
                  <p className="text-lg text-gray-600 leading-relaxed">
                    <span className="text-2xl font-bold text-gray-900">Fleet Feast was born from a simple observation:</span>{" "}
                    booking food trucks for events was unnecessarily complicated. Event planners struggled to find reliable vendors, verify quality, and manage payments securely.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-10 top-2 w-4 h-4 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Meanwhile, talented food truck operators were missing out on opportunities because they were hard to discover. We set out to solve both problems by creating a trusted marketplace.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-10 top-2 w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Today, Fleet Feast connects hundreds of event planners with verified food truck vendors across the country, making every event unforgettable. Our platform handles everything from discovery to payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section
        id="values"
        ref={setRef("values")}
        className="py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-neo mb-4">
              Our Values
            </span>
            <h2 className="neo-heading text-4xl md:text-5xl text-gray-900">
              What Drives{" "}
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                Us Forward
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={value.title}
                className={`group relative p-8 neo-card-glass rounded-neo neo-shadow transition-all duration-500 transform ${
                  visibleSections.has("values")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-neo bg-gradient-to-br ${value.gradient} mb-6 neo-shadow transform group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="neo-heading text-2xl text-gray-900 mb-4 group-hover:text-primary transition-colors">
                  {value.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section
        id="team"
        ref={setRef("team")}
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
              Our Team
            </span>
            <h2 className="neo-heading text-4xl md:text-5xl text-white mb-4">
              Meet the{" "}
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                Fleet
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              We're a passionate team dedicated to revolutionizing event catering nationwide.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div
                key={member.name}
                className={`group text-center transform transition-all duration-700 ${
                  visibleSections.has("team")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`relative mx-auto w-32 h-32 mb-6 rounded-neo bg-gradient-to-br ${member.gradient} p-1 group-hover:scale-110 transition-transform duration-300 neo-shadow`}>
                  <div className="w-full h-full rounded-neo bg-gray-800 flex items-center justify-center text-5xl">
                    {member.emoji}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-white/60 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        ref={setRef("cta")}
        className="py-24 bg-white relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div
          className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transform transition-all duration-1000 ${
            visibleSections.has("cta")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-8">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">Ready to Join Us?</span>
          </div>

          <h2 className="neo-heading text-4xl md:text-5xl text-gray-900 mb-6">
            Let's Create Something{" "}
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Amazing Together
            </span>
          </h2>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Whether you're planning an event or operating a food truck, we'd love to work with you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="group neo-btn-primary inline-flex items-center justify-center gap-2 px-8 py-4"
            >
              <TruckIcon className="w-5 h-5 group-hover:animate-bounce" />
              Browse Food Trucks
            </Link>
            <Link
              href="/vendor/apply"
              className="neo-btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4"
            >
              <Award className="w-5 h-5" />
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="neo-heading text-3xl text-gray-900 mb-4">
            Have Questions?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Our team is here to help with any questions about our platform.
          </p>
          <Link
            href="/contact"
            className="neo-btn-primary inline-flex items-center gap-2 px-6 py-3"
          >
            <Users className="w-5 h-5" />
            Contact Us
          </Link>
        </div>
      </section>
    </div>
    </MainLayout>
  );
}
