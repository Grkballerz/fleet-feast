import { Suspense } from "react";
import { ResetPasswordClient } from "./ResetPasswordClient";
import { Spinner } from "@/components/ui/Spinner";

export const dynamic = "force-dynamic";

function ResetPasswordLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="large" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
