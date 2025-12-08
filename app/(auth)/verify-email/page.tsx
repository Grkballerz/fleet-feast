import { Suspense } from "react";
import { VerifyEmailClient } from "./VerifyEmailClient";
import { Spinner } from "@/components/ui/Spinner";

export const dynamic = "force-dynamic";

function VerifyEmailLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="large" />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
