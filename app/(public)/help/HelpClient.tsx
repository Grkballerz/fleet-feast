"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Search,
  UserCircle,
  TruckIcon,
  CreditCard,
  ShieldCheck,
  BookOpen,
  Calendar,
  Star,
  AlertCircle,
  DollarSign,
  FileText,
  Settings,
  Mail,
  Clock,
  ChevronDown,
} from "lucide-react";

interface HelpCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  items: {
    question: string;
    answer: string;
  }[];
}

const helpCategories: HelpCategory[] = [
  {
    id: "customer-getting-started",
    title: "Getting Started - Customers",
    icon: UserCircle,
    description: "Learn the basics of using Fleet Feast to book food trucks",
    items: [
      {
        question: "How do I create an account?",
        answer:
          'Click "Sign Up" in the top navigation, choose "Customer" as your account type, and complete the registration form with your email and password. You\'ll receive a confirmation email to verify your account.',
      },
      {
        question: "How do I search for food trucks?",
        answer:
          'Use the search bar on the homepage or visit the "Search Trucks" page. You can filter by cuisine type, location, price range, and availability. Browse vendor profiles to see menus, photos, and reviews.',
      },
      {
        question: "How does pricing work?",
        answer:
          "Vendors set their own pricing based on menu items, service duration, and event size. You'll see an estimated price range on each vendor's profile. Request a custom quote by submitting an inquiry with your event details.",
      },
    ],
  },
  {
    id: "customer-booking",
    title: "Booking Process - Customers",
    icon: Calendar,
    description: "Everything about submitting inquiries and booking food trucks",
    items: [
      {
        question: "How do I submit a booking inquiry?",
        answer:
          "Select a vendor, click \"Get Quote\" or \"Book Now\", fill out the inquiry form with your event date, location, guest count, and special requirements. The vendor will respond within 48 hours with a proposal.",
      },
      {
        question: "What happens after I submit an inquiry?",
        answer:
          "The vendor reviews your request and sends a proposal with pricing, menu options, and any questions. You can accept the proposal, request changes, or decline. Once accepted, you'll proceed to payment.",
      },
      {
        question: "Can I accept or decline a proposal?",
        answer:
          'Yes! Review each proposal carefully. Click "Accept" to proceed to payment, or "Decline" if it doesn\'t meet your needs. You can also message the vendor to negotiate terms before accepting.',
      },
      {
        question: "How do I make a payment?",
        answer:
          "After accepting a proposal, you'll be redirected to our secure payment page. We accept all major credit cards and debit cards via Stripe. Payment is held in escrow until after your event.",
      },
    ],
  },
  {
    id: "customer-after-booking",
    title: "After Booking - Customers",
    icon: Star,
    description: "Managing your booking and post-event steps",
    items: [
      {
        question: "How do I communicate with my vendor?",
        answer:
          'Use the built-in messaging system in your booking dashboard. Click "Messages" next to your booking to send updates, ask questions, or coordinate event details. Vendors typically respond within 24 hours.',
      },
      {
        question: "What should I expect on event day?",
        answer:
          "The vendor will arrive at the scheduled time, set up their truck, and serve guests. Ensure the location has adequate space and power access. If issues arise, contact the vendor directly or our support team for urgent matters.",
      },
      {
        question: "How do I leave a review?",
        answer:
          'After your event, you\'ll receive an email with a review link. Rate your experience (1-5 stars) and write a brief review. Reviews help other customers and provide valuable feedback to vendors.',
      },
    ],
  },
  {
    id: "customer-issues",
    title: "Issues & Refunds - Customers",
    icon: AlertCircle,
    description: "Cancellations, disputes, and refund policies",
    items: [
      {
        question: "What if I need to cancel my booking?",
        answer:
          "Cancellation policies vary by vendor. Typical terms: 30+ days before (full refund), 14-29 days (50% refund), less than 14 days (no refund). Check your booking confirmation for specific terms. Submit cancellations through your dashboard.",
      },
      {
        question: "How do I file a dispute?",
        answer:
          'If you have issues with service quality or vendor no-show, contact support@fleetfeast.com within 48 hours. Provide booking details, photos/evidence, and a description of the issue. Our team investigates all disputes fairly.',
      },
      {
        question: "When will I receive my refund?",
        answer:
          "Approved refunds are processed within 5-7 business days and returned to your original payment method. Refund amounts depend on cancellation timing and circumstances. Partial refunds may apply for disputes.",
      },
    ],
  },
  {
    id: "vendor-getting-started",
    title: "Getting Started - Vendors",
    icon: TruckIcon,
    description: "How to apply and get approved as a vendor",
    items: [
      {
        question: "How do I apply to become a vendor?",
        answer:
          'Click "Become a Vendor" in the footer, complete the application form with your business information, and upload required documents (business license, insurance, health permits). Our team reviews applications within 5-7 business days.',
      },
      {
        question: "What documents do I need to provide?",
        answer:
          "Required documents: Valid business license, general liability insurance ($1M minimum coverage), current health/food handler permits for your operating area, photos of your truck (exterior and interior), sample menu with pricing.",
      },
      {
        question: "How long does approval take?",
        answer:
          "Most applications are reviewed within 5-7 business days. We verify all documents, conduct background checks, and review your truck and menu. You'll receive an email when approved or if additional information is needed.",
      },
    ],
  },
  {
    id: "vendor-profile",
    title: "Profile Setup - Vendors",
    icon: Settings,
    description: "Creating and managing your vendor profile",
    items: [
      {
        question: "How do I set up my vendor profile?",
        answer:
          "After approval, complete your profile with truck description, cuisine types, service areas, pricing, menu items, and high-quality photos. Add your availability calendar and booking preferences. A complete profile attracts more customers.",
      },
      {
        question: "How do I update my menu and pricing?",
        answer:
          'Go to your vendor dashboard, click "Menu & Pricing", and edit items. You can add new dishes, update prices, mark seasonal items, and upload food photos. Changes are visible immediately to customers.',
      },
      {
        question: "How do I manage my availability?",
        answer:
          'Use the availability calendar in your dashboard to block booked dates, vacations, or maintenance days. Set your service hours, minimum/maximum guest counts, and blackout dates. Keep your calendar current to avoid conflicts.',
      },
    ],
  },
  {
    id: "vendor-bookings",
    title: "Managing Bookings - Vendors",
    icon: BookOpen,
    description: "Handling inquiries, proposals, and confirmations",
    items: [
      {
        question: "How do I respond to booking inquiries?",
        answer:
          'You\'ll receive email notifications for new inquiries. Log into your dashboard, review the event details, and send a proposal with pricing, menu options, and any questions. Respond within 48 hours to maintain good standing.',
      },
      {
        question: "What should I include in a proposal?",
        answer:
          "Include detailed pricing breakdown, menu items/options, service duration, setup requirements, payment terms, and cancellation policy. Be clear about what's included and any additional fees. Answer all customer questions upfront.",
      },
      {
        question: "Can I decline a booking request?",
        answer:
          "Yes, you can decline if you're unavailable or the event doesn't fit your service model. However, maintain a reasonable acceptance rate (70%+) for better platform visibility. Provide a brief reason when declining.",
      },
    ],
  },
  {
    id: "vendor-payments",
    title: "Payments & Payouts - Vendors",
    icon: DollarSign,
    description: "Understanding fees, payouts, and bank setup",
    items: [
      {
        question: "What are Fleet Feast's fees?",
        answer:
          "Fleet Feast charges a 15% commission on confirmed bookings. There are no monthly fees, listing fees, or setup costs. You only pay when you receive bookings. Commission is automatically deducted from your payout.",
      },
      {
        question: "When do I get paid?",
        answer:
          "Payments are held in escrow during the event period. Funds are released to your bank account 7 days after successful event completion, minus the 15% commission. Track all payouts in your vendor dashboard.",
      },
      {
        question: "How do I set up my bank account for payouts?",
        answer:
          'Go to "Settings" > "Payout Settings" in your vendor dashboard. Enter your bank account details (routing number, account number). We use Stripe for secure payouts. Verify your account to receive payments.',
      },
    ],
  },
  {
    id: "account-security",
    title: "Account & Security",
    icon: ShieldCheck,
    description: "Managing your account settings and security",
    items: [
      {
        question: "How do I reset my password?",
        answer:
          'Click "Forgot Password" on the login page, enter your email address, and follow the reset link sent to your email. If you don\'t receive the email within 5 minutes, check your spam folder.',
      },
      {
        question: "How do I delete my account?",
        answer:
          'Go to "Settings" > "Account" > "Delete Account". Account deletion is permanent and cannot be undone. Complete or cancel all active bookings before deletion. Contact support if you need help.',
      },
      {
        question: "How do I update my privacy settings?",
        answer:
          'Visit "Settings" > "Privacy" to control email notifications, profile visibility, and data sharing preferences. Review our Privacy Policy for details on how we protect your information.',
      },
    ],
  },
];

