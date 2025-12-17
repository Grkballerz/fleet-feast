import { HeroSection } from "./(public)/components/HeroSection";
import { FeaturedTrucks } from "./(public)/components/FeaturedTrucks";
import { HowItWorks } from "./(public)/components/HowItWorks";
import { Testimonials } from "./(public)/components/Testimonials";
import { CTASection } from "./(public)/components/CTASection";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with mobile nav support */}
      <Header />

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

      {/* Footer */}
      <Footer />
    </div>
  );
}
