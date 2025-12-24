"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  Share2,
  Database,
  Key,
  Globe,
  Cookie,
  Baby,
  FileText,
  Mail,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
}

export function PrivacyClient() {
  const [activeSection, setActiveSection] = useState<string>("");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const lastUpdated = "December 24, 2025";

  const sections: Section[] = [
    { id: "introduction", title: "Introduction", icon: Shield },
    { id: "information-collect", title: "Information We Collect", icon: Eye },
    { id: "how-we-use", title: "How We Use Information", icon: Database },
    { id: "information-sharing", title: "Information Sharing", icon: Share2 },
    { id: "data-retention", title: "Data Retention", icon: Calendar },
    { id: "data-security", title: "Data Security", icon: Lock },
    { id: "your-rights", title: "Your Rights", icon: Key },
    { id: "cookies", title: "Cookies", icon: Cookie },
    { id: "children", title: "Children's Privacy", icon: Baby },
    { id: "international", title: "International Transfers", icon: Globe },
    { id: "updates", title: "Policy Updates", icon: FileText },
    { id: "contact", title: "Contact Information", icon: Mail },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-100px 0px -66% 0px",
      }
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const setRef = (id: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
  };

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current.get(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-float delay-500" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-white/90 text-sm font-medium">
                Your Privacy Matters
              </span>
            </div>

            <h1 className="neo-heading-xl text-white mb-6">
              Privacy{" "}
              <span className="bg-gradient-to-r from-primary via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Policy
              </span>
            </h1>

            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              This Privacy Policy explains how Fleet Feast collects, uses,
              protects, and shares your personal information when you use our
              food truck marketplace platform.
            </p>

            <div className="mt-8 flex items-center justify-center gap-2 text-white/60">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Last Updated: {lastUpdated}</span>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents - Sticky Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 neo-card p-6 rounded-neo neo-shadow">
                <h2 className="neo-heading text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Contents
                </h2>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 group ${
                          isActive
                            ? "bg-primary text-white neo-shadow"
                            : "text-gray-600 hover:bg-gray-100 hover:text-primary"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            isActive
                              ? "text-white"
                              : "text-gray-400 group-hover:text-primary"
                          }`}
                        />
                        <span className="text-sm font-medium truncate">
                          {section.title}
                        </span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Quick Links */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    Related Policies
                  </p>
                  <div className="space-y-2">
                    <Link
                      href="/terms"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Terms of Service
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                    <Link
                      href="/cookies"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Cookie Policy
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="prose prose-lg max-w-none">
                {/* Introduction */}
                <section
                  id="introduction"
                  ref={setRef("introduction")}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-neo bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center neo-shadow">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="neo-heading text-3xl text-gray-900 m-0">
                      Introduction
                    </h2>
                  </div>
                  <div className="neo-card p-6 rounded-neo neo-shadow">
                    <p className="text-gray-700 leading-relaxed">
                      Fleet Feast, Inc. (&quot;Fleet Feast,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
                      operates a food truck marketplace platform connecting event planners
                      (customers) with food truck operators (vendors). We are committed to
                      protecting your privacy and handling your personal information with
                      care and transparency.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      This Privacy Policy applies to all users of our platform, including
                      website visitors, customers, vendors, and anyone who interacts with
                      our services. By using Fleet Feast, you agree to the collection,
                      use, and disclosure of your information as described in this policy.
                    </p>
                  </div>
                </section>

                {/* Information We Collect */}
                <section
                  id="information-collect"
                  ref={setRef("information-collect")}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-neo bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center neo-shadow">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="neo-heading text-3xl text-gray-900 m-0">
                      Information We Collect
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* From Customers */}
                    <div className="neo-card p-6 rounded-neo neo-shadow">
                      <h3 className="neo-heading text-xl text-gray-900 mb-4">
                        From Customers (Event Planners)
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Account Information:</strong> Name, email address,
                            phone number, password (encrypted)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Event Details:</strong> Event date, location, guest
                            count, food preferences, special requirements
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Payment Information:</strong> Processed securely via
                            Stripe (we do not store full credit card numbers)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Communication History:</strong> Messages with vendors,
                            customer support inquiries
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Reviews and Ratings:</strong> Feedback provided about
                            vendor services
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* From Vendors */}
                    <div className="neo-card p-6 rounded-neo neo-shadow">
                      <h3 className="neo-heading text-xl text-gray-900 mb-4">
                        From Vendors (Food Truck Operators)
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Business Information:</strong> Business name, EIN/tax
                            ID, business address, contact details
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Verification Documents:</strong> Insurance
                            certificates, health permits, business licenses, vehicle
                            registration
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Bank Account Information:</strong> For payout
                            processing via Stripe Connect
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Menu and Photos:</strong> Food offerings, pricing,
                            truck images
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Availability Calendar:</strong> Booking schedule and
                            service areas
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Communication Records:</strong> Messages with
                            customers, proposals, booking confirmations
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Automatically Collected */}
                    <div className="neo-card p-6 rounded-neo neo-shadow">
                      <h3 className="neo-heading text-xl text-gray-900 mb-4">
                        Automatically Collected Information
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Usage Data:</strong> Pages visited, search queries,
                            click patterns, time spent on site
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Device Information:</strong> IP address, browser type,
                            operating system, device identifiers
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Location Data:</strong> Approximate location based on
                            IP address (for search results)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Cookies and Tracking:</strong> See our Cookie Policy
                            for details
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* How We Use Information */}
                <section
                  id="how-we-use"
                  ref={setRef("how-we-use")}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-neo bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center neo-shadow">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="neo-heading text-3xl text-gray-900 m-0">
                      How We Use Your Information
                    </h2>
                  </div>

                  <div className="neo-card p-6 rounded-neo neo-shadow">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Provide Services:</strong> Facilitate bookings, process
                          payments, enable communication between customers and vendors
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Account Management:</strong> Create and maintain user
                          accounts, authenticate users, manage preferences
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Payment Processing:</strong> Process payments through
                          Stripe, manage escrow holds, distribute vendor payouts
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Communication:</strong> Send booking confirmations,
                          payment receipts, service updates, customer support responses
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Platform Improvement:</strong> Analyze usage patterns,
                          improve search algorithms, enhance user experience
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Safety and Security:</strong> Detect and prevent fraud,
                          verify vendor credentials, enforce terms of service
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Marketing (with consent):</strong> Send promotional
                          emails about new features, special offers (you can opt out
                          anytime)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Legal Compliance:</strong> Comply with applicable laws,
                          respond to legal requests, protect our rights
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Information Sharing */}
                <section
                  id="information-sharing"
                  ref={setRef("information-sharing")}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-neo bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center neo-shadow">
                      <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="neo-heading text-3xl text-gray-900 m-0">
                      How We Share Your Information
                    </h2>
                  </div>

                  <div className="neo-card p-6 rounded-neo neo-shadow">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We share your information only in the following limited
                      circumstances:
                    </p>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Between Customers and Vendors:</strong> When you request
                          a booking, vendors see your event details and contact
                          information. When you accept a booking, customers see your
                          business information.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Payment Processors:</strong> Stripe processes all
                          payments and has access to necessary payment information.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Email Service Providers:</strong> We use email services
                          (e.g., SendGrid) to send transactional and marketing emails.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Cloud Storage:</strong> We use secure cloud services
                          (AWS, Vercel) to store and process data.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Analytics Providers:</strong> We use analytics tools to
                          understand platform usage (anonymized when possible).
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Legal Requirements:</strong> We may disclose information
                          if required by law, court order, or to protect rights and
                          safety.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Business Transfers:</strong> If Fleet Feast is acquired
                          or merged, your information may be transferred to the new owner.
                        </span>
                      </li>
                    </ul>

                    <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
                      <p className="text-orange-900 font-medium">
                        We NEVER sell your personal information to third parties for
                        marketing purposes.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Data Retention */}
                <section
                  id="data-retention"
                  ref={setRef("data-retention")}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-neo bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center neo-shadow">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="neo-heading text-3xl text-gray-900 m-0">
                      Data Retention
                    </h2>
                  </div>

                  <div className="neo-card p-6 rounded-neo neo-shadow">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We retain your information for as long as necessary to provide
                      services and comply with legal obligations:
                    </p>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          User Account Data
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Retained until account deletion, plus 30 days for backup
                          recovery
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Booking and Payment Records
                        </h4>
                        <p className="text-gray-700 text-sm">
                          7 years (tax and accounting requirements)
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Messages and Communication
                        </h4>
                        <p className="text-gray-700 text-sm">
                          3 years (dispute resolution and support)
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Reviews and Ratings
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Indefinitely (platform integrity, may be anonymized upon account
                          deletion)
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Vendor Verification Documents
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Duration of vendor relationship plus 1 year
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Legal/Dispute Records
                        </h4>
                        <p className="text-gray-700 text-sm">
                          5 years or until resolution, whichever is longer
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Data Security */}
                <section
                  id="data-security"
                  ref={setRef("data-security")}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-neo bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center neo-shadow">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="neo-heading text-3xl text-gray-900 m-0">
                      Data Security
                    </h2>
                  </div>

                  <div className="neo-card p-6 rounded-neo neo-shadow">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We implement industry-standard security measures to protect your
                      data:
                    </p>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Encryption in Transit:</strong> All data transmitted to
                          and from our servers uses TLS 1.3 encryption
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Encryption at Rest:</strong> Sensitive data stored on
                          our servers is encrypted using AES-256
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Password Security:</strong> Passwords are hashed using
                          bcrypt with salt
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Payment Security:</strong> PCI DSS compliant through
                          Stripe (we never store full credit card numbers)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Access Controls:</strong> Strict employee access
                          controls, role-based permissions, audit logs
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Regular Security Audits:</strong> Periodic security
                          assessments and vulnerability testing
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Incident Response:</strong> Procedures in place to
                          detect and respond to security breaches
                        </span>
                      </li>
                    </ul>

                    <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                      <p className="text-blue-900 text-sm">
                        While we implement strong security measures, no system is 100%
                        secure. Please use a strong, unique password and enable
                        two-factor authentication when available.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Your Rights */}
                <section
                  id="your-rights"
                  ref={setRef("your-rights")}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-neo bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center neo-shadow">
                      <Key className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="neo-heading text-3xl text-gray-900 m-0">
                      Your Privacy Rights (GDPR & CCPA)
                    </h2>
                  </div>

                  <div className="neo-card p-6 rounded-neo neo-shadow">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Depending on your location, you may have the following rights:
                    </p>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-primary" />
                          Right to Access
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Request a copy of all personal data we hold about you
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Right to Rectification
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Correct inaccurate or incomplete information
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Database className="w-5 h-5 text-primary" />
                          Right to Erasure (&quot;Right to be Forgotten&quot;)
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Request deletion of your personal data (subject to legal
                          retention requirements)
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Share2 className="w-5 h-5 text-primary" />
                          Right to Data Portability
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Receive your data in a structured, machine-readable format
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Lock className="w-5 h-5 text-primary" />
                          Right to Restrict Processing
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Limit how we use your data in certain circumstances
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Mail className="w-5 h-5 text-primary" />
                          Right to Opt-Out of Marketing
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Unsubscribe from promotional emails at any time (transactional
                          emails still required)
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-primary" />
                          Right to Object
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Object to processing based on legitimate interests
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                      <p className="text-green-900 font-medium mb-2">
                        To Exercise Your Rights:
                      </p>
                      <p className="text-green-800 text-sm">
                        Contact us at{" "}
                        <a
                          href="mailto:privacy@fleetfeast.com"
                          className="underline hover:text-green-600"
                        >
                          privacy@fleetfeast.com
                        </a>{" "}
                        or use your account settings. We will respond within 30 days.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Cookies */}
                <section
                  id="cookies"
                  ref={setRef("cookies")}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-neo bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center neo-shadow">
                      <Cookie className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="neo-heading text-3xl text-gray-900 m-0">
                      Cookies and Tracking
                    </h2>
                  </div>

                  <div className="neo-card p-6 rounded-neo neo-shadow">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We use cookies and similar tracking technologies to improve your
                      experience on Fleet Feast. Cookies are small text files stored on
                      your device.
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          <strong>Essential Cookies:</strong> Required for basic site
                          functionality (login, session management)
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          <strong>Analytics Cookies:</strong> Help us understand how
                          users interact with our platform
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          <strong>Functional Cookies:</strong> Remember your preferences
                          and settings
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          <strong>Advertising Cookies:</strong> Track ad performance (with
                          your consent)
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm">
                      You can control cookies through your browser settings. Note that
                      disabling essential cookies may affect site functionality. For more
                      details, see our{" "}
                      <Link href="/cookies" className="text-primary hover:underline">
                        Cookie Policy
                      </Link>
                      .
                    </p>
                  </div>
                </section>

                {/* Children's Privacy */}
                <section
                  id="children"
                  ref={setRef("children")}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-neo bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center neo-shadow">
                      <Baby className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="neo-heading text-3xl text-gray-900 m-0">
                      Children&apos;s Privacy
                    </h2>
                  </div>

                  <div className="neo-card p-6 rounded-neo neo-shadow">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Fleet Feast is not intended for use by individuals under 18 years
                      of age. We do not knowingly collect personal information from
                      children.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      If you are a parent or guardian and believe your child has provided
                      us with personal information, please contact us at{" "}
                      <a
                        href="mailto:privacy@fleetfeast.com"
                        className="text-primary hover:underline"
                      >
                        privacy@fleetfeast.com
                      </a>{" "}
                      and we will delete the information.
                    </p>
                  </div>
                </section>

                {/* International Transfers */}
                <section
                  id="international"
                  ref={setRef("international")}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-neo bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center neo-shadow">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="neo-heading text-3xl text-gray-900 m-0">
                      International Data Transfers
                    </h2>
                  </div>

                  <div className="neo-card p-6 rounded-neo neo-shadow">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Fleet Feast is based in the United States. Your information may be
                      transferred to and processed in the United States or other
                      countries where our service providers operate.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      When transferring data internationally, we ensure appropriate
                      safeguards are in place, including:
                    </p>
                    <ul className="space-y-2 text-gray-700 mt-3">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Standard Contractual Clauses (SCCs) approved by the EU</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Data Processing Agreements with service providers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Compliance with applicable data protection regulations</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Policy Updates */}
                <section
                  id="updates"
                  ref={setRef("updates")}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-neo bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center neo-shadow">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="neo-heading text-3xl text-gray-900 m-0">
                      Changes to This Privacy Policy
                    </h2>
                  </div>

                  <div className="neo-card p-6 rounded-neo neo-shadow">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We may update this Privacy Policy from time to time to reflect
                      changes in our practices, legal requirements, or platform features.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      When we make significant changes, we will:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Update the &quot;Last Updated&quot; date at the top of this policy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Notify you via email if the changes are material</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Display a notice on our platform</span>
                      </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Your continued use of Fleet Feast after changes take effect
                      constitutes acceptance of the updated policy.
                    </p>
                  </div>
                </section>

                {/* Contact Information */}
                <section
                  id="contact"
                  ref={setRef("contact")}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-neo bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center neo-shadow">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="neo-heading text-3xl text-gray-900 m-0">
                      Contact Us
                    </h2>
                  </div>

                  <div className="neo-card p-6 rounded-neo neo-shadow">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      If you have questions about this Privacy Policy or our privacy
                      practices, please contact us:
                    </p>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                        <a
                          href="mailto:privacy@fleetfeast.com"
                          className="text-primary hover:underline"
                        >
                          privacy@fleetfeast.com
                        </a>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Mailing Address
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Fleet Feast, Inc.
                          <br />
                          Privacy Department
                          <br />
                          123 Food Truck Lane
                          <br />
                          San Francisco, CA 94102
                          <br />
                          United States
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Data Protection Officer (DPO)
                        </h4>
                        <p className="text-gray-700 text-sm">
                          For GDPR-related inquiries, contact our DPO at{" "}
                          <a
                            href="mailto:dpo@fleetfeast.com"
                            className="text-primary hover:underline"
                          >
                            dpo@fleetfeast.com
                          </a>
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Response Time
                        </h4>
                        <p className="text-gray-700 text-sm">
                          We aim to respond to all privacy inquiries within 30 days. For
                          urgent matters, please mark your email as &quot;Urgent Privacy
                          Request.&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Bottom CTA */}
              <div className="mt-12 neo-card p-8 rounded-neo neo-shadow bg-gradient-to-br from-primary/5 to-orange-500/5">
                <div className="text-center">
                  <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="neo-heading text-2xl text-gray-900 mb-2">
                    Your Privacy is Our Priority
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    We're committed to protecting your personal information and giving
                    you control over your data. If you have any questions or concerns,
                    we're here to help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="mailto:privacy@fleetfeast.com"
                      className="neo-btn-primary inline-flex items-center justify-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      Contact Privacy Team
                    </a>
                    <Link
                      href="/contact"
                      className="neo-btn-secondary inline-flex items-center justify-center gap-2"
                    >
                      General Support
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