/**
 * HelpClient Component
 *
 * Help Center page with categorized support resources,
 * search functionality, and collapsible FAQ sections.
 */
export function HelpClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Filter categories by search query
  const filteredCategories = searchQuery
    ? helpCategories
        .map((category) => ({
          ...category,
          items: category.items.filter(
            (item) =>
              item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.items.length > 0)
    : helpCategories;

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(
      expandedCategory === categoryId ? null : categoryId
    );
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-gray-50 py-16 md:py-24 border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="neo-card-glass rounded-neo p-4 neo-border neo-shadow">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="neo-heading-xl text-gray-900 mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers, guides, and support resources for customers and vendors
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <input
                type="search"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="neo-input w-full pl-12 px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Topics Quick Links */}
      {!searchQuery && (
        <section className="py-12 bg-white border-b-4 border-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="neo-heading text-2xl text-gray-900 mb-6 text-center">
              Popular Topics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setExpandedCategory("customer-booking")}
                className="neo-card-glass rounded-neo p-6 neo-border neo-shadow hover:neo-shadow-hover transition-all text-left group"
              >
                <Calendar className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="neo-heading text-lg text-gray-900 mb-1">
                  Booking Process
                </h3>
                <p className="text-sm text-gray-600">
                  Submit inquiries and manage bookings
                </p>
              </button>

              <button
                onClick={() => setExpandedCategory("vendor-payments")}
                className="neo-card-glass rounded-neo p-6 neo-border neo-shadow hover:neo-shadow-hover transition-all text-left group"
              >
                <CreditCard className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="neo-heading text-lg text-gray-900 mb-1">
                  Payments & Fees
                </h3>
                <p className="text-sm text-gray-600">
                  How pricing and payouts work
                </p>
              </button>

              <button
                onClick={() => setExpandedCategory("vendor-getting-started")}
                className="neo-card-glass rounded-neo p-6 neo-border neo-shadow hover:neo-shadow-hover transition-all text-left group"
              >
                <TruckIcon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="neo-heading text-lg text-gray-900 mb-1">
                  Become a Vendor
                </h3>
                <p className="text-sm text-gray-600">
                  Apply and get approved to list your truck
                </p>
              </button>

              <button
                onClick={() => setExpandedCategory("customer-issues")}
                className="neo-card-glass rounded-neo p-6 neo-border neo-shadow hover:neo-shadow-hover transition-all text-left group"
              >
                <AlertCircle className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="neo-heading text-lg text-gray-900 mb-1">
                  Issues & Refunds
                </h3>
                <p className="text-sm text-gray-600">
                  Cancellations, disputes, and refunds
                </p>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Help Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchQuery && (
            <p className="text-sm text-gray-600 mb-6">
              Found {filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0)} result(s) for "{searchQuery}"
            </p>
          )}

          <div className="space-y-6">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategory === category.id;

              return (
                <div
                  key={category.id}
                  className="neo-card-glass rounded-neo neo-border overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-start justify-between p-6 text-left hover:bg-white/50 transition-colors group"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="neo-border rounded-neo p-3 bg-white neo-shadow group-hover:neo-shadow-hover transition-all flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="neo-heading text-xl text-gray-900 mb-2">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`neo-border rounded-neo p-2 bg-white neo-shadow flex-shrink-0 ml-4 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown className="h-6 w-6 text-primary" />
                    </div>
                  </button>

                  {/* Category Items */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? "max-h-[2000px]" : "max-h-0"
                    }`}
                  >
                    <div className="border-t-4 border-black/10 px-6 pb-6">
                      <div className="space-y-4 mt-6">
                        {category.items.map((item, index) => (
                          <div
                            key={index}
                            className="neo-card-glass rounded-neo p-4 neo-border"
                          >
                            <h4 className="neo-heading text-base text-gray-900 mb-2">
                              {item.question}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                No help articles found for "{searchQuery}"
              </p>
              <p className="text-sm text-gray-500">
                Try different keywords or browse categories above
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Quick Link */}
      <section className="py-12 bg-white border-y-4 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="neo-card-glass rounded-neo p-8 neo-border neo-shadow text-center">
            <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="neo-heading text-2xl text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 mb-6">
              Browse our comprehensive FAQ section for quick answers to common questions
            </p>
            <a
              href="/faq"
              className="neo-btn-primary inline-block px-8 py-3"
            >
              View All FAQs
            </a>
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="neo-heading text-3xl text-gray-900 mb-4">
              Still need help?
            </h2>
            <p className="text-lg text-gray-600">
              Our support team is here to assist you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Support */}
            <div className="neo-card-glass rounded-neo p-8 neo-border neo-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="neo-border rounded-neo p-3 bg-white neo-shadow">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="neo-heading text-lg text-gray-900">
                    Email Support
                  </h3>
                  <p className="text-sm text-gray-600">
                    support@fleetfeast.com
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Send us an email anytime. We respond to all inquiries within 24 hours during business days.
              </p>
            </div>

            {/* Response Time */}
            <div className="neo-card-glass rounded-neo p-8 neo-border neo-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="neo-border rounded-neo p-3 bg-white neo-shadow">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="neo-heading text-lg text-gray-900">
                    Response Time
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mon-Fri, 9am-6pm EST
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Our team is available during business hours. Urgent event-day issues receive priority support.
              </p>
            </div>
          </div>

          {/* Contact Form Link */}
          <div className="text-center mt-8">
            <a
              href="/contact"
              className="neo-btn-secondary inline-block px-8 py-3"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
