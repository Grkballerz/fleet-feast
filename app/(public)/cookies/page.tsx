import { Metadata } from "next";
import CookiesClient from "./CookiesClient";

export const metadata: Metadata = {
  title: "Cookie Policy | Fleet Feast",
  description:
    "Learn about how Fleet Feast uses cookies to improve your experience, including essential, functional, and analytics cookies.",
  keywords: [
    "cookie policy",
    "cookies",
    "privacy",
    "data collection",
    "tracking",
    "Fleet Feast",
  ],
  openGraph: {
    title: "Cookie Policy | Fleet Feast",
    description:
      "Learn about how Fleet Feast uses cookies to improve your experience.",
    type: "website",
  },
};

/**
 * Cookie Policy Page
 *
 * Server component that renders the cookie policy with SEO metadata.
 * Client interactivity handled by CookiesClient component.
 */
export default function CookiesPage() {
  return <CookiesClient />;
}
