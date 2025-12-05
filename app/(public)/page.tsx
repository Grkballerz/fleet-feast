import { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "./components/HeroSection";
import { FeaturedTrucks } from "./components/FeaturedTrucks";
import { HowItWorks } from "./components/HowItWorks";
import { Testimonials } from "./components/Testimonials";
import { CTASection } from "./components/CTASection";

export const metadata: Metadata = {
  title: "Fleet Feast | Book Food Trucks for Your Event",
  description:
    "Find and book the best food trucks in NYC for corporate events, weddings, parties, and more. Trusted vendors, secure payments, guaranteed service.",
  keywords: [
    "food truck",
    "catering",
    "NYC",
    "event catering",
    "mobile food",
    "corporate events",
    "wedding catering",
    "food truck booking",
  ],
  openGraph: {
    title: "Fleet Feast | Book Food Trucks for Your Event",
    description:
      "The marketplace for food truck catering. Find trusted vendors for your next event.",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fleet Feast | Book Food Trucks",
    description: "Book the best food trucks in NYC for your event",
    images: ["/og-image.jpg"],
  },
};

/**
 * Homepage
 *
 * Main landing page with hero section, featured trucks,
 * how it works, testimonials, and CTAs.
 */
export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <HeroSection
        headline="Find the Perfect Food Truck for Your Event"
        subheadline="Book trusted food trucks for corporate events, weddings, parties, and more"
        ctaPrimary={{ text: "Find Food Trucks", href: "/search" }}
        ctaSecondary={{ text: "Become a Vendor", href: "/vendor/apply" }}
      />

      {/* Featured Food Trucks */}
      <FeaturedTrucks title="Featured Food Trucks" />

      {/* How It Works */}
      <HowItWorks
        title="How It Works"
        steps={[
          {
            number: 1,
            title: "Search & Compare",
            description:
              "Browse food trucks by cuisine, availability, and reviews",
          },
          {
            number: 2,
            title: "Book & Pay",
            description:
              "Request your date, confirm, and pay securely through the platform",
          },
          {
            number: 3,
            title: "Enjoy Your Event",
            description: "Your food truck arrives ready to serve delicious food",
          },
        ]}
      />

      {/* Testimonials */}
      <Testimonials title="What Our Customers Say" />

      {/* CTA Section - Customers */}
      <CTASection
        title="Ready to Book Your Food Truck?"
        description="Browse our curated selection of verified food trucks and book your next event with confidence."
        ctaText="Browse Food Trucks"
        ctaHref="/search"
        secondaryCtaText="Learn More"
        secondaryCtaHref="/about"
        variant="primary"
      />

      {/* CTA Section - Vendors */}
      <CTASection
        title="Are You a Food Truck Vendor?"
        description="Join Fleet Feast and connect with thousands of customers looking for quality food trucks for their events."
        ctaText="Become a Vendor"
        ctaHref="/vendor/apply"
        secondaryCtaText="Learn More"
        secondaryCtaHref="/for-vendors"
        variant="secondary"
      />
    </MainLayout>
  );
}
