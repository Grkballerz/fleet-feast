import { Metadata } from "next";
import { BlogClient } from "./BlogClient";
import { getAllBlogPosts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Blog | Fleet Feast - Food Truck Catering & Event Planning Tips",
  description:
    "Expert guides and tips for food truck catering, event planning, and mobile food business. Learn about hiring food trucks, planning corporate events, weddings, and more.",
  keywords: [
    "food truck blog",
    "catering tips",
    "event planning",
    "food truck business",
    "event catering guides",
    "wedding food trucks",
    "corporate event catering",
  ],
  openGraph: {
    title: "Fleet Feast Blog - Food Truck & Event Catering Guides",
    description:
      "Expert advice on food truck catering, event planning, and mobile food business success.",
    type: "website",
    url: "https://fleetfeast.com/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fleet Feast Blog",
    description: "Expert food truck catering and event planning guides",
  },
};

/**
 * Blog Listing Page
 *
 * Displays all blog posts with featured posts highlighted.
 * Server-side rendered for SEO.
 */
export default function BlogPage() {
  const posts = getAllBlogPosts();

  return <BlogClient posts={posts} />;
}
