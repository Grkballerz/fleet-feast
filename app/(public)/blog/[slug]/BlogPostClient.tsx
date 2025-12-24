"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, Tag } from "lucide-react";
import { BlogPost } from "@/lib/blog-data";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MainLayout } from "@/components/layout/MainLayout";

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <MainLayout>
    <div className="min-h-screen bg-gray-50">
      {/* Back to Blog Link */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Category */}
            <div className="flex items-center gap-2 mb-4">
              <Tag size={16} className="text-orange-600" />
              <span className="text-sm font-semibold text-orange-600">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 mb-8">{post.excerpt}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                  {post.author.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {post.author.name}
                  </p>
                  <p className="text-xs">{post.author.role}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>{formattedDate}</span>
              </div>

              {/* Read Time */}
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-96 rounded-lg object-cover"
            />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg prose-orange max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Style headings
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold mt-6 mb-3 text-gray-900">
                      {children}
                    </h3>
                  ),
                  // Style paragraphs
                  p: ({ children }) => (
                    <p className="mb-4 text-gray-700 leading-relaxed">
                      {children}
                    </p>
                  ),
                  // Style lists
                  ul: ({ children }) => (
                    <ul className="mb-4 space-y-2 list-disc list-inside text-gray-700">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 space-y-2 list-decimal list-inside text-gray-700">
                      {children}
                    </ol>
                  ),
                  // Style links
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-orange-600 hover:text-orange-700 underline"
                    >
                      {children}
                    </a>
                  ),
                  // Style strong text
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900">
                      {children}
                    </strong>
                  ),
                  // Style blockquotes
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-orange-500 pl-4 italic my-4 text-gray-600">
                      {children}
                    </blockquote>
                  ),
                  // Style code blocks
                  code: ({ children }) => (
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                      {children}
                    </pre>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </article>

      {/* Author Bio Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-semibold flex-shrink-0">
                  {post.author.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    About {post.author.name}
                  </h3>
                  <p className="text-orange-600 font-medium mb-3">
                    {post.author.role}
                  </p>
                  <p className="text-gray-600">
                    {post.author.name} is a {post.author.role} specializing in
                    food truck catering and event planning. With years of
                    experience in the industry, they provide expert guidance to
                    help you create memorable events.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-gray-900">
                Related Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <RelatedPostCard key={relatedPost.slug} post={relatedPost} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Book a Food Truck?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Browse hundreds of verified food truck vendors and find the perfect
            match for your next event.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="bg-white hover:bg-gray-100 text-orange-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Search Food Trucks
            </Link>
            <Link
              href="/vendor/apply"
              className="bg-orange-700 hover:bg-orange-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors border border-orange-400"
            >
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>
    </div>
    </MainLayout>
  );
}

interface RelatedPostCardProps {
  post: BlogPost;
}

function RelatedPostCard({ post }: RelatedPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <img
        src={post.featuredImage}
        alt={post.title}
        className="h-32 w-full object-cover"
      />
      <div className="p-4">
        <span className="text-xs font-semibold text-orange-600">
          {post.category}
        </span>
        <h3 className="text-sm font-bold mt-2 text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-xs text-gray-600 mt-2">
          {post.readTime} min read
        </p>
      </div>
    </Link>
  );
}
