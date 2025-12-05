-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "discount_amount" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "loyalty_applied" BOOLEAN NOT NULL DEFAULT false;
