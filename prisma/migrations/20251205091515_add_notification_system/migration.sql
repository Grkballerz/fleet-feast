-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_REQUEST', 'BOOKING_ACCEPTED', 'BOOKING_DECLINED', 'BOOKING_CANCELLED', 'PAYMENT_CONFIRMED', 'NEW_MESSAGE', 'EVENT_REMINDER', 'REVIEW_PROMPT', 'DISPUTE_CREATED', 'DISPUTE_RESOLVED', 'VIOLATION_WARNING', 'ACCOUNT_STATUS_CHANGED');

-- CreateEnum
CREATE TYPE "QuoteRequestStatus" AS ENUM ('OPEN', 'CLOSED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status_expires_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "violations" ADD COLUMN     "appeal_decision" TEXT,
ADD COLUMN     "appeal_notes" TEXT,
ADD COLUMN     "appeal_reviewed_at" TIMESTAMP(3),
ADD COLUMN     "appeal_reviewed_by" TEXT,
ADD COLUMN     "appealed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "automated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "source_id" TEXT;

-- CreateTable
CREATE TABLE "quote_requests" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "event_date" DATE NOT NULL,
    "event_type" "EventType" NOT NULL,
    "guest_count" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "budget" DECIMAL(10,2),
    "status" "QuoteRequestStatus" NOT NULL DEFAULT 'OPEN',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "pricing" JSONB NOT NULL,
    "inclusions" TEXT[],
    "terms" TEXT,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "booking_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "metadata" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_booking_request" BOOLEAN NOT NULL DEFAULT true,
    "email_booking_accepted" BOOLEAN NOT NULL DEFAULT true,
    "email_booking_declined" BOOLEAN NOT NULL DEFAULT true,
    "email_booking_cancelled" BOOLEAN NOT NULL DEFAULT true,
    "email_payment_confirmed" BOOLEAN NOT NULL DEFAULT true,
    "email_new_message" BOOLEAN NOT NULL DEFAULT true,
    "email_event_reminder" BOOLEAN NOT NULL DEFAULT true,
    "email_review_prompt" BOOLEAN NOT NULL DEFAULT true,
    "email_dispute_created" BOOLEAN NOT NULL DEFAULT true,
    "email_dispute_resolved" BOOLEAN NOT NULL DEFAULT true,
    "email_violation_warning" BOOLEAN NOT NULL DEFAULT true,
    "email_account_status_changed" BOOLEAN NOT NULL DEFAULT true,
    "email_digest" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quote_requests_customer_id_created_at_idx" ON "quote_requests"("customer_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "quote_requests_status_expires_at_idx" ON "quote_requests"("status", "expires_at");

-- CreateIndex
CREATE INDEX "quote_requests_event_date_idx" ON "quote_requests"("event_date");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_booking_id_key" ON "quotes"("booking_id");

-- CreateIndex
CREATE INDEX "quotes_request_id_status_idx" ON "quotes"("request_id", "status");

-- CreateIndex
CREATE INDEX "quotes_vendor_id_created_at_idx" ON "quotes"("vendor_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "quotes_status_valid_until_idx" ON "quotes"("status", "valid_until");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_request_id_vendor_id_key" ON "quotes"("request_id", "vendor_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_created_at_idx" ON "notifications"("user_id", "read", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_user_id_type_idx" ON "notifications"("user_id", "type");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "notification_preferences_user_id_idx" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "violations_automated_severity_idx" ON "violations"("automated", "severity");

-- CreateIndex
CREATE INDEX "violations_appealed_appeal_decision_idx" ON "violations"("appealed", "appeal_decision");

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
