import { Metadata } from "next";
import { SafetyClient } from "./SafetyClient";

export const metadata: Metadata = {
  title: "Safety Guidelines | Fleet Feast",
  description:
    "Learn about Fleet Feast's comprehensive safety measures, vendor verification, payment protection, and community guidelines. Your safety is our priority.",
  keywords: [
    "safety guidelines",
    "vendor verification",
    "payment protection",
    "food truck safety",
    "secure payments",
    "event safety",
  ],
  openGraph: {
    title: "Safety Guidelines | Fleet Feast",
    description:
      "Comprehensive safety measures and guidelines for our food truck marketplace",
    type: "website",
  },
};

/**
 * Safety Guidelines Page
 *
 * Comprehensive safety information including vendor verification,
 * payment protection, communication safety, and community guidelines.
 */
export default function SafetyPage() {
  return <SafetyClient />;
}
