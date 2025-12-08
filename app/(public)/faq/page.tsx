"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { FAQAccordion, FAQItem } from "../components/FAQAccordion";
import { Input } from "@/components/ui/Input";

const faqItems: FAQItem[] = [
  // Customers
  {
    question: "How do I book a food truck?",
    answer:
      "Search for food trucks on our platform, select your preferred vendor, and submit a booking request with your event details. The vendor will respond within 48 hours to confirm or propose alternatives. Once confirmed, complete payment through our secure platform.",
    category: "customers",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express) and debit cards. Payments are processed securely through our platform and held in escrow until after your event.",
    category: "customers",
  },
  {
    question: "What if I need to cancel my booking?",
    answer:
      "Cancellation policies vary by vendor but typically follow these guidelines: 30+ days before event (full refund), 14-29 days (50% refund), less than 14 days (no refund). Specific terms are shown before you confirm your booking.",
    category: "customers",
  },
  {
    question: "How many guests can a food truck serve?",
    answer:
      "Most food trucks can serve 50-200 guests per hour, depending on menu complexity. For larger events, you can book multiple trucks. Each vendor listing shows their capacity and recommended guest counts.",
    category: "customers",
  },
  {
    question: "Can I customize the menu?",
    answer:
      "Yes! Most vendors are happy to customize menus for your event. Discuss dietary restrictions, allergies, and preferences directly with the vendor through our messaging system after submitting your booking request.",
    category: "customers",
  },

  // Vendors
  {
    question: "How do I become a vendor on Fleet Feast?",
    answer:
      "Click 'Become a Vendor' and complete our application. You'll need to provide business information, insurance documents, health permits, and photos of your truck and menu. Our team reviews applications within 5-7 business days.",
    category: "vendors",
  },
  {
    question: "What are the fees for vendors?",
    answer:
      "Fleet Feast charges a 15% commission on confirmed bookings. There are no monthly fees or listing fees. You only pay when you get booked. Payment is released to you within 7 days after event completion.",
    category: "vendors",
  },
  {
    question: "Do I need insurance to join?",
    answer:
      "Yes, all vendors must have current general liability insurance (minimum $1M coverage) and any required health permits for your city/state. We verify all documents during the application process.",
    category: "vendors",
  },
  {
    question: "How do I get paid?",
    answer:
      "Payments are held in escrow during the event period. After successful event completion (verified by both parties), funds are released to your bank account within 7 business days. You can track all payments in your vendor dashboard.",
    category: "vendors",
  },
  {
    question: "Can I decline a booking request?",
    answer:
      "Yes, you have full control over which bookings you accept. You can decline requests if you're unavailable or if the event doesn't fit your service model. However, maintaining a high acceptance rate helps improve your visibility on the platform.",
    category: "vendors",
  },

  // Payments
  {
    question: "Is my payment secure?",
    answer:
      "Yes, all payments are processed through Stripe, a industry-leading payment processor. Your payment information is encrypted and never stored on our servers. Funds are held in escrow until after event completion.",
    category: "payments",
  },
  {
    question: "When is payment released to the vendor?",
    answer:
      "Payment is released to the vendor 7 days after event completion, assuming no disputes. This waiting period protects both parties and allows time to resolve any issues.",
    category: "payments",
  },
  {
    question: "What if there's a dispute?",
    answer:
      "If there's a dispute about service quality or cancellation, both parties can submit evidence through our platform. Our team reviews all evidence and makes a fair decision within 7 days. We may offer partial refunds based on the circumstances.",
    category: "payments",
  },
  {
    question: "Do you charge taxes and fees?",
    answer:
      "The price you see includes all Fleet Feast service fees. Local sales tax may apply depending on your location and will be shown clearly before payment. Vendors set their own pricing which includes their costs.",
    category: "payments",
  },

  // General
  {
    question: "What areas do you serve?",
    answer:
      "Fleet Feast currently operates in New York City and surrounding areas. We're expanding to new cities regularly. Sign up for our newsletter to be notified when we launch in your area.",
    category: "general",
  },
  {
    question: "How are vendors verified?",
    answer:
      "All vendors must pass our verification process including business license check, insurance verification, health permit validation, and background check. We also review their truck, equipment, and sample menus before approval.",
    category: "general",
  },
  {
    question: "Can I leave a review?",
    answer:
      "Yes! After your event, you'll receive an email prompting you to rate and review the vendor. Reviews help other customers make informed decisions and help vendors improve their service.",
    category: "general",
  },
  {
    question: "Do you offer customer support?",
    answer:
      "Yes! Our support team is available Monday-Friday 9am-6pm EST via email (support@fleetfeast.com) and through our in-app messaging system. For urgent issues on event day, we offer phone support to all active bookings.",
    category: "general",
  },
];

/**
 * FAQ Page
 *
 * Frequently asked questions with category filtering and search.
 */
export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "customers" | "vendors" | "payments" | "general"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter by search query
  const filteredBySearch = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { value: "all", label: "All Questions" },
    { value: "customers", label: "For Customers" },
    { value: "vendors", label: "For Vendors" },
    { value: "payments", label: "Payments & Fees" },
    { value: "general", label: "General" },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="neo-heading-xl text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about booking food trucks, vendor
            requirements, and how Fleet Feast works.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() =>
                  setSelectedCategory(
                    category.value as typeof selectedCategory
                  )
                }
                className={`px-4 py-2 rounded-neo font-bold transition-all ${
                  selectedCategory === category.value
                    ? "neo-btn-primary"
                    : "neo-btn-secondary"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchQuery ? (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Found {filteredBySearch.length} result(s) for "{searchQuery}"
              </p>
              <FAQAccordion items={filteredBySearch} filterCategory="all" />
            </>
          ) : (
            <FAQAccordion items={faqItems} filterCategory={selectedCategory} />
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="neo-heading text-3xl text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Our support team is here to help. Get in touch and we'll respond
            within 24 hours.
          </p>
          <a
            href="/contact"
            className="neo-btn-primary inline-block px-8 py-3"
          >
            Contact Support
          </a>
        </div>
      </section>
    </MainLayout>
  );
}
