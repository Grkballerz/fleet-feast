import { redirect } from "next/navigation";

/**
 * Customer Index Page
 * Redirects to the customer dashboard
 */
export default function CustomerPage() {
  redirect("/customer/dashboard");
}
