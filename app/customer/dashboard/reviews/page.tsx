"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Rating } from "@/components/ui/Rating";
import { Textarea } from "@/components/ui/Textarea";
import { Star, Calendar, CheckCircle, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface PendingReview {
  bookingId: string;
  vendorName: string;
  eventDate: Date;
  eventType: string;
}

interface SubmittedReview {
  id: string;
  bookingId: string;
  vendorName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  eventDate: Date;
}

// Mock data - replace with real API calls
const MOCK_PENDING_REVIEWS: PendingReview[] = [
  {
    bookingId: "1",
    vendorName: "Taco Fiesta",
    eventDate: new Date("2025-11-28T14:00:00"),
    eventType: "Corporate Event",
  },
  {
    bookingId: "2",
    vendorName: "BBQ Bros",
    eventDate: new Date("2025-11-15T12:00:00"),
    eventType: "Wedding",
  },
];

const MOCK_SUBMITTED_REVIEWS: SubmittedReview[] = [
  {
    id: "1",
    bookingId: "3",
    vendorName: "Pizza Paradise",
    rating: 5,
    comment:
      "Absolutely fantastic! The wood-fired pizzas were a huge hit at our party. The team was professional and the food was amazing. Highly recommend!",
    createdAt: new Date("2025-11-05"),
    eventDate: new Date("2025-11-01T18:00:00"),
  },
  {
    id: "2",
    bookingId: "4",
    vendorName: "Sweet Treats",
    rating: 4,
    comment:
      "Great dessert options and friendly staff. Only minor issue was they arrived 15 minutes late, but the quality made up for it.",
    createdAt: new Date("2025-10-20"),
    eventDate: new Date("2025-10-15T15:00:00"),
  },
  {
    id: "3",
    bookingId: "5",
    vendorName: "Green Garden",
    rating: 5,
    comment:
      "Perfect for our health-conscious event. The vegan options were creative and delicious. Everyone loved it!",
    createdAt: new Date("2025-10-08"),
    eventDate: new Date("2025-10-05T12:00:00"),
  },
];

/**
 * Reviews Page
 *
 * Display pending and submitted reviews with review submission modal
 */
export default function ReviewsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingReviews, setPendingReviews] = React.useState<PendingReview[]>([]);
  const [submittedReviews, setSubmittedReviews] = React.useState<SubmittedReview[]>([]);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState<PendingReview | null>(null);
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setPendingReviews(MOCK_PENDING_REVIEWS);
      setSubmittedReviews(MOCK_SUBMITTED_REVIEWS);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenReviewModal = (booking: PendingReview) => {
    setSelectedBooking(booking);
    setRating(0);
    setComment("");
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
    setRating(0);
    setComment("");
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking || rating === 0) return;

    setIsSubmitting(true);
    try {
      // TODO: API call to submit review
      // await fetch('/api/reviews', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     bookingId: selectedBooking.bookingId,
      //     rating,
      //     comment,
      //   }),
      // })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Move from pending to submitted
      setPendingReviews((prev) =>
        prev.filter((r) => r.bookingId !== selectedBooking.bookingId)
      );
      setSubmittedReviews((prev) => [
        {
          id: Date.now().toString(),
          bookingId: selectedBooking.bookingId,
          vendorName: selectedBooking.vendorName,
          rating,
          comment,
          createdAt: new Date(),
          eventDate: selectedBooking.eventDate,
        },
        ...prev,
      ]);

      handleCloseReviewModal();
    } catch (err) {
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
      <Alert variant="error" title="Error loading reviews">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">My Reviews</h1>
        <p className="text-text-secondary mt-1">
          Share your experience with food truck vendors
        </p>
      </div>

      {/* Pending Reviews Section */}
      {pendingReviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Pending Reviews
            </h2>
            <Badge variant="warning">{pendingReviews.length}</Badge>
          </div>

          <Alert variant="info" title="Your feedback matters!">
            Help other customers by reviewing your recent bookings. Your honest
            feedback helps vendors improve their service.
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReviews.map((booking) => (
              <Card key={booking.bookingId} className="neo-card-glass p-6 neo-shadow rounded-neo">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary text-lg">
                      {booking.vendorName}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(booking.eventDate, "MMM dd, yyyy")}
                      </span>
                      <span>{booking.eventType}</span>
                    </div>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleOpenReviewModal(booking)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Write Review
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Submitted Reviews Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">
            My Reviews ({submittedReviews.length})
          </h2>
        </div>

        {submittedReviews.length === 0 ? (
          <Card className="neo-card-glass p-12 text-center neo-shadow rounded-neo">
            <Star className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No reviews yet
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              {pendingReviews.length > 0
                ? "Complete your pending reviews above to get started."
                : "Your reviews will appear here after you've completed bookings."}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {submittedReviews.map((review) => (
              <Card key={review.id} className="neo-card-glass p-6 neo-shadow rounded-neo">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-text-primary text-lg">
                        {review.vendorName}
                      </h3>
                      <Badge variant="success" size="sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Submitted
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Event: {format(review.eventDate, "MMM dd, yyyy")}
                      </span>
                      <span>
                        Reviewed: {format(review.createdAt, "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="mb-3">
                      <Rating value={review.rating} readOnly size="medium" />
                    </div>
                    {review.comment && (
                      <p className="text-text-secondary">{review.comment}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      <Modal
        open={showReviewModal}
        onClose={handleCloseReviewModal}
        title={`Review ${selectedBooking?.vendorName}`}
      >
        <div className="space-y-6">
          {/* Event Info */}
          <div className="bg-surface-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="w-4 h-4" />
              <span>
                {selectedBooking?.eventType} •{" "}
                {selectedBooking &&
                  format(selectedBooking.eventDate, "MMM dd, yyyy")}
              </span>
            </div>
          </div>

          {/* Rating Input */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              How would you rate this vendor?
              <span className="text-error ml-1">*</span>
            </label>
            <div className="flex items-center gap-4">
              <Rating
                value={rating}
                onChange={setRating}
                size="large"
                interactive
              />
              {rating > 0 && (
                <span className="text-text-secondary">
                  {rating === 5
                    ? "Excellent!"
                    : rating === 4
                    ? "Good"
                    : rating === 3
                    ? "Average"
                    : rating === 2
                    ? "Below Average"
                    : "Poor"}
                </span>
              )}
            </div>
          </div>

          {/* Comment Input */}
          <div>
            <Textarea
              label="Share your experience (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the food quality, service, presentation, and overall experience..."
              rows={6}
              maxLength={1000}
              showCharCount
              helperText="Help other customers by sharing specific details about your experience."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleCloseReviewModal}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={rating === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="small" className="mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-text-tertiary">
            Reviews are public and help other customers make informed decisions.
            Please be honest and constructive in your feedback.
          </p>
        </div>
      </Modal>
    </div>
  );
}
