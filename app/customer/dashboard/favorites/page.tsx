"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Heart, Star, MapPin, Users, DollarSign, Calendar, Trash2 } from "lucide-react";
import { CuisineType } from "@/types";

interface FavoriteVendor {
  id: string;
  businessName: string;
  cuisineType: CuisineType[];
  description: string;
  pricePerPerson: number;
  minimumGuests: number;
  maximumGuests: number;
  rating: number;
  reviewCount: number;
  logoUrl?: string;
  city: string;
  state: string;
  addedAt: Date;
}

// Mock data - replace with real API calls
const MOCK_FAVORITES: FavoriteVendor[] = [
  {
    id: "1",
    businessName: "Taco Fiesta",
    cuisineType: [CuisineType.MEXICAN],
    description: "Authentic Mexican street food with fresh ingredients",
    pricePerPerson: 15,
    minimumGuests: 25,
    maximumGuests: 200,
    rating: 4.8,
    reviewCount: 156,
    logoUrl: "/placeholder-logo.png",
    city: "Austin",
    state: "TX",
    addedAt: new Date("2025-11-15"),
  },
  {
    id: "2",
    businessName: "Pizza Paradise",
    cuisineType: [CuisineType.ITALIAN],
    description: "Wood-fired pizzas and Italian specialties",
    pricePerPerson: 18,
    minimumGuests: 20,
    maximumGuests: 150,
    rating: 4.6,
    reviewCount: 89,
    city: "Austin",
    state: "TX",
    addedAt: new Date("2025-11-20"),
  },
  {
    id: "3",
    businessName: "BBQ Bros",
    cuisineType: [CuisineType.BBQ],
    description: "Award-winning Texas BBQ with all the fixings",
    pricePerPerson: 22,
    minimumGuests: 30,
    maximumGuests: 300,
    rating: 4.9,
    reviewCount: 234,
    city: "Austin",
    state: "TX",
    addedAt: new Date("2025-11-25"),
  },
  {
    id: "4",
    businessName: "Green Garden",
    cuisineType: [CuisineType.VEGETARIAN],
    description: "Fresh vegetarian and vegan cuisine",
    pricePerPerson: 16,
    minimumGuests: 15,
    maximumGuests: 100,
    rating: 4.7,
    reviewCount: 67,
    city: "Austin",
    state: "TX",
    addedAt: new Date("2025-12-01"),
  },
  {
    id: "5",
    businessName: "Sweet Treats",
    cuisineType: [CuisineType.DESSERT],
    description: "Artisan desserts, ice cream, and sweet creations",
    pricePerPerson: 12,
    minimumGuests: 10,
    maximumGuests: 150,
    rating: 4.9,
    reviewCount: 178,
    city: "Austin",
    state: "TX",
    addedAt: new Date("2025-12-03"),
  },
];

/**
 * Favorites Page
 *
 * Display user's favorite food trucks with quick booking and management options
 */
export default function FavoritesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [favorites, setFavorites] = React.useState<FavoriteVendor[]>([]);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setFavorites(MOCK_FAVORITES);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleRemoveFavorite = async (vendorId: string) => {
    setRemovingId(vendorId);
    try {
      // TODO: API call to remove favorite
      // await fetch(`/api/favorites/${vendorId}`, { method: 'DELETE' })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setFavorites((prev) => prev.filter((v) => v.id !== vendorId));
    } catch (err) {
      setError("Failed to remove favorite. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleBookNow = (vendorId: string) => {
    router.push(`/booking?vendorId=${vendorId}`);
  };

  const handleViewDetails = (vendorId: string) => {
    router.push(`/vendors/${vendorId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error loading favorites">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Favorites</h1>
          <p className="text-text-secondary mt-1">
            {favorites.length} {favorites.length === 1 ? "vendor" : "vendors"} saved
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/search")}>
          <Calendar className="w-4 h-4 mr-2" />
          Browse Trucks
        </Button>
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No favorites yet
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Start exploring food trucks and save your favorites for quick access
            later.
          </p>
          <Button onClick={() => router.push("/search")}>
            Browse Food Trucks
          </Button>
        </Card>
      ) : (
        /* Favorites Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((vendor) => (
            <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Card Header with Remove Button */}
              <div className="p-6 pb-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3
                      className="text-xl font-semibold text-text-primary hover:text-primary cursor-pointer"
                      onClick={() => handleViewDetails(vendor.id)}
                    >
                      {vendor.businessName}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {vendor.cuisineType.map((cuisine) => (
                        <Badge key={cuisine} variant="neutral" size="sm">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFavorite(vendor.id)}
                    disabled={removingId === vendor.id}
                    className="text-error hover:text-error hover:bg-error/10"
                    aria-label="Remove from favorites"
                  >
                    {removingId === vendor.id ? (
                      <Spinner size="small" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-semibold text-text-primary">
                      {vendor.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-text-tertiary text-sm">
                    ({vendor.reviewCount} reviews)
                  </span>
                </div>

                {/* Description */}
                <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                  {vendor.description}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <DollarSign className="w-4 h-4" />
                    <span>${vendor.pricePerPerson}/person</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {vendor.city}, {vendor.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Users className="w-4 h-4" />
                    <span>
                      {vendor.minimumGuests}-{vendor.maximumGuests} guests
                    </span>
                  </div>
                  <div className="text-sm text-text-tertiary">
                    Added {new Date(vendor.addedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer with Actions */}
              <div className="p-6 pt-4 border-t border-border bg-surface-secondary/30">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDetails(vendor.id)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleBookNow(vendor.id)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Alert */}
      {favorites.length > 0 && (
        <Alert variant="info" title="Quick Booking Tip">
          Click "Book Now" on any favorite to start a booking request. Your
          favorite vendors will also appear at the top of search results.
        </Alert>
      )}
    </div>
  );
}
