"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ArrowUp, ExternalLink, ChevronRight } from "lucide-react";

interface CookieDetail {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  type: "Essential" | "Functional" | "Analytics" | "Marketing";
}

const cookieDetails: CookieDetail[] = [
  {
    name: "next-auth.session-token",
    provider: "NextAuth.js",
    purpose: "Maintains user authentication session",
    duration: "Session (30 days)",
    type: "Essential",
  },
  {
    name: "next-auth.csrf-token",
    provider: "NextAuth.js",
    purpose: "CSRF protection for secure forms",
    duration: "Session",
    type: "Essential",
  },
  {
    name: "next-auth.callback-url",
    provider: "NextAuth.js",
    purpose: "Stores redirect URL after login",
    duration: "Session",
    type: "Essential",
  },
  {
    name: "__Secure-next-auth.session-token",
    provider: "NextAuth.js",
    purpose: "Secure session token (HTTPS only)",
    duration: "Session (30 days)",
    type: "Essential",
  },
  {
    name: "ff_preferences",
    provider: "Fleet Feast",
    purpose: "Stores user preferences (theme, language)",
    duration: "1 year",
    type: "Functional",
  },
  {
    name: "ff_recent_trucks",
    provider: "Fleet Feast",
    purpose: "Tracks recently viewed food trucks",
    duration: "30 days",
    type: "Functional",
  },
  {
    name: "ff_search_filters",
    provider: "Fleet Feast",
    purpose: "Remembers search filter preferences",
    duration: "7 days",
    type: "Functional",
  },
  {
    name: "_vercel_analytics",
    provider: "Vercel Analytics",
    purpose: "Tracks page views and performance metrics",
    duration: "1 year",
    type: "Analytics",
  },
  {
    name: "plausible_user",
    provider: "Plausible Analytics",
    purpose: "Privacy-friendly analytics tracking",
    duration: "1 year",
    type: "Analytics",
  },
  {
    name: "__stripe_mid",
    provider: "Stripe",
    purpose: "Fraud prevention for payment processing",
    duration: "1 year",
    type: "Essential",
  },
  {
    name: "__stripe_sid",
    provider: "Stripe",
    purpose: "Stripe session identifier",
    duration: "30 minutes",
    type: "Essential",
  },
];

interface BrowserGuide {
  name: string;
  link: string;
}

const browserGuides: BrowserGuide[] = [
  {
    name: "Google Chrome",
    link: "https://support.google.com/chrome/answer/95647",
  },
  {
    name: "Mozilla Firefox",
    link: "https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox",
  },
  {
    name: "Safari",
    link: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac",
  },
  {
    name: "Microsoft Edge",
    link: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
  },
  {
    name: "Opera",
    link: "https://help.opera.com/en/latest/web-preferences/#cookies",
  },
];

const LAST_UPDATED = "December 24, 2025";

/**
 * CookiesClient Component
 *
 * Client-side component for the Cookie Policy page.
 * Includes jump navigation, cookie details table, and browser guides.
 */
