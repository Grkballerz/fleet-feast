import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { TruckHero } from "./components/TruckHero";
import { PhotoGallery } from "./components/PhotoGallery";
import { MenuSection } from "./components/MenuSection";
import { AvailabilityCalendar } from "./components/AvailabilityCalendar";
import { ReviewsSection } from "./components/ReviewsSection";
import { SimilarTrucks } from "./components/SimilarTrucks";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Calendar } from "lucide-react";

/**
 * Fetch truck profile data (Server Component)
 */
async function getTruckProfile(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/trucks/${id}`, {
      cache: "no-store", // Always fetch fresh data
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch truck profile");
    }

    const data = await res.json();
    return data.truck;
  } catch (error) {
    console.error("Error fetching truck profile:", error);
    return null;
  }
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const truck = await getTruckProfile(params.id);

  if (!truck) {
    return {
      title: "Truck Not Found | Fleet Feast",
      description: "The food truck you're looking for could not be found.",
    };
  }

  const rating = truck.averageRating || 0;
  const reviewCount = truck.totalReviews || 0;

  return {
    title: `${truck.businessName} - ${truck.cuisineType} Food Truck | Fleet Feast`,
    description:
      truck.description ||
      `Book ${truck.businessName}, a ${truck.cuisineType.toLowerCase()} food truck for your next event. ${
        rating > 0
          ? `Rated ${rating.toFixed(1)}/5 stars with ${reviewCount} reviews.`
          : "Get started today!"
      }`,
    openGraph: {
      title: truck.businessName,
      description: truck.description || `Book ${truck.businessName} for your event`,
      images: truck.coverImageUrl
        ? [{ url: truck.coverImageUrl }]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: truck.businessName,
      description: truck.description || `Book ${truck.businessName} for your event`,
      images: truck.coverImageUrl ? [truck.coverImageUrl] : [],
    },
  };
}

/**
 * Truck Profile Page
 *
 * Public-facing profile page for a food truck.
 * Displays truck info, photos, menu, availability, reviews, and booking CTA.
 */
export default async function TruckProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const truck = await getTruckProfile(params.id);

  // Truck not found
  if (!truck) {
    notFound();
  }

  // Extract data for components
  const {
    id,
    businessName,
    cuisineType,
    description,
    priceRange,
    capacityMin,
    capacityMax,
    averageRating = 0,
    totalReviews = 0,
    coverImageUrl,
    menu,
    availability = [],
    // photos would come from a separate field in the future
  } = truck;

  // Mock photos for now (replace with actual photo URLs from database)
  const photos = coverImageUrl ? [coverImageUrl] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <TruckHero
        truck={{
          id,
          businessName,
          cuisineType,
          priceRange,
          description,
          averageRating,
          totalReviews,
          coverImageUrl,
        }}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Booking CTA - Sticky on mobile */}
        <div className="lg:hidden sticky top-4 z-10">
          <Link href={`/booking?vendorId=${id}`}>
            <Button size="lg" className="w-full shadow-lg">
              <Calendar className="h-5 w-5 mr-2" />
              Book This Truck
            </Button>
          </Link>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-12">
            {/* About Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-text-primary leading-relaxed">
                  {description || "No description available."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-text-secondary">Capacity</p>
                    <p className="font-semibold">
                      {capacityMin} - {capacityMax} guests
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Cuisine Type</p>
                    <p className="font-semibold">{cuisineType}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Photo Gallery */}
            {photos.length > 0 && (
              <PhotoGallery photos={photos} businessName={businessName} />
            )}

            {/* Menu Section */}
            <MenuSection menu={menu} />

            {/* Reviews Section */}
            <ReviewsSection
              vendorId={id}
              averageRating={averageRating}
              totalReviews={totalReviews}
            />
          </div>

          {/* Sidebar - Right Column (1/3 width) */}
          <div className="space-y-8">
            {/* Desktop Booking CTA */}
            <div className="hidden lg:block sticky top-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {priceRange}
                  </p>
                  <p className="text-sm text-text-secondary">per person</p>
                </div>

                <Link href={`/booking?vendorId=${id}`}>
                  <Button size="lg" className="w-full">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book This Truck
                  </Button>
                </Link>

                <p className="text-xs text-text-secondary text-center">
                  Free cancellation up to 7 days before event
                </p>
              </div>
            </div>

            {/* Availability Calendar */}
            <AvailabilityCalendar
              vendorId={id}
              availability={availability}
              onDateSelect={(date) => {
                // Navigate to booking page with selected date
                window.location.href = `/booking?vendorId=${id}&date=${date}`;
              }}
            />
          </div>
        </div>

        {/* Similar Trucks Section */}
        <SimilarTrucks currentTruckId={id} cuisineType={cuisineType} />
      </div>
    </div>
  );
}
