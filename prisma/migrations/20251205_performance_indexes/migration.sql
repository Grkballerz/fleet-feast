-- Performance Optimization Migration
-- Generated: 2025-12-05
-- Agent: Peyton_Performance
-- Purpose: Add missing indexes for query optimization
-- Note: CONCURRENTLY removed to allow execution within Prisma transaction

-- Vendors table: Optimize search queries
CREATE INDEX IF NOT EXISTS "idx_vendors_cuisine_price_rating"
ON "vendors" ("cuisine_type", "price_range", "status")
WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_vendors_capacity_search"
ON "vendors" ("capacity_min", "capacity_max", "status")
WHERE "deleted_at" IS NULL AND "status" = 'APPROVED';

-- Full-text search index for vendor search
CREATE INDEX IF NOT EXISTS "idx_vendors_fts"
ON "vendors" USING GIN (
  to_tsvector('english', COALESCE("business_name", '') || ' ' || COALESCE("description", ''))
);

-- Vendor menus: Full-text search on menu items
CREATE INDEX IF NOT EXISTS "idx_vendor_menus_fts"
ON "vendor_menus" USING GIN (
  to_tsvector('english', COALESCE(items::text, ''))
);

-- Bookings table: Dashboard query optimization
CREATE INDEX IF NOT EXISTS "idx_bookings_customer_status"
ON "bookings" ("customer_id", "status", "event_date" DESC);

CREATE INDEX IF NOT EXISTS "idx_bookings_vendor_status"
ON "bookings" ("vendor_id", "status", "event_date" DESC);

CREATE INDEX IF NOT EXISTS "idx_bookings_event_upcoming"
ON "bookings" ("event_date", "status");

-- Reviews table: Aggregate queries
CREATE INDEX IF NOT EXISTS "idx_reviews_reviewee_rating"
ON "reviews" ("reviewee_id", "rating", "created_at" DESC)
WHERE "hidden" = false AND "deleted_at" IS NULL;

-- Availability table: Fast date lookups
CREATE INDEX IF NOT EXISTS "idx_availability_vendor_date_range"
ON "availability" ("vendor_id", "date", "is_available")
WHERE "is_available" = true;

-- Payments table: Escrow release queries
CREATE INDEX IF NOT EXISTS "idx_payments_release_queue"
ON "payments" ("status", "captured_at")
WHERE "status" = 'CAPTURED' AND "released_at" IS NULL;

-- Messages table: Conversation queries
CREATE INDEX IF NOT EXISTS "idx_messages_booking_unread"
ON "messages" ("booking_id", "created_at" ASC)
WHERE "deleted_at" IS NULL;

-- Notifications table: Unread count queries
CREATE INDEX IF NOT EXISTS "idx_notifications_user_unread"
ON "notifications" ("user_id", "created_at" DESC)
WHERE "read" = false;

-- Quote requests: Active quotes dashboard
CREATE INDEX IF NOT EXISTS "idx_quote_requests_active"
ON "quote_requests" ("status", "expires_at")
WHERE "status" = 'OPEN';

-- Composite index for vendor search with location
CREATE INDEX IF NOT EXISTS "idx_vendors_search_composite"
ON "vendors" ("status", "cuisine_type", "price_range", "approved_at" DESC)
WHERE "deleted_at" IS NULL AND "status" = 'APPROVED';

-- Optimize user role-based queries
CREATE INDEX IF NOT EXISTS "idx_users_role_status"
ON "users" ("role", "status")
WHERE "deleted_at" IS NULL;

-- Add covering index for truck listings (reduce table lookups)
CREATE INDEX IF NOT EXISTS "idx_vendors_listing_covering"
ON "vendors" (
  "id",
  "business_name",
  "cuisine_type",
  "price_range",
  "capacity_min",
  "capacity_max",
  "service_area",
  "status",
  "approved_at"
)
WHERE "deleted_at" IS NULL AND "status" = 'APPROVED';

-- Performance monitoring: Track slow queries
COMMENT ON INDEX "idx_vendors_fts" IS 'Full-text search optimization for vendor discovery';
COMMENT ON INDEX "idx_vendor_menus_fts" IS 'Full-text search on menu items for advanced search';
COMMENT ON INDEX "idx_bookings_event_upcoming" IS 'Optimize upcoming events dashboard queries';
COMMENT ON INDEX "idx_payments_release_queue" IS 'Escrow release cron job optimization';