export default function CookiesClient() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track scroll position for back-to-top button
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setShowScrollTop(window.scrollY > 400);
    });
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Account for fixed header
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const sections = [
    { id: "introduction", label: "Introduction" },
    { id: "types-of-cookies", label: "Types of Cookies We Use" },
    { id: "cookie-details", label: "Cookie Details Table" },
    { id: "managing-cookies", label: "Managing Cookies" },
    { id: "third-party", label: "Third-Party Cookies" },
    { id: "do-not-track", label: "Do Not Track" },
    { id: "updates", label: "Updates to Policy" },
    { id: "contact", label: "Contact Information" },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 md:py-24 print:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="neo-heading-xl text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-lg text-gray-600 mb-4">
            Learn how Fleet Feast uses cookies to enhance your experience and
            protect your data.
          </p>
          <p className="text-sm text-gray-500">
            Last Updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Jump Navigation */}
      <section className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
            Quick Navigation
          </h2>
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="flex items-center text-left px-4 py-2 rounded-neo hover:bg-gray-50 transition-colors group"
              >
                <ChevronRight className="w-4 h-4 mr-2 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-gray-700 group-hover:text-primary transition-colors">
                  {section.label}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Introduction */}
          <div id="introduction" className="scroll-mt-24">
            <h2 className="neo-heading text-2xl md:text-3xl text-gray-900 mb-4">
              1. Introduction
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Fleet Feast ("we", "us", or "our") uses cookies and similar
                tracking technologies to provide, improve, and protect our
                services. This Cookie Policy explains what cookies are, how we
                use them, and your choices regarding their use.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>What are cookies?</strong> Cookies are small text files
                stored on your device (computer, tablet, or mobile) when you
                visit a website. They help websites remember your actions and
                preferences over time, making your browsing experience more
                efficient and personalized.
              </p>
            </div>
          </div>

          {/* Types of Cookies */}
          <div id="types-of-cookies" className="scroll-mt-24">
            <h2 className="neo-heading text-2xl md:text-3xl text-gray-900 mb-6">
              2. Types of Cookies We Use
            </h2>
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="neo-card p-6">
                <div className="flex items-start mb-3">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-neo text-xs font-bold mr-3">
                    ESSENTIAL
                  </span>
                  <h3 className="neo-heading text-xl text-gray-900">
                    Essential Cookies
                  </h3>
                </div>
                <p className="text-gray-700 mb-3">
                  These cookies are necessary for the website to function and
                  cannot be disabled. They are usually set in response to
                  actions you take, such as logging in or filling out forms.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Session management and authentication (NextAuth.js)</li>
                  <li>CSRF token protection for secure forms</li>
                  <li>Payment processing security (Stripe)</li>
                  <li>Load balancing and server routing</li>
                </ul>
              </div>

              {/* Functional Cookies */}
              <div className="neo-card p-6">
                <div className="flex items-start mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-neo text-xs font-bold mr-3">
                    FUNCTIONAL
                  </span>
                  <h3 className="neo-heading text-xl text-gray-900">
                    Functional Cookies
                  </h3>
                </div>
                <p className="text-gray-700 mb-3">
                  These cookies enable enhanced functionality and personalization.
                  They may be set by us or third-party providers.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>User preferences (theme, language, notification settings)</li>
                  <li>Recently viewed food trucks</li>
                  <li>Search filter preferences</li>
                  <li>Map location and zoom level</li>
                </ul>
              </div>

              {/* Analytics Cookies */}
              <div className="neo-card p-6">
                <div className="flex items-start mb-3">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-neo text-xs font-bold mr-3">
                    ANALYTICS
                  </span>
                  <h3 className="neo-heading text-xl text-gray-900">
                    Analytics Cookies
                  </h3>
                </div>
                <p className="text-gray-700 mb-3">
                  These cookies help us understand how visitors interact with our
                  website by collecting and reporting information anonymously.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Page views and traffic sources (Vercel Analytics)</li>
                  <li>Privacy-friendly analytics (Plausible)</li>
                  <li>Performance metrics and load times</li>
                  <li>Error tracking and debugging</li>
                </ul>
              </div>

              {/* Marketing Cookies */}
              <div className="neo-card p-6">
                <div className="flex items-start mb-3">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-neo text-xs font-bold mr-3">
                    MARKETING
                  </span>
                  <h3 className="neo-heading text-xl text-gray-900">
                    Marketing Cookies
                  </h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Currently, Fleet Feast does not use marketing or advertising
                  cookies. We do not track you for advertising purposes or share
                  your data with ad networks.
                </p>
                <p className="text-gray-600 text-sm">
                  If we decide to use marketing cookies in the future, we will
                  update this policy and request your consent.
                </p>
              </div>
            </div>
          </div>

          {/* Cookie Details Table */}
          <div id="cookie-details" className="scroll-mt-24">
            <h2 className="neo-heading text-2xl md:text-3xl text-gray-900 mb-6">
              3. Cookie Details Table
            </h2>
            <div className="overflow-x-auto neo-card p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 px-2 font-bold text-gray-900">
                      Cookie Name
                    </th>
                    <th className="text-left py-3 px-2 font-bold text-gray-900">
                      Provider
                    </th>
                    <th className="text-left py-3 px-2 font-bold text-gray-900">
                      Purpose
                    </th>
                    <th className="text-left py-3 px-2 font-bold text-gray-900">
                      Duration
                    </th>
                    <th className="text-left py-3 px-2 font-bold text-gray-900">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cookieDetails.map((cookie, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-2 font-mono text-xs text-gray-800">
                        {cookie.name}
                      </td>
                      <td className="py-3 px-2 text-gray-700">
                        {cookie.provider}
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {cookie.purpose}
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {cookie.duration}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-1 rounded-neo text-xs font-bold ${
                            cookie.type === "Essential"
                              ? "bg-red-100 text-red-800"
                              : cookie.type === "Functional"
                              ? "bg-blue-100 text-blue-800"
                              : cookie.type === "Analytics"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {cookie.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Managing Cookies */}
          <div id="managing-cookies" className="scroll-mt-24">
            <h2 className="neo-heading text-2xl md:text-3xl text-gray-900 mb-6">
              4. Managing Cookies
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                You have the right to decide whether to accept or reject
                cookies. Most web browsers automatically accept cookies, but you
                can modify your browser settings to decline cookies if you
                prefer.
              </p>

              <div className="neo-card p-6 bg-yellow-50 border-2 border-yellow-200 mb-6">
                <h3 className="neo-heading text-lg text-gray-900 mb-2">
                  Important Note
                </h3>
                <p className="text-gray-700">
                  If you choose to disable essential cookies, some features of
                  Fleet Feast may not function properly. You will not be able to
                  log in, make bookings, or process payments.
                </p>
              </div>

              <h3 className="neo-heading text-xl text-gray-900 mb-4 mt-8">
                Browser Settings
              </h3>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings. Here are
                guides for popular browsers:
              </p>

              <div className="space-y-2">
                {browserGuides.map((browser) => (
                  <a
                    key={browser.name}
                    href={browser.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 neo-card hover:shadow-neo-lg transition-all group"
                  >
                    <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {browser.name}
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>

              <h3 className="neo-heading text-xl text-gray-900 mb-4 mt-8">
                Opt-Out Options
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Vercel Analytics:</strong> Analytics are anonymous by
                  default and do not track personal data
                </li>
                <li>
                  <strong>Plausible Analytics:</strong> Privacy-friendly
                  analytics with no personal data collection
                </li>
                <li>
                  <strong>Do Not Track:</strong> We respect browser DNT signals
                  (see section 6)
                </li>
              </ul>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div id="third-party" className="scroll-mt-24">
            <h2 className="neo-heading text-2xl md:text-3xl text-gray-900 mb-6">
              5. Third-Party Cookies
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-6">
                Fleet Feast uses trusted third-party services that may set
                cookies on your device. We carefully select partners who share
                our commitment to privacy and security.
              </p>

              <div className="space-y-4">
                <div className="neo-card p-6">
                  <h3 className="neo-heading text-lg text-gray-900 mb-2">
                    NextAuth.js (Authentication)
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Handles user authentication and session management.
                  </p>
                  <a
                    href="https://next-auth.js.org/configuration/options#cookies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm inline-flex items-center"
                  >
                    Learn more <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>

                <div className="neo-card p-6">
                  <h3 className="neo-heading text-lg text-gray-900 mb-2">
                    Stripe (Payment Processing)
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Processes payments securely and prevents fraud.
                  </p>
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm inline-flex items-center"
                  >
                    Privacy Policy <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>

                <div className="neo-card p-6">
                  <h3 className="neo-heading text-lg text-gray-900 mb-2">
                    Vercel Analytics
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Tracks page views and performance metrics anonymously.
                  </p>
                  <a
                    href="https://vercel.com/docs/analytics/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm inline-flex items-center"
                  >
                    Privacy Policy <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>

                <div className="neo-card p-6">
                  <h3 className="neo-heading text-lg text-gray-900 mb-2">
                    Plausible Analytics
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Privacy-first analytics with no personal data collection.
                  </p>
                  <a
                    href="https://plausible.io/data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm inline-flex items-center"
                  >
                    Data Policy <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Do Not Track */}
          <div id="do-not-track" className="scroll-mt-24">
            <h2 className="neo-heading text-2xl md:text-3xl text-gray-900 mb-6">
              6. Do Not Track (DNT)
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                Fleet Feast respects your browser's "Do Not Track" (DNT) signal.
                When DNT is enabled, we will:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
                <li>Disable analytics cookies (Vercel, Plausible)</li>
                <li>Not track your browsing behavior</li>
                <li>Limit data collection to essential functions only</li>
                <li>Not share your data with third parties for marketing</li>
              </ul>

              <div className="neo-card p-6 bg-blue-50 border-2 border-blue-200">
                <h3 className="neo-heading text-lg text-gray-900 mb-2">
                  How to Enable DNT
                </h3>
                <p className="text-gray-700 mb-2">
                  Most modern browsers support the DNT setting:
                </p>
                <ol className="list-decimal list-inside text-gray-600 space-y-1 ml-4">
                  <li>Open your browser settings/preferences</li>
                  <li>Look for "Privacy" or "Security" section</li>
                  <li>Enable "Do Not Track" or "Send DNT signal"</li>
                  <li>Restart your browser for changes to take effect</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Updates to Policy */}
          <div id="updates" className="scroll-mt-24">
            <h2 className="neo-heading text-2xl md:text-3xl text-gray-900 mb-6">
              7. Updates to This Policy
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                We may update this Cookie Policy from time to time to reflect
                changes in our practices, technology, legal requirements, or
                other factors. When we make changes, we will:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
                <li>Update the "Last Updated" date at the top of this page</li>
                <li>
                  Notify you via email if changes materially affect your rights
                </li>
                <li>
                  Display a notice on our website for significant updates
                </li>
                <li>
                  Request new consent if required by law (e.g., GDPR, CCPA)
                </li>
              </ul>
              <p className="text-gray-700">
                We encourage you to review this Cookie Policy periodically to
                stay informed about how we use cookies and protect your privacy.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div id="contact" className="scroll-mt-24">
            <h2 className="neo-heading text-2xl md:text-3xl text-gray-900 mb-6">
              8. Contact Information
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-6">
                If you have questions or concerns about our use of cookies or
                this Cookie Policy, please contact us:
              </p>

              <div className="neo-card p-6 bg-gradient-to-br from-orange-50 to-white">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                    <a
                      href="mailto:privacy@fleetfeast.com"
                      className="text-primary hover:underline"
                    >
                      privacy@fleetfeast.com
                    </a>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Mailing Address
                    </h3>
                    <p className="text-gray-700">
                      Fleet Feast, Inc.
                      <br />
                      Privacy Team
                      <br />
                      123 Food Truck Lane
                      <br />
                      San Francisco, CA 94102
                      <br />
                      United States
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Response Time
                    </h3>
                    <p className="text-gray-700">
                      We aim to respond to all privacy inquiries within 5
                      business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-12 bg-white border-t border-gray-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="neo-heading text-2xl text-gray-900 mb-6">
            Related Policies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/privacy"
              className="neo-card p-6 hover:shadow-neo-lg transition-all group"
            >
              <h3 className="neo-heading text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
                Privacy Policy
              </h3>
              <p className="text-gray-600 text-sm">
                Learn how we collect, use, and protect your personal data.
              </p>
            </a>
            <a
              href="/terms"
              className="neo-card p-6 hover:shadow-neo-lg transition-all group"
            >
              <h3 className="neo-heading text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
                Terms of Service
              </h3>
              <p className="text-gray-600 text-sm">
                Review the terms and conditions for using Fleet Feast.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 neo-btn-primary p-3 rounded-full shadow-neo-lg hover:shadow-neo-xl transition-all print:hidden z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </MainLayout>
  );
}
