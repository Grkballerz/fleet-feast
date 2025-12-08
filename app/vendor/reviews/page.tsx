"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Star, MessageCircle, TrendingUp, Award } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  response?: string;
  respondedAt?: string;
  booking: {
    id: string;
    eventDate: string;
    eventType: string;
  };
  reviewer: {
    id: string;
    name: string;
    email: string;
  };
}

interface RatingBreakdown {
  [key: number]: number;
}

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch vendor profile for ID
      const profileRes = await fetch("/api/vendor/profile");
      if (!profileRes.ok) throw new Error("Failed to fetch vendor profile");
      const profileData = await profileRes.json();
      const vendorId = profileData.data?.id;

      if (!vendorId) throw new Error("Vendor profile not found");

      // Fetch reviews
      const reviewsRes = await fetch(`/api/reviews/vendor/${vendorId}`);
      if (!reviewsRes.ok) throw new Error("Failed to fetch reviews");
      const reviewsData = await reviewsRes.json();

      const reviewsList = reviewsData.data?.items || [];
      setReviews(reviewsList);

      // Calculate average rating
      if (reviewsList.length > 0) {
        const totalRating = reviewsList.reduce(
          (sum: number, r: Review) => sum + r.rating,
          0
        );
        setAverageRating(totalRating / reviewsList.length);
      }

      // Calculate rating breakdown
      const breakdown: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviewsList.forEach((review: Review) => {
        breakdown[review.rating]++;
      });
      setRatingBreakdown(breakdown);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToReview = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response || "");
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    try {
      setResponding(true);

      // Note: This would need a backend endpoint to handle review responses
      // For now, we'll just close the modal
      // In production: POST /api/reviews/{id}/respond

      alert("Review response feature coming soon!");
      setShowResponseModal(false);
      setSelectedReview(null);
      setResponseText("");
    } catch (err: any) {
      alert(err.message || "Failed to submit response");
    } finally {
      setResponding(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating ? "fill-warning text-warning" : "text-border"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (stars: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 w-20">
          <span className="text-sm font-medium text-text-primary">{stars}</span>
          <Star className="w-4 h-4 fill-warning text-warning" />
        </div>
        <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-warning rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-text-secondary w-12 text-right">
          {count}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary neo-heading">Reviews</h2>
        <p className="text-text-secondary mt-1">
          Manage and respond to customer reviews
        </p>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="neo-card-glass neo-shadow rounded-neo p-6 lg:col-span-1">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-4">
              <Star className="w-12 h-12 fill-warning text-warning" />
            </div>
            <p className="text-4xl font-bold text-text-primary mb-2">
              {averageRating.toFixed(1)}
            </p>
            <div className="flex items-center justify-center mb-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-sm text-text-secondary">
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="neo-card-glass neo-shadow rounded-neo p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-text-primary neo-heading mb-4">
            Rating Breakdown
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) =>
              renderRatingBar(stars, ratingBreakdown[stars], reviews.length)
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="neo-card-glass neo-shadow rounded-neo p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary neo-heading">
            All Reviews ({reviews.length})
          </h3>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No reviews yet
            </h3>
            <p className="text-text-secondary">
              When customers leave reviews, they'll appear here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="pb-6 border-b border-border last:border-b-0 last:pb-0"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-text-primary">
                      {review.reviewer.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-text-secondary">
                        • {format(parseISO(review.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                  <Badge variant="neutral">
                    {review.booking.eventType}
                  </Badge>
                </div>

                {/* Review Comment */}
                {review.comment && (
                  <p className="text-text-secondary mb-3">{review.comment}</p>
                )}

                {/* Vendor Response */}
                {review.response ? (
                  <div className="mt-4 p-4 bg-background rounded-lg border-l-4 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm text-text-primary">
                        Your Response
                      </span>
                      {review.respondedAt && (
                        <span className="text-xs text-text-secondary">
                          • {format(parseISO(review.respondedAt), "MMM dd, yyyy")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">{review.response}</p>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRespondToReview(review)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Respond to Review
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedReview && (
        <Modal
          isOpen={showResponseModal}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedReview(null);
            setResponseText("");
          }}
          title="Respond to Review"
        >
          <div className="space-y-4">
            {/* Original Review */}
            <div className="p-4 bg-background rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {renderStars(selectedReview.rating)}
                <span className="text-sm text-text-secondary">
                  by {selectedReview.reviewer.name}
                </span>
              </div>
              {selectedReview.comment && (
                <p className="text-sm text-text-secondary">
                  {selectedReview.comment}
                </p>
              )}
            </div>

            {/* Response Input */}
            <Textarea
              label="Your Response"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Thank the customer and address any concerns..."
              rows={4}
              maxLength={500}
              showCharCount
            />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={submitResponse}
                disabled={!responseText.trim() || responding}
              >
                {responding ? <Spinner size="sm" /> : "Submit Response"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedReview(null);
                  setResponseText("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
