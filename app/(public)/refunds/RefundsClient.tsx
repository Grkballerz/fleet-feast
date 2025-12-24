"use client";

import { MainLayout } from "@/components/layout/MainLayout";

/**
 * RefundsClient Component
 *
 * Client component for the Refund Policy page.
 * Displays Fleet Feast's comprehensive refund and cancellation policies.
 */
export function RefundsClient() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="neo-heading-xl text-gray-900 mb-6">Refund Policy</h1>
          <p className="text-xl text-gray-600">
            Clear and fair refund policies to protect both customers and
            vendors
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last Updated: December 2024
          </p>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex flex-wrap gap-3 justify-center text-sm">
            <a
              href="#intro"
              className="text-primary hover:text-primary-dark font-bold transition-colors"
            >
              Introduction
            </a>
            <a
              href="#escrow"
              className="text-primary hover:text-primary-dark font-bold transition-colors"
            >
              Escrow System
            </a>
            <a
              href="#customer-cancellation"
              className="text-primary hover:text-primary-dark font-bold transition-colors"
            >
              Customer Cancellations
            </a>
            <a
              href="#vendor-cancellation"
              className="text-primary hover:text-primary-dark font-bold transition-colors"
            >
              Vendor Cancellations
            </a>
            <a
              href="#disputes"
              className="text-primary hover:text-primary-dark font-bold transition-colors"
            >
              Disputes
            </a>
            <a
              href="#automated"
              className="text-primary hover:text-primary-dark font-bold transition-colors"
            >
              Automated Refunds
            </a>
            <a
              href="#contact"
              className="text-primary hover:text-primary-dark font-bold transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* 1. Introduction */}
          <div id="intro" className="scroll-mt-20">
            <h2 className="neo-heading text-3xl text-gray-900 mb-6">
              1. Introduction
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                At Fleet Feast, we strive to provide fair and transparent
                refund policies that protect both customers and vendors. This
                policy outlines our cancellation terms, refund timelines, and
                dispute resolution process.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Our escrow payment system ensures funds are only released after
                successful event completion, providing security for all parties
                involved.
              </p>
            </div>
          </div>

          {/* 2. Escrow Payment System */}
          <div id="escrow" className="scroll-mt-20">
            <h2 className="neo-heading text-3xl text-gray-900 mb-6">
              2. Escrow Payment System
            </h2>
            <div className="neo-card p-6 md:p-8 bg-white">
              <h3 className="neo-heading text-xl text-gray-900 mb-4">
                How Our Payment System Works
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Payment Made
                    </h4>
                    <p className="text-gray-700">
                      When you book a food truck, your payment is processed
                      securely through Stripe and held in escrow.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      7-Day Hold Period
                    </h4>
                    <p className="text-gray-700">
                      Funds are held for 7 days after your event to allow time
                      for any issues to be reported and resolved.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Payment Released
                    </h4>
                    <p className="text-gray-700">
                      If no disputes are filed, payment is automatically
                      released to the vendor on day 8.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-neo">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-gray-900">Note:</span> This
                  7-day window protects both parties and ensures quality
                  service delivery.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Customer Cancellation Refunds */}
          <div id="customer-cancellation" className="scroll-mt-20">
            <h2 className="neo-heading text-3xl text-gray-900 mb-6">
              3. Customer Cancellation Refunds
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              If you need to cancel your booking, refund amounts depend on how
              far in advance you cancel:
            </p>
            <div className="neo-card overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Cancellation Timing
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Refund Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">
                        7 or more days before event
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                          100% Full Refund
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">
                        3-6 days before event
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800">
                          50% Partial Refund
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">
                        Less than 3 days before event
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                          No Refund
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-neo">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-gray-900">Important:</span>{" "}
                Cancellations must be submitted through your dashboard. Email
                or phone cancellations are not automatically processed.
              </p>
            </div>
          </div>

          {/* 4. Vendor Cancellation Compensation */}
          <div id="vendor-cancellation" className="scroll-mt-20">
            <h2 className="neo-heading text-3xl text-gray-900 mb-6">
              4. Vendor Cancellation Compensation
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              If a vendor cancels your booking, you are entitled to compensation
              based on the timing of cancellation:
            </p>
            <div className="neo-card overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Cancellation Timing
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Customer Receives
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">
                        7 or more days before event
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        Full refund OR replacement vendor at same price
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">
                        3-6 days before event
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        Full refund + replacement vendor offered (if available)
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">
                        Less than 3 days before event
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-700">
                          Full refund + $100 Fleet Feast credit
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 bg-red-50">
                      <td className="px-6 py-4 text-gray-900 font-bold">
                        Vendor no-show (day of event)
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-red-700">
                          Full refund + $100 Fleet Feast credit
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-neo">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-gray-900">
                  Our Commitment:
                </span>{" "}
                We work hard to find replacement vendors when cancellations
                occur. Credits can be used for future bookings on Fleet Feast.
              </p>
            </div>
          </div>

          {/* 5. Dispute Resolution */}
          <div id="disputes" className="scroll-mt-20">
            <h2 className="neo-heading text-3xl text-gray-900 mb-6">
              5. Dispute Resolution
            </h2>
            <div className="neo-card p-6 md:p-8 bg-white">
              <h3 className="neo-heading text-xl text-gray-900 mb-4">
                Filing a Dispute
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                You have 7 days after your event to file a dispute if you
                experienced issues with service quality, timeliness, or other
                problems.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Submit Dispute Form
                    </h4>
                    <p className="text-gray-700">
                      Access your booking dashboard and click "File Dispute."
                      Provide detailed information and supporting evidence
                      (photos, videos, witness statements).
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Review Process
                    </h4>
                    <p className="text-gray-700">
                      Our team reviews all evidence from both parties within 3-5
                      business days. We may contact you for additional
                      information.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Resolution</h4>
                    <p className="text-gray-700">
                      We make a final decision based on evidence and issue
                      appropriate refunds, credits, or other remedies.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-neo">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-gray-900">Tip:</span> Include
                  photos, timestamps, and detailed descriptions to support your
                  dispute. The more evidence you provide, the faster we can
                  resolve the issue.
                </p>
              </div>
            </div>
          </div>

          {/* 6. Automated Refund Triggers */}
          <div id="automated" className="scroll-mt-20">
            <h2 className="neo-heading text-3xl text-gray-900 mb-6">
              6. Automated Refund Triggers
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Our system automatically processes partial or full refunds for
              certain verified issues:
            </p>
            <div className="neo-card overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Issue Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Automatic Resolution
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-bold">
                        Vendor no-show
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-700">
                          Full refund + $100 credit
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">
                        Late arrival (30-60 minutes)
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-700">
                          10% automatic refund
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">
                        Late arrival (60+ minutes)
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-700">
                          25% automatic refund
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-neo">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-gray-900">
                  How It Works:
                </span>{" "}
                GPS tracking and check-in timestamps verify arrival times. No
                action needed - refunds are processed automatically within 3
                business days.
              </p>
            </div>
          </div>

          {/* 7. Manual Review Cases */}
          <div id="manual-review" className="scroll-mt-20">
            <h2 className="neo-heading text-3xl text-gray-900 mb-6">
              7. Manual Review Cases
            </h2>
            <div className="neo-card p-6 md:p-8 bg-white">
              <p className="text-gray-700 mb-6 leading-relaxed">
                The following issues require manual review and cannot be
                automatically resolved:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 text-primary font-bold">
                    •
                  </span>
                  <div>
                    <span className="font-bold text-gray-900">
                      Food Quality Issues:
                    </span>
                    <span className="text-gray-700">
                      {" "}
                      Undercooked, overcooked, or food that does not match menu
                      description
                    </span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 text-primary font-bold">
                    •
                  </span>
                  <div>
                    <span className="font-bold text-gray-900">
                      Wrong Items:
                    </span>
                    <span className="text-gray-700">
                      {" "}
                      Food truck served different items than confirmed in
                      booking
                    </span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 text-primary font-bold">
                    •
                  </span>
                  <div>
                    <span className="font-bold text-gray-900">
                      Quantity Issues:
                    </span>
                    <span className="text-gray-700">
                      {" "}
                      Insufficient food for guest count or portions smaller than
                      agreed
                    </span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 text-primary font-bold">
                    •
                  </span>
                  <div>
                    <span className="font-bold text-gray-900">
                      Service Issues:
                    </span>
                    <span className="text-gray-700">
                      {" "}
                      Unprofessional behavior, health/safety violations,
                      equipment failures
                    </span>
                  </div>
                </li>
              </ul>
              <p className="text-gray-700 mt-6 leading-relaxed">
                Submit a dispute with photos and detailed descriptions. Our team
                reviews within 3-5 business days and determines appropriate
                refunds based on severity.
              </p>
            </div>
          </div>

          {/* 8. Refund Processing Timeline */}
          <div id="processing" className="scroll-mt-20">
            <h2 className="neo-heading text-3xl text-gray-900 mb-6">
              8. Refund Processing Timeline
            </h2>
            <div className="neo-card p-6 md:p-8 bg-white">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Once a refund is approved, processing times are as follows:
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-24 text-sm font-bold text-primary">
                    Day 1-2
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      Refund initiated in our system and sent to payment
                      processor
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-24 text-sm font-bold text-primary">
                    Day 3-5
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      Payment processor returns funds to your original payment
                      method
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-24 text-sm font-bold text-primary">
                    Day 5-10
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      Funds appear in your bank account (timing depends on your
                      bank)
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-neo">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-gray-900">Note:</span> Total
                  refund processing typically takes 5-10 business days. If you
                  do not see your refund after 10 business days, contact
                  support.
                </p>
              </div>
            </div>
          </div>

          {/* 9. Non-Refundable Items */}
          <div id="non-refundable" className="scroll-mt-20">
            <h2 className="neo-heading text-3xl text-gray-900 mb-6">
              9. Non-Refundable Items
            </h2>
            <div className="neo-card p-6 md:p-8 bg-white">
              <p className="text-gray-700 mb-6 leading-relaxed">
                The following are not eligible for refunds:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 text-red-600 font-bold">
                    ✗
                  </span>
                  <div>
                    <span className="font-bold text-gray-900">
                      Fleet Feast Service Fees:
                    </span>
                    <span className="text-gray-700">
                      {" "}
                      Platform fees are non-refundable even if booking is
                      canceled
                    </span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 text-red-600 font-bold">
                    ✗
                  </span>
                  <div>
                    <span className="font-bold text-gray-900">
                      Completed Services:
                    </span>
                    <span className="text-gray-700">
                      {" "}
                      Events that were completed as agreed (unless dispute is
                      filed within 7 days)
                    </span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 text-red-600 font-bold">
                    ✗
                  </span>
                  <div>
                    <span className="font-bold text-gray-900">
                      Last-Minute Cancellations:
                    </span>
                    <span className="text-gray-700">
                      {" "}
                      Customer cancellations less than 3 days before event
                    </span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 text-red-600 font-bold">
                    ✗
                  </span>
                  <div>
                    <span className="font-bold text-gray-900">
                      Weather-Related:
                    </span>
                    <span className="text-gray-700">
                      {" "}
                      Cancellations due to weather are subject to standard
                      cancellation policy
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* 10. Contact for Refund Issues */}
          <div id="contact" className="scroll-mt-20">
            <h2 className="neo-heading text-3xl text-gray-900 mb-6">
              10. Contact for Refund Issues
            </h2>
            <div className="neo-card p-6 md:p-8 bg-white">
              <p className="text-gray-700 mb-6 leading-relaxed">
                If you have questions about our refund policy or need assistance
                with a refund:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-neo border-2 border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">Email</h4>
                  <a
                    href="mailto:refunds@fleetfeast.com"
                    className="text-primary hover:text-primary-dark transition-colors"
                  >
                    refunds@fleetfeast.com
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    Response within 24 hours
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-neo border-2 border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">Phone</h4>
                  <a
                    href="tel:1-800-FLEET-23"
                    className="text-primary hover:text-primary-dark transition-colors"
                  >
                    1-800-FLEET-23
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    Mon-Fri 9am-6pm EST
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-neo border-2 border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">
                    Customer Dashboard
                  </h4>
                  <a
                    href="/dashboard"
                    className="text-primary hover:text-primary-dark transition-colors"
                  >
                    File dispute online
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    24/7 self-service
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-neo border-2 border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">Live Chat</h4>
                  <p className="text-gray-700">Available on all pages</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Mon-Fri 9am-6pm EST
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-neo">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-gray-900">
                    Need immediate help?
                  </span>{" "}
                  For urgent refund issues on event day, call our support line
                  for priority assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          nav,
          footer {
            display: none;
          }
          .neo-card {
            break-inside: avoid;
          }
          a {
            text-decoration: underline;
          }
        }
      `}</style>
    </MainLayout>
  );
}
