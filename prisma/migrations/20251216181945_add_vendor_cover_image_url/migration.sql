-- DropIndex
DROP INDEX "idx_bookings_customer_status";

-- DropIndex
DROP INDEX "idx_bookings_event_upcoming";

-- DropIndex
DROP INDEX "idx_bookings_vendor_status";

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "cover_image_url" TEXT;
