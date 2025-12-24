import { Metadata } from "next";
import { TermsClient } from "./TermsClient";

export const metadata: Metadata = {
  title: "Terms of Service | Fleet Feast",
  description:
    "Fleet Feast Terms of Service. Read our platform terms, booking policies, payment terms, cancellation policy, and user agreements for our food truck marketplace.",
  keywords: [
    "terms of service",
    "fleet feast terms",
    "platform terms",
    "booking policy",
    "cancellation policy",
    "payment terms",
  ],
  openGraph: {
    title: "Terms of Service | Fleet Feast",
    description:
      "Read our platform terms, booking policies, and user agreements",
    type: "website",
  },
};

/**
 * Terms of Service Page
 *
 * Legal terms and conditions for using the Fleet Feast platform.
 * Includes all business rules, policies, and agreements.
 */
export default function TermsPage() {
  return <TermsClient />;
}
