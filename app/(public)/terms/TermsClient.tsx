"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  User,
  ShoppingCart,
  CreditCard,
  XCircle,
  AlertTriangle,
  Shield,
  Copyright,
  Scale,
  Gavel,
  Mail,
  ChevronRight,
  ChevronDown,
  Printer
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
}

const sections: Section[] = [
  { id: "introduction", title: "Introduction", icon: FileText },
  { id: "user-accounts", title: "User Accounts", icon: User },
  { id: "platform-services", title: "Platform Services", icon: ShoppingCart },
  { id: "booking-terms", title: "Booking Terms", icon: FileText },
  { id: "payment-terms", title: "Payment Terms", icon: CreditCard },
  { id: "cancellation-policy", title: "Cancellation Policy", icon: XCircle },
  { id: "dispute-resolution", title: "Dispute Resolution", icon: Scale },
  { id: "anti-circumvention", title: "Anti-Circumvention Policy", icon: AlertTriangle },
  { id: "user-conduct", title: "User Conduct", icon: Shield },
  { id: "intellectual-property", title: "Intellectual Property", icon: Copyright },
  { id: "limitation-liability", title: "Limitation of Liability", icon: Shield },
  { id: "modifications", title: "Modifications to Terms", icon: FileText },
  { id: "governing-law", title: "Governing Law", icon: Gavel },
  { id: "contact", title: "Contact Information", icon: Mail },
];

