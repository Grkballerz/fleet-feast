import { Metadata } from "next";
import { ForVendorsClient } from "./ForVendorsClient";

export const metadata: Metadata = {
  title: "For Vendors | Fleet Feast - Grow Your Food Truck Business",
  description:
    "Join Fleet Feast as a verified vendor. Connect with event planners, manage bookings easily, get paid reliably via escrow. No upfront fees, 10% commission, verified badge.",
  keywords: [
    "food truck vendor",
    "join fleet feast",
    "food truck booking platform",
    "vendor signup",
    "food truck business",
    "catering vendor",
    "mobile food business",
    "food truck marketplace",
  ],
  openGraph: {
    title: "For Vendors | Fleet Feast",
    description:
      "Grow your food truck business with Fleet Feast. More bookings, reliable payments, easy management.",
    type: "website",
  },
};

/**
 * For Vendors Page
 *
 * Landing page to attract food truck operators to join Fleet Feast.
 * Highlights benefits, pricing, requirements, and success stories.
 */
export default function ForVendorsPage() {
  return <ForVendorsClient />;
}
