-- Remove Stripe-specific fields from vendors table
ALTER TABLE "vendors" DROP COLUMN IF EXISTS "stripe_account_id";
ALTER TABLE "vendors" DROP COLUMN IF EXISTS "stripe_connected";

-- Rename Stripe-specific payment fields to generic external payment fields
ALTER TABLE "payments" RENAME COLUMN "stripe_payment_intent_id" TO "external_payment_id";
ALTER TABLE "payments" RENAME COLUMN "stripe_transfer_id" TO "external_transfer_id";

-- Update index names to reflect new column names
DROP INDEX IF EXISTS "payments_stripe_payment_intent_id_key";
CREATE UNIQUE INDEX IF NOT EXISTS "payments_external_payment_id_key" ON "payments"("external_payment_id");