export function TermsClient() {
  const [activeSection, setActiveSection] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showTOC, setShowTOC] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-100px 0px -50% 0px" }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 print:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="neo-heading text-4xl md:text-5xl mb-4 print:text-3xl">
                  Terms of{" "}
                  <span className="bg-gradient-to-r from-primary via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    Service
                  </span>
                </h1>
                <p className="text-white/80 text-lg">
                  Last Updated: December 24, 2025
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="neo-btn-secondary hidden md:flex items-center gap-2 print:hidden"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 print:py-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Table of Contents - Sidebar */}
            <aside className="lg:w-80 print:hidden">
              <div className="sticky top-24">
                <div className="neo-card-glass rounded-neo p-6 neo-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg text-gray-900">Table of Contents</h2>
                    <button
                      onClick={() => setShowTOC(!showTOC)}
                      className="lg:hidden text-gray-500 hover:text-gray-900"
                    >
                      {showTOC ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </div>

                  <nav className={`space-y-1 ${showTOC ? 'block' : 'hidden lg:block'}`}>
                    {sections.map(({ id, title, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => scrollToSection(id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{title}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              <div className="bg-white rounded-neo neo-shadow p-8 md:p-12 space-y-12 print:shadow-none print:p-0">

                {/* 1. Introduction */}
                <section id="introduction" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">1. Introduction</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Welcome to Fleet Feast. These Terms of Service ("Terms") govern your use of the Fleet Feast platform,
                      website, and services (collectively, the "Platform"). By accessing or using our Platform, you agree to
                      be bound by these Terms.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Fleet Feast is a marketplace connecting customers seeking food truck catering services with verified
                      food truck vendors. We facilitate bookings, handle payments through our secure escrow system, and
                      provide communication tools to ensure successful events.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      <strong>By using Fleet Feast, you acknowledge that you have read, understood, and agree to be bound
                      by these Terms.</strong> If you do not agree to these Terms, please do not use our Platform.
                    </p>
                  </div>
                </section>

                {/* 2. User Accounts */}
                <section id="user-accounts" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <User className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">2. User Accounts</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Registration</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      To use Fleet Feast services, you must create an account by providing accurate and complete information.
                      You must verify your email address before accessing full platform features.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Account Security</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      You are responsible for maintaining the confidentiality of your account credentials and for all
                      activities that occur under your account. You must:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                      <li>Use a strong, unique password</li>
                      <li>Not share your account credentials with others</li>
                      <li>Notify us immediately of any unauthorized access</li>
                      <li>Keep your contact information current</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Account Types</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Fleet Feast offers two account types:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      <li><strong>Customer Accounts:</strong> For individuals and organizations booking food truck services</li>
                      <li><strong>Vendor Accounts:</strong> For food truck operators offering catering services (subject to
                      application approval and document verification)</li>
                    </ul>
                  </div>
                </section>

                {/* 3. Platform Services */}
                <section id="platform-services" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <ShoppingCart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">3. Platform Services</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Marketplace Platform</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Fleet Feast operates as a marketplace connecting customers with food truck vendors. We provide:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                      <li>Search and discovery tools for finding food trucks</li>
                      <li>Vendor profiles with menus, photos, pricing, and reviews</li>
                      <li>Booking request and acceptance workflow</li>
                      <li>Secure payment processing and escrow services</li>
                      <li>In-platform messaging system</li>
                      <li>Review and rating system</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Role as Intermediary</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Fleet Feast acts as an intermediary between customers and vendors. We do not provide food services
                      directly. We are not responsible for the actual catering services provided by vendors, including
                      food quality, preparation, or delivery.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Vendor Verification</h3>
                    <p className="text-gray-600 leading-relaxed">
                      All vendors undergo verification including review of business licenses, health permits, liability
                      insurance, and food handler certifications. However, ongoing compliance remains the vendor's responsibility.
                    </p>
                  </div>
                </section>

                {/* 4. Booking Terms */}
                <section id="booking-terms" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">4. Booking Terms</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Request-to-Book Process</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Fleet Feast uses a request-to-book system:
                    </p>
                    <ol className="list-decimal pl-6 space-y-2 text-gray-600 mb-4">
                      <li>Customer submits a booking request with event details</li>
                      <li>Vendor has 48 hours to accept or decline the request</li>
                      <li>If accepted, customer receives payment request</li>
                      <li>Booking is confirmed once payment is completed</li>
                      <li>If vendor doesn't respond within 48 hours, request automatically expires</li>
                    </ol>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Booking Information</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Customers must provide accurate booking information including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                      <li>Event date, time, and duration</li>
                      <li>Event location with full address</li>
                      <li>Estimated guest count</li>
                      <li>Event type and any special requirements</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Vendor Obligations</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Vendors who accept bookings agree to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      <li>Provide services as described in their profile and booking agreement</li>
                      <li>Arrive on time and remain for the agreed duration</li>
                      <li>Maintain all required licenses, permits, and insurance</li>
                      <li>Communicate professionally through the platform</li>
                    </ul>
                  </div>
                </section>

                {/* 5. Payment Terms */}
                <section id="payment-terms" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <CreditCard className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">5. Payment Terms</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Platform Commission</h3>
                    <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4 mb-4">
                      <p className="text-gray-900 font-medium mb-2">
                        Fleet Feast charges a 15% platform commission on all bookings, structured as:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        <li><strong>5% paid by customer</strong> (added to booking total)</li>
                        <li><strong>10% paid by vendor</strong> (deducted from payout)</li>
                      </ul>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Escrow Payment System</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      All payments are processed through our secure escrow system:
                    </p>
                    <ol className="list-decimal pl-6 space-y-2 text-gray-600 mb-4">
                      <li>Customer pays the full amount (booking total + 5% customer commission) when confirming a booking</li>
                      <li>Funds are held securely in escrow until after the event</li>
                      <li>After the event, a 7-day dispute window begins</li>
                      <li>If no dispute is filed, funds are automatically released to the vendor minus the 10% vendor commission</li>
                      <li>If a dispute is filed, funds remain in escrow until resolution</li>
                    </ol>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Loyalty Discount</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Repeat customers booking the same vendor receive a 5% discount on subsequent bookings. This discount
                      is absorbed by the platform (vendor commission reduced from 10% to 5% on loyalty bookings).
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.4 Payment Processing</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Payments are processed through Stripe Connect. By using Fleet Feast, you agree to Stripe's terms of
                      service. We do not store credit card information on our servers.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.5 Payout Schedule</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Vendors receive payment 7 days after event completion, provided no disputes are filed. Payouts are
                      processed to the vendor's connected Stripe account.
                    </p>
                  </div>
                </section>

                {/* 6. Cancellation Policy */}
                <section id="cancellation-policy" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <XCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">6. Cancellation Policy</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Customer Cancellations</h3>
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cancellation Timeframe
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Refund Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              7+ days before event
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                              100% full refund
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              3-6 days before event
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                              50% refund
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Less than 3 days before event
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                              No refund
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Vendor Cancellations</h3>
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cancellation Timeframe
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Penalty
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer Outcome
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              7+ days before event
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              No penalty
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              Platform finds replacement OR full refund
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              3-6 days before event
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                              $100 penalty
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              Platform finds replacement OR full refund
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Less than 3 days before event
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                              $200 penalty
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              Platform finds replacement OR full refund + compensation
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              No-show at event
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">
                              $500 penalty
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              Full refund + $100 platform credit
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                      <p className="text-blue-900 font-medium mb-2">Replacement Options</p>
                      <p className="text-blue-800 text-sm">
                        When a vendor cancels, customers may choose between accepting a comparable replacement food truck
                        (sourced by Fleet Feast) OR receiving a full refund. The customer is not obligated to accept
                        a replacement.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 7. Dispute Resolution */}
                <section id="dispute-resolution" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <Scale className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">7. Dispute Resolution</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Dispute Window</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Customers have 7 days following the event date to file a dispute. Disputes must be filed through
                      the platform with supporting evidence (photos, messages, etc.).
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Automated Resolutions</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Common issues are resolved automatically according to these rules:
                    </p>
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Issue Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Resolution
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Vendor no-show</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              Full refund + $100 credit + $500 vendor penalty
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Late arrival (under 30 min)</td>
                            <td className="px-6 py-4 text-sm text-gray-600">No automatic refund</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Late arrival (30-60 min)</td>
                            <td className="px-6 py-4 text-sm text-gray-600">10% refund to customer</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Late arrival (over 60 min)</td>
                            <td className="px-6 py-4 text-sm text-gray-600">25% refund to customer</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Food quality complaint</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Escalated to manual review</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Wrong food/menu items</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Escalated to manual review</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Quantity dispute</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Escalated to manual review</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Manual Review Process</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Disputes requiring manual review are handled by Fleet Feast support staff who will:
                    </p>
                    <ol className="list-decimal pl-6 space-y-2 text-gray-600 mb-4">
                      <li>Review all evidence from both parties</li>
                      <li>Examine message history and booking details</li>
                      <li>Request additional information if needed</li>
                      <li>Make a final determination within 5 business days</li>
                    </ol>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7.4 Final Determination</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Fleet Feast's dispute resolution decisions are final and binding. By using the platform, both
                      parties agree to accept our determinations.
                    </p>
                  </div>
                </section>

                {/* 8. Anti-Circumvention Policy */}
                <section id="anti-circumvention" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">8. Anti-Circumvention Policy</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-6">
                      <p className="text-red-900 font-bold mb-2">IMPORTANT: All transactions must occur on-platform</p>
                      <p className="text-red-800 text-sm">
                        Attempting to conduct bookings or payments outside of Fleet Feast is strictly prohibited and
                        subject to penalties including permanent account suspension.
                      </p>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Prohibited Activities</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      The following activities are expressly forbidden:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                      <li>Exchanging phone numbers, email addresses, or other contact information through platform messages</li>
                      <li>Attempting to conduct bookings outside the platform</li>
                      <li>Processing payments directly between customer and vendor</li>
                      <li>Sharing social media handles or external communication channels</li>
                      <li>Using coded language to circumvent message filtering</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 Detection Systems</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Fleet Feast employs automated monitoring to detect circumvention attempts, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                      <li>Pattern detection in messages (phone numbers, email addresses, URLs)</li>
                      <li>Analysis of customer-vendor communication patterns</li>
                      <li>Detection of repeat interactions without bookings</li>
                      <li>Suspicious activity flags reviewed by support staff</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">8.3 Penalty System</h3>
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Offense
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Penalty
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">1st Offense</td>
                            <td className="px-6 py-4 text-sm text-orange-600 font-medium">
                              Written warning + message privileges restricted
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">2nd Offense</td>
                            <td className="px-6 py-4 text-sm text-red-600 font-medium">
                              30-day account suspension
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">3rd Offense</td>
                            <td className="px-6 py-4 text-sm text-red-600 font-bold">
                              Permanent account ban
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">8.4 Rationale</h3>
                    <p className="text-gray-600 leading-relaxed">
                      This policy protects both parties by ensuring all transactions benefit from our escrow payment
                      system, dispute resolution process, insurance coverage, and verified vendor standards.
                      Off-platform transactions leave both parties vulnerable and without recourse.
                    </p>
                  </div>
                </section>

                {/* 9. User Conduct */}
                <section id="user-conduct" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">9. User Conduct</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">9.1 Acceptable Use</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Users must:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                      <li>Provide accurate and truthful information</li>
                      <li>Communicate professionally and respectfully</li>
                      <li>Honor booking commitments</li>
                      <li>Respect intellectual property rights</li>
                      <li>Comply with all applicable laws and regulations</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">9.2 Prohibited Conduct</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Users must not:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                      <li>Submit false, misleading, or fraudulent information</li>
                      <li>Impersonate other users or entities</li>
                      <li>Harass, threaten, or abuse other users</li>
                      <li>Post offensive, discriminatory, or inappropriate content</li>
                      <li>Attempt to manipulate ratings or reviews</li>
                      <li>Use automated tools or bots to access the platform</li>
                      <li>Attempt to breach or circumvent security measures</li>
                      <li>Engage in any illegal activities</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">9.3 Enforcement</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Fleet Feast reserves the right to suspend or terminate accounts that violate these conduct
                      standards. We may also report illegal activities to appropriate authorities.
                    </p>
                  </div>
                </section>

                {/* 10. Intellectual Property */}
                <section id="intellectual-property" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <Copyright className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">10. Intellectual Property</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">10.1 Platform Content</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      All content on the Fleet Feast platform, including but not limited to text, graphics, logos,
                      icons, images, software, and design, is the property of Fleet Feast or its licensors and is
                      protected by copyright, trademark, and other intellectual property laws.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">10.2 User Content</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Users retain ownership of content they submit to Fleet Feast (photos, reviews, descriptions).
                      However, by submitting content, you grant Fleet Feast a worldwide, non-exclusive, royalty-free
                      license to use, display, reproduce, and distribute that content in connection with operating
                      and promoting the platform.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">10.3 Restrictions</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Users may not copy, modify, distribute, sell, or create derivative works from any Fleet Feast
                      content without express written permission.
                    </p>
                  </div>
                </section>

                {/* 11. Limitation of Liability */}
                <section id="limitation-liability" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">11. Limitation of Liability</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">11.1 Platform as Intermediary</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Fleet Feast acts solely as an intermediary connecting customers with vendors. We are not
                      responsible for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                      <li>Food quality, preparation, or safety</li>
                      <li>Vendor conduct or performance</li>
                      <li>Customer conduct or payment disputes</li>
                      <li>Property damage or personal injury at events</li>
                      <li>Compliance with local health, safety, or business regulations</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">11.2 Service Availability</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Fleet Feast provides the platform "as is" without warranties. We do not guarantee:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                      <li>Uninterrupted access to the platform</li>
                      <li>Error-free operation</li>
                      <li>Availability of specific vendors</li>
                      <li>Specific booking outcomes</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">11.3 Maximum Liability</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      To the maximum extent permitted by law, Fleet Feast's total liability for any claims arising
                      from use of the platform shall not exceed the amount of platform fees paid by the user in the
                      12 months preceding the claim.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">11.4 Indemnification</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Users agree to indemnify and hold Fleet Feast harmless from any claims, damages, or expenses
                      (including legal fees) arising from their use of the platform, violation of these Terms, or
                      infringement of third-party rights.
                    </p>
                  </div>
                </section>

                {/* 12. Modifications to Terms */}
                <section id="modifications" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">12. Modifications to Terms</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Fleet Feast reserves the right to modify these Terms at any time. When changes are made:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                      <li>We will update the "Last Updated" date at the top of this page</li>
                      <li>For material changes, we will notify users via email or platform notification</li>
                      <li>Continued use of the platform after changes constitutes acceptance of the new Terms</li>
                      <li>Users who do not agree with changes should discontinue use of the platform</li>
                    </ul>
                    <p className="text-gray-600 leading-relaxed">
                      We encourage users to review these Terms periodically to stay informed of updates.
                    </p>
                  </div>
                </section>

                {/* 13. Governing Law */}
                <section id="governing-law" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <Gavel className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">13. Governing Law</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      These Terms shall be governed by and construed in accordance with the laws of the State of
                      New York, United States, without regard to its conflict of law provisions.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      Any disputes arising from these Terms or use of the platform shall be subject to the exclusive
                      jurisdiction of the state and federal courts located in New York County, New York.
                    </p>
                  </div>
                </section>

                {/* 14. Contact Information */}
                <section id="contact" className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-4">
                    <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="neo-heading text-3xl text-gray-900">14. Contact Information</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      For questions, concerns, or inquiries about these Terms of Service, please contact us:
                    </p>
                    <div className="bg-gray-50 rounded-neo p-6 space-y-3">
                      <div>
                        <strong className="text-gray-900">Fleet Feast Support</strong>
                      </div>
                      <div className="text-gray-600">
                        Email: <a href="mailto:legal@fleetfeast.com" className="text-primary hover:underline">legal@fleetfeast.com</a>
                      </div>
                      <div className="text-gray-600">
                        Support: <Link href="/contact" className="text-primary hover:underline">Contact Form</Link>
                      </div>
                      <div className="text-gray-600">
                        Address: New York, NY (Headquarters)
                      </div>
                    </div>
                  </div>
                </section>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-8 mt-12">
                  <div className="bg-gray-50 rounded-neo p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Acknowledgment:</strong> By using Fleet Feast, you acknowledge that you have read,
                      understood, and agree to be bound by these Terms of Service. If you do not agree to these
                      Terms, you must not use our platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Last Updated: December 24, 2025 | Version 1.0
                      </p>
                      <div className="flex gap-4">
                        <Link href="/privacy" className="text-sm text-primary hover:underline">
                          Privacy Policy
                        </Link>
                        <Link href="/contact" className="text-sm text-primary hover:underline">
                          Contact Support
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
