import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Fleet Feast - Frequently Asked Questions",
  description:
    "Find answers to common questions about booking food trucks, vendor requirements, payments, and how Fleet Feast works. Browse by category or search our FAQ.",
  keywords: [
    "FAQ",
    "food truck booking questions",
    "vendor requirements",
    "payment questions",
    "Fleet Feast help",
  ],
  openGraph: {
    title: "FAQ | Fleet Feast",
    description: "Find answers to common questions about Fleet Feast",
    type: "website",
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
