import { Metadata } from "next";
import { HelpClient } from "./HelpClient";

export const metadata: Metadata = {
  title: "Help Center | Fleet Feast",
  description:
    "Find answers to your questions about booking food trucks, vendor requirements, payments, and more. Comprehensive support resources for customers and vendors.",
  keywords: [
    "help center",
    "support",
    "food truck booking help",
    "vendor support",
    "customer support",
    "fleet feast help",
    "faq",
  ],
  openGraph: {
    title: "Help Center | Fleet Feast",
    description:
      "Get help with booking, vendor setup, payments, and more",
    type: "website",
  },
};

/**
 * Help Center Page
 *
 * Comprehensive support page with organized categories for customers and vendors.
 * Includes collapsible sections, search functionality, and links to related resources.
 */
export default function HelpPage() {
  return <HelpClient />;
}
