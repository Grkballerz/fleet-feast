import { Suspense } from "react";
import { BookingClient } from "./BookingClient";
import { Spinner } from "@/components/ui/Spinner";

export const dynamic = "force-dynamic";

function BookingLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="large" />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingLoading />}>
      <BookingClient />
    </Suspense>
  );
}
