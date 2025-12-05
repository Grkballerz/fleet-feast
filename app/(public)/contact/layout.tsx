import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Fleet Feast",
  description:
    "Get in touch with Fleet Feast. Contact our support team for questions about booking food trucks, vendor inquiries, or general assistance. We're here to help!",
  keywords: [
    "contact Fleet Feast",
    "customer support",
    "food truck help",
    "vendor support",
    "NYC food truck contact",
  ],
  openGraph: {
    title: "Contact Us | Fleet Feast",
    description: "Get in touch with Fleet Feast support team",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
