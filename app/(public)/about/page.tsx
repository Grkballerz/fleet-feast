import { Metadata } from "next";
import { AboutClient } from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us | Fleet Feast",
  description:
    "Learn about Fleet Feast's mission to connect food truck vendors with event planners. Discover our story, values, and commitment to quality catering.",
  keywords: [
    "about fleet feast",
    "food truck marketplace",
    "company mission",
    "NYC catering",
  ],
  openGraph: {
    title: "About Fleet Feast",
    description:
      "Connecting food truck lovers with the best mobile dining experiences",
    type: "website",
  },
};

/**
 * About Page
 *
 * Company story, mission, values, and team information.
 */
export default function AboutPage() {
  return <AboutClient />;
}
