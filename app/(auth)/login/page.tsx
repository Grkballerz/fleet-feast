import { Suspense } from "react";
import { LoginClient } from "./LoginClient";
import { Spinner } from "@/components/ui/Spinner";

export const dynamic = "force-dynamic";

function LoginLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="large" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginClient />
    </Suspense>
  );
}
