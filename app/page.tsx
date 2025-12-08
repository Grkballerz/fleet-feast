import { TruckIcon } from "lucide-react";
import Link from "next/link";
import { HeroSection } from "./(public)/components/HeroSection";
import { FeaturedTrucks } from "./(public)/components/FeaturedTrucks";
import { HowItWorks } from "./(public)/components/HowItWorks";
import { Testimonials } from "./(public)/components/Testimonials";
import { CTASection } from "./(public)/components/CTASection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Neo-brutalist glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 neo-glass-header neo-border-thin transition-all duration-300">
        <div className="container-custom flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <TruckIcon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-2xl neo-heading bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Fleet Feast
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/search"
              className="text-gray-600 hover:text-primary transition-colors font-bold"
            >
              Browse Vendors
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-primary transition-colors font-bold"
            >
              About
            </Link>
            <Link
              href="/login"
              className="text-gray-600 hover:text-primary transition-colors font-bold"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="neo-btn-primary px-6 py-2.5 rounded-neo"
            >
              Get Started
            </Link>
          </nav>
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-neo hover:bg-gray-100 transition-colors neo-border-thin">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Trucks */}
      <FeaturedTrucks />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <CTASection
        title="Ready to Make Your Event Unforgettable?"
        description="Join hundreds of satisfied customers who trust Fleet Feast for their catering needs. Browse our selection of verified food trucks today."
        ctaText="Find Food Trucks"
        ctaHref="/search"
        secondaryCtaText="Become a Vendor"
        secondaryCtaHref="/vendor/apply"
      />

      {/* Footer - Modern design */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container-custom">
          <div className="grid gap-12 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <TruckIcon className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                  Fleet Feast
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                NYC's trusted food truck marketplace for corporate events, weddings, and private parties.
              </p>
              {/* Social Links */}
              <div className="flex gap-4">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                  <a
                    key={social}
                    href={`#${social}`}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors duration-300"
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">For Customers</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Browse Vendors', href: '/search' },
                  { label: 'How It Works', href: '/about' },
                  { label: 'FAQ', href: '/faq' },
                  { label: 'Contact Us', href: '/contact' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">For Vendors</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Become a Vendor', href: '/vendor/apply' },
                  { label: 'Vendor Requirements', href: '/vendor/requirements' },
                  { label: 'Pricing', href: '/vendor/pricing' },
                  { label: 'Vendor Login', href: '/login' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Company</h4>
              <ul className="space-y-4">
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'Careers', href: '/careers' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 Fleet Feast. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Vendors
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure Payments
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                4.8 Average Rating
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
