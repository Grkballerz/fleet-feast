import { Metadata } from "next";
import { HowItWorksClient } from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "How It Works | Fleet Feast - Book Food Trucks in Minutes",
  description:
    "Learn how Fleet Feast makes booking food trucks for events simple and secure. Browse verified vendors, submit inquiries, receive proposals, and pay safely with our escrow system.",
  keywords: [
    "how fleet feast works",
    "book food truck",
    "food truck booking process",
    "event catering steps",
    "food truck vendor application",
    "secure food truck booking",
  ],
  openGraph: {
    title: "How It Works | Fleet Feast",
    description:
      "Book amazing food trucks for your events in minutes. Verified vendors, secure payments, unforgettable experiences.",
    type: "website",
  },
};

/**
 * How It Works Page
 *
 * Explains the Fleet Feast platform for both customers and vendors.
 * Includes step-by-step processes, trust & safety features, and comparison with traditional methods.
 */
export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
