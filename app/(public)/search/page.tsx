import { Suspense } from "react";
import { SearchClient } from "./SearchClient";
import { MainLayout } from "@/components/layout/MainLayout";

export const dynamic = "force-dynamic";

function SearchLoading() {
  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="neo-glass-brutal border-b-4 border-black">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Find Your Perfect Food Truck
            </h1>
            <div className="h-12 neo-border rounded-neo bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchClient />
    </Suspense>
  );
}
