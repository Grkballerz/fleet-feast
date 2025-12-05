import { Search, TruckIcon, Calendar, Shield } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="container-custom flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-text-primary">Fleet Feast</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/search" className="text-text-secondary hover:text-primary transition-colors">
              Browse Vendors
            </Link>
            <Link href="/about" className="text-text-secondary hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/login" className="text-text-secondary hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container-custom py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="heading-1 mb-6">
            Book NYC's Best Food Trucks for Your Next Event
          </h1>
          <p className="body-text-secondary mb-8 text-lg">
            Connect with verified food truck vendors for corporate events and private parties.
            Easy booking, secure escrow payments, and quality guaranteed.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn-primary">
              Browse Food Trucks
            </Link>
            <Link href="/vendor/apply" className="btn-secondary">
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <h2 className="heading-2 mb-12 text-center">Why Choose Fleet Feast?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="card text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="heading-4 mb-2">Easy Discovery</h3>
              <p className="body-text-secondary">
                Browse verified food truck vendors by cuisine, location, and availability. Filter by
                dietary preferences and budget.
              </p>
            </div>

            <div className="card text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="heading-4 mb-2">Secure Payments</h3>
              <p className="body-text-secondary">
                Protected escrow payments with 7-day dispute resolution. Your payment is released
                only after successful service.
              </p>
            </div>

            <div className="card text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="heading-4 mb-2">Simple Booking</h3>
              <p className="body-text-secondary">
                Request bookings, coordinate details through in-app messaging, and manage
                everything from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container-custom py-16">
        <h2 className="heading-2 mb-12 text-center">How It Works</h2>
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
              1
            </div>
            <div>
              <h3 className="heading-4 mb-2">Search and Discover</h3>
              <p className="body-text-secondary">
                Browse our curated selection of verified food truck vendors. Filter by cuisine
                type, location, and your event date.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
              2
            </div>
            <div>
              <h3 className="heading-4 mb-2">Submit Booking Request</h3>
              <p className="body-text-secondary">
                Provide event details, guest count, and preferred menu. Vendors respond within 48
                hours to accept or propose alternatives.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
              3
            </div>
            <div>
              <h3 className="heading-4 mb-2">Secure Payment</h3>
              <p className="body-text-secondary">
                Once confirmed, complete secure payment through our platform. Funds held in escrow
                until event completion.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
              4
            </div>
            <div>
              <h3 className="heading-4 mb-2">Enjoy Your Event</h3>
              <p className="body-text-secondary">
                The vendor arrives at your location and serves delicious food. After the event,
                funds are released and you can leave a review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-white">
        <div className="container-custom text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Get Started?</h2>
          <p className="mb-8 text-lg opacity-90">
            Join hundreds of satisfied customers who trust Fleet Feast for their catering needs.
          </p>
          <Link href="/register" className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-primary transition-transform hover:scale-105">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8">
        <div className="container-custom">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <TruckIcon className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-text-primary">Fleet Feast</span>
              </div>
              <p className="small-text">
                NYC's trusted food truck marketplace for corporate events and private parties.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-text-primary">For Customers</h4>
              <ul className="space-y-2 small-text">
                <li>
                  <Link href="/search" className="hover:text-primary transition-colors">
                    Browse Vendors
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-primary transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-text-primary">For Vendors</h4>
              <ul className="space-y-2 small-text">
                <li>
                  <Link href="/vendor/apply" className="hover:text-primary transition-colors">
                    Become a Vendor
                  </Link>
                </li>
                <li>
                  <Link href="/vendor/requirements" className="hover:text-primary transition-colors">
                    Requirements
                  </Link>
                </li>
                <li>
                  <Link href="/vendor/pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-text-primary">Company</h4>
              <ul className="space-y-2 small-text">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-8 text-center small-text">
            © 2025 Fleet Feast. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
