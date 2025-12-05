import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { validateEnvironment } from "@/lib/env-validation";

// Validate environment variables on application startup
validateEnvironment();

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fleet Feast - Food Truck Marketplace",
  description:
    "Connect with NYC's best food trucks for corporate events and private parties. Easy booking, secure payments, and verified vendors.",
  keywords: [
    "food truck",
    "catering",
    "NYC",
    "corporate events",
    "private parties",
    "food truck booking",
  ],
  authors: [{ name: "Fleet Feast" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fleetfeast.com",
    title: "Fleet Feast - Food Truck Marketplace",
    description: "Book verified food trucks for your events in NYC",
    siteName: "Fleet Feast",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fleet Feast - Food Truck Marketplace",
    description: "Book verified food trucks for your events in NYC",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
