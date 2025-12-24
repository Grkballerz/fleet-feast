import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostClient } from "./BlogPostClient";
import {
  getBlogPostBySlug,
  getRelatedPosts,
  getAllBlogPosts,
} from "@/lib/blog-data";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

/**
 * Generate static params for all blog posts
 * This enables static generation at build time
 */
export async function generateStaticParams() {
  const posts = getAllBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | Fleet Feast",
    };
  }

  return {
    title: post.seo.title,
    description: post.seo.description,
    keywords: post.seo.keywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.seo.title,
      description: post.seo.description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      url: `https://fleetfeast.com/blog/${post.slug}`,
      images: post.seo.ogImage
        ? [{ url: post.seo.ogImage }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo.title,
      description: post.seo.description,
    },
  };
}

/**
 * Individual Blog Post Page
 *
 * SEO-optimized blog post with structured data, related posts, and internal linking.
 */
export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(params.slug, 3);

  // Structured data for Article schema (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "Fleet Feast",
      logo: {
        "@type": "ImageObject",
        url: "https://fleetfeast.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://fleetfeast.com/blog/${post.slug}`,
    },
    keywords: post.seo.keywords.join(", "),
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).length,
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <BlogPostClient post={post} relatedPosts={relatedPosts} />
    </>
  );
}
