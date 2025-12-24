import { Metadata } from "next";
import { RefundsClient } from "./RefundsClient";

export const metadata: Metadata = {
  title: "Refund Policy | Fleet Feast",
  description:
    "Understand Fleet Feast's refund and cancellation policy. Learn about our escrow payment system, customer and vendor cancellation terms, dispute resolution, and automated refund triggers.",
  keywords: [
    "refund policy",
    "cancellation policy",
    "fleet feast refunds",
    "escrow payments",
    "dispute resolution",
    "food truck booking cancellation",
  ],
  openGraph: {
    title: "Refund Policy | Fleet Feast",
    description:
      "Clear, fair refund and cancellation policies for food truck bookings",
    type: "website",
  },
};

/**
 * Refund Policy Page
 *
 * Displays Fleet Feast's refund and cancellation policies,
 * escrow payment system details, and dispute resolution process.
 */
export default function RefundsPage() {
  return <RefundsClient />;
}
