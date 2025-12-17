import { redirect } from "next/navigation";

/**
 * Vendor Index Page
 * Redirects to the vendor dashboard
 */
export default function VendorPage() {
  redirect("/vendor/dashboard");
}
