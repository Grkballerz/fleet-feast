import { Metadata } from "next";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us | Fleet Feast",
  description:
    "Learn about Fleet Feast's mission to connect food truck vendors with event planners. Discover our story, values, and commitment to quality catering.",
  keywords: [
    "about fleet feast",
    "food truck marketplace",
    "company mission",
    "NYC catering",
  ],
  openGraph: {
    title: "About Fleet Feast",
    description:
      "Connecting food truck lovers with the best mobile dining experiences",
    type: "website",
  },
};

/**
 * About Page
 *
 * Company story, mission, values, and team information.
 */
export default function AboutPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Fleet Feast
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We're on a mission to make event catering delicious, easy, and
            stress-free by connecting you with NYC's best food trucks.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Our Story
          </h2>
          <div className="prose prose-lg mx-auto text-gray-600">
            <p>
              Fleet Feast was born from a simple observation: booking food
              trucks for events was unnecessarily complicated. Event planners
              struggled to find reliable vendors, verify quality, and manage
              payments securely. Meanwhile, talented food truck operators were
              missing out on opportunities because they were hard to discover.
            </p>
            <p>
              We set out to solve both problems by creating a trusted
              marketplace that benefits everyone. Today, Fleet Feast connects
              hundreds of event planners with verified food truck vendors across
              New York City, making every event unforgettable.
            </p>
            <p>
              Our platform handles everything from discovery to payment,
              ensuring a smooth experience for customers and vendors alike.
              Every food truck on our platform is verified, insured, and
              committed to delivering exceptional service.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <Card className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Trust & Safety
              </h3>
              <p className="text-gray-600">
                Every vendor is verified, insured, and committed to quality. Our
                secure escrow payment system protects both parties.
              </p>
            </Card>

            {/* Value 2 */}
            <Card className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Quality First
              </h3>
              <p className="text-gray-600">
                We curate our vendor network to ensure consistently high quality.
                Customer reviews and ratings keep standards high.
              </p>
            </Card>

            {/* Value 3 */}
            <Card className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Simplicity
              </h3>
              <p className="text-gray-600">
                Event catering shouldn't be complicated. We streamline every step
                from search to payment to make booking effortless.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Team (Placeholder) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Our Team
          </h2>
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-8">
              We're a passionate team dedicated to revolutionizing event catering
              in New York City. From tech to customer support, everyone at Fleet
              Feast is committed to making your event a success.
            </p>
            <div className="inline-block p-12 bg-gray-100 rounded-lg">
              <svg
                className="h-24 w-24 text-gray-400 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <p className="text-gray-500 mt-4">Team photos coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join Us?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Whether you're planning an event or operating a food truck, we'd love
            to work with you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button
                variant="default"
                size="lg"
                className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100"
              >
                Browse Food Trucks
              </Button>
            </Link>
            <Link href="/vendor/apply">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10"
              >
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Have questions? We're here to help.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
