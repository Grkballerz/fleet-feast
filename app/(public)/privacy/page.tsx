import { Metadata } from "next";
import { PrivacyClient } from "./PrivacyClient";

export const metadata: Metadata = {
  title: "Privacy Policy | Fleet Feast",
  description:
    "Learn how Fleet Feast collects, uses, and protects your personal information. GDPR and CCPA compliant privacy practices for our food truck marketplace.",
  keywords: [
    "privacy policy",
    "data protection",
    "GDPR",
    "CCPA",
    "personal information",
    "food truck marketplace privacy",
  ],
  openGraph: {
    title: "Privacy Policy | Fleet Feast",
    description: "How we protect your data and privacy on Fleet Feast",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Privacy Policy Page
 *
 * Comprehensive privacy policy covering data collection, usage, retention,
 * and user rights. GDPR and CCPA compliant.
 */
export default function PrivacyPage() {
  return <PrivacyClient />;
}
