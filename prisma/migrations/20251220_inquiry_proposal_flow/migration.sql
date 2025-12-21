-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('CHECKING', 'SAVINGS');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('ACH', 'EFT', 'WIRE');

-- CreateEnum
CREATE TYPE "EscrowTransactionType" AS ENUM ('HOLD', 'CAPTURE', 'RELEASE', 'REFUND');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterEnum: Migrate BookingStatus from PENDING to INQUIRY
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('INQUIRY', 'PROPOSAL_SENT', 'ACCEPTED', 'PAID', 'CONFIRMED', 'COMPLETED', 'DECLINED', 'EXPIRED', 'CANCELLED');
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;

-- Data migration: PENDING → INQUIRY
UPDATE "bookings" SET "status" = 'INQUIRY' WHERE "status" = 'PENDING';

ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'INQUIRY';
COMMIT;

-- AlterEnum: Add new NotificationType values
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

ALTER TYPE "NotificationType" ADD VALUE 'INQUIRY_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'PROPOSAL_SENT';
ALTER TYPE "NotificationType" ADD VALUE 'PROPOSAL_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'PROPOSAL_EXPIRING';
ALTER TYPE "NotificationType" ADD VALUE 'PROPOSAL_EXPIRED';

-- DropIndex: Remove Stripe-specific indexes (from previous migration cleanup)
DROP INDEX IF EXISTS "payments_stripe_payment_intent_id_idx";
DROP INDEX IF EXISTS "payments_stripe_payment_intent_id_key";
DROP INDEX IF EXISTS "payments_stripe_transfer_id_key";
DROP INDEX IF EXISTS "vendors_stripe_account_id_idx";
DROP INDEX IF EXISTS "vendors_stripe_account_id_key";

-- AlterTable: Add proposal fields to bookings
ALTER TABLE "bookings" ADD COLUMN     "platform_fee_customer" DECIMAL(10,2),
ADD COLUMN     "platform_fee_vendor" DECIMAL(10,2),
ADD COLUMN     "proposal_amount" DECIMAL(10,2),
ADD COLUMN     "proposal_details" JSONB,
ADD COLUMN     "proposal_expires_at" TIMESTAMP(3),
ADD COLUMN     "proposal_sent_at" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'INQUIRY';

-- AlterTable: Add proposal notification preferences
ALTER TABLE "notification_preferences" ADD COLUMN     "email_inquiry_received" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "email_proposal_accepted" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "email_proposal_expired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "email_proposal_expiring" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "email_proposal_sent" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Update payments table (cleanup from Stripe removal)
ALTER TABLE "payments" DROP COLUMN IF EXISTS "stripe_payment_intent_id",
DROP COLUMN IF EXISTS "stripe_transfer_id",
ADD COLUMN     "external_payment_id" TEXT,
ADD COLUMN     "external_transfer_id" TEXT;

-- AlterTable: Add bank account fields to vendors
ALTER TABLE "vendors" DROP COLUMN IF EXISTS "stripe_account_id",
DROP COLUMN IF EXISTS "stripe_connected",
ADD COLUMN     "bank_account_holder" TEXT,
ADD COLUMN     "bank_account_number" TEXT,
ADD COLUMN     "bank_account_type" "BankAccountType",
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "bank_routing_number" TEXT,
ADD COLUMN     "bank_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bank_verified_at" TIMESTAMP(3),
ADD COLUMN     "payout_method" "PayoutMethod";

-- CreateTable: Escrow transactions
CREATE TABLE "escrow_transactions" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "type" "EscrowTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "EscrowStatus" NOT NULL DEFAULT 'PENDING',
    "helcim_transaction_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "escrow_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Vendor payouts
CREATE TABLE "vendor_payouts" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "payout_method" "PayoutMethod",
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "processed_at" TIMESTAMP(3),
    "external_reference" TEXT,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Vendor payout bookings (join table)
CREATE TABLE "vendor_payout_bookings" (
    "id" TEXT NOT NULL,
    "payout_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_payout_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Escrow transactions indexes
CREATE UNIQUE INDEX "escrow_transactions_helcim_transaction_id_key" ON "escrow_transactions"("helcim_transaction_id");
CREATE INDEX "escrow_transactions_booking_id_type_created_at_idx" ON "escrow_transactions"("booking_id", "type", "created_at" DESC);
CREATE INDEX "escrow_transactions_status_created_at_idx" ON "escrow_transactions"("status", "created_at");
CREATE INDEX "escrow_transactions_type_completed_at_idx" ON "escrow_transactions"("type", "completed_at");
CREATE INDEX "escrow_transactions_helcim_transaction_id_idx" ON "escrow_transactions"("helcim_transaction_id");

-- CreateIndex: Vendor payouts indexes
CREATE INDEX "vendor_payouts_vendor_id_status_scheduled_for_idx" ON "vendor_payouts"("vendor_id", "status", "scheduled_for");
CREATE INDEX "vendor_payouts_status_scheduled_for_idx" ON "vendor_payouts"("status", "scheduled_for");
CREATE INDEX "vendor_payouts_processed_at_idx" ON "vendor_payouts"("processed_at");

-- CreateIndex: Vendor payout bookings indexes
CREATE INDEX "vendor_payout_bookings_payout_id_idx" ON "vendor_payout_bookings"("payout_id");
CREATE INDEX "vendor_payout_bookings_booking_id_idx" ON "vendor_payout_bookings"("booking_id");
CREATE UNIQUE INDEX "vendor_payout_bookings_payout_id_booking_id_key" ON "vendor_payout_bookings"("payout_id", "booking_id");

-- CreateIndex: Bookings proposal expiry index
CREATE INDEX "bookings_status_proposal_expires_at_idx" ON "bookings"("status", "proposal_expires_at");

-- CreateIndex: Payments external ID indexes
CREATE UNIQUE INDEX "payments_external_payment_id_key" ON "payments"("external_payment_id");
CREATE UNIQUE INDEX "payments_external_transfer_id_key" ON "payments"("external_transfer_id");
CREATE INDEX "payments_external_payment_id_idx" ON "payments"("external_payment_id");

-- AddForeignKey: Escrow transactions
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Vendor payouts
ALTER TABLE "vendor_payouts" ADD CONSTRAINT "vendor_payouts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Vendor payout bookings
ALTER TABLE "vendor_payout_bookings" ADD CONSTRAINT "vendor_payout_bookings_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "vendor_payouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendor_payout_bookings" ADD CONSTRAINT "vendor_payout_bookings_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
