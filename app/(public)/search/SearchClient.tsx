"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { SearchBar } from "./components/SearchBar";
import { FilterPanel, FilterState } from "./components/FilterPanel";
import { ResultsGrid } from "./components/ResultsGrid";
import { ResultsList } from "./components/ResultsList";
import { SortDropdown, SortOption, SortOrder } from "./components/SortDropdown";
import { Pagination } from "./components/Pagination";
import { Button } from "@/components/ui/Button";
import { CuisineType, PriceRange } from "@prisma/client";
import { TruckIcon, Sparkles, Filter, Grid3X3, List, SlidersHorizontal } from "lucide-react";

type ViewMode = "grid" | "list";

interface TruckSearchResult {
  id: string;
  businessName: string;
  cuisineType: CuisineType;
  priceRange: PriceRange;
  description: string | null;
  serviceArea: string | null;
  averageRating?: number;
  totalReviews?: number;
  distance?: number;
  capacityMin?: number;
  capacityMax?: number;
  coverImageUrl?: string | null;
}

interface SearchResponse {
  data: TruckSearchResult[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Search Page
 *
 * Main food truck search and discovery page.
 * Features: search bar, filters, sorting, pagination, grid/list view toggle.
 */
export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    cuisineType: [],
    priceRange: [],
  });
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [trucks, setTrucks] = useState<TruckSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Parse URL parameters on mount
  useEffect(() => {
    const query = searchParams.get("query") || "";
    const cuisineTypeParam = searchParams.get("cuisineType");
    const priceRangeParam = searchParams.get("priceRange");
    const capacityMin = searchParams.get("capacityMin");
    const capacityMax = searchParams.get("capacityMax");
    const minRating = searchParams.get("minRating");
    const availableDate = searchParams.get("availableDate");
    const sortByParam = searchParams.get("sortBy") || "relevance";
    const sortOrderParam = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");

    setQuery(query);
    setFilters({
      cuisineType: cuisineTypeParam
        ? cuisineTypeParam.split(",").map((c) => c.trim() as CuisineType)
        : [],
      priceRange: priceRangeParam
        ? priceRangeParam.split(",").map((p) => p.trim() as PriceRange)
        : [],
      capacityMin: capacityMin ? parseInt(capacityMin) : undefined,
      capacityMax: capacityMax ? parseInt(capacityMax) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      availableDate: availableDate || undefined,
    });
    setSortBy(sortByParam as SortOption);
    setSortOrder(sortOrderParam as SortOrder);
    setCurrentPage(page);
  }, [searchParams]);

  // Fetch trucks whenever search parameters change
  useEffect(() => {
    fetchTrucks();
  }, [query, filters, sortBy, sortOrder, currentPage]);

  // Build URL from current state
  const buildUrl = useCallback(
    (updates: {
      query?: string;
      filters?: FilterState;
      sortBy?: SortOption;
      sortOrder?: SortOrder;
      page?: number;
    }) => {
      const params = new URLSearchParams();

      const finalQuery = updates.query !== undefined ? updates.query : query;
      const finalFilters = updates.filters || filters;
      const finalSortBy = updates.sortBy || sortBy;
      const finalSortOrder = updates.sortOrder || sortOrder;
      const finalPage = updates.page || currentPage;

      if (finalQuery) params.set("query", finalQuery);
      if (finalFilters.cuisineType && finalFilters.cuisineType.length > 0) {
        params.set("cuisineType", finalFilters.cuisineType.join(","));
      }
      if (finalFilters.priceRange && finalFilters.priceRange.length > 0) {
        params.set("priceRange", finalFilters.priceRange.join(","));
      }
      if (finalFilters.capacityMin) {
        params.set("capacityMin", finalFilters.capacityMin.toString());
      }
      if (finalFilters.capacityMax) {
        params.set("capacityMax", finalFilters.capacityMax.toString());
      }
      if (finalFilters.minRating) {
        params.set("minRating", finalFilters.minRating.toString());
      }
      if (finalFilters.availableDate) {
        params.set("availableDate", finalFilters.availableDate);
      }
      params.set("sortBy", finalSortBy);
      params.set("sortOrder", finalSortOrder);
      params.set("page", finalPage.toString());

      return `/search?${params.toString()}`;
    },
    [query, filters, sortBy, sortOrder, currentPage]
  );

  // Fetch trucks from API
  const fetchTrucks = async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (filters.cuisineType && filters.cuisineType.length > 0) {
        params.set("cuisineType", filters.cuisineType.join(","));
      }
      if (filters.priceRange && filters.priceRange.length > 0) {
        params.set("priceRange", filters.priceRange.join(","));
      }
      if (filters.capacityMin) {
        params.set("capacityMin", filters.capacityMin.toString());
      }
      if (filters.capacityMax) {
        params.set("capacityMax", filters.capacityMax.toString());
      }
      if (filters.minRating) {
        params.set("minRating", filters.minRating.toString());
      }
      if (filters.availableDate) {
        params.set("availableDate", filters.availableDate);
      }
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", currentPage.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/trucks?${params.toString()}`);
      const data: SearchResponse = await response.json();

      if (data.data && Array.isArray(data.data)) {
        setTrucks(data.data);
        setTotalResults(data.meta?.total ?? 0);
        setTotalPages(data.meta?.totalPages ?? 0);
      } else {
        setTrucks([]);
        setTotalResults(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Failed to fetch trucks:", error);
      setTrucks([]);
      setTotalResults(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (newQuery: string) => {
    const url = buildUrl({ query: newQuery, page: 1 });
    router.push(url);
  };

  // Handle filter change
  const handleFiltersChange = (newFilters: FilterState) => {
    const url = buildUrl({ filters: newFilters, page: 1 });
    router.push(url);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const url = buildUrl({
      filters: { cuisineType: [], priceRange: [] },
      page: 1,
    });
    router.push(url);
  };

  // Handle sort change
  const handleSortChange = (newSortBy: SortOption, newSortOrder: SortOrder) => {
    const url = buildUrl({ sortBy: newSortBy, sortOrder: newSortOrder, page: 1 });
    router.push(url);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const url = buildUrl({ page });
    router.push(url);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Header Section */}
        <div className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
              <div className="absolute top-20 right-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-float delay-300" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>

          <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-lg shadow-primary/30">
                <TruckIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-white/60 text-sm font-medium uppercase tracking-wider">
                Food Truck Marketplace
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-4 animate-fade-in-up">
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-primary via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Food Truck
              </span>
            </h1>

            <p className="text-center text-white/70 text-lg mb-8 max-w-2xl mx-auto animate-fade-in-up delay-100">
              Discover verified vendors for your next event, wedding, or corporate gathering
            </p>

            {/* Search Bar Container */}
            <div className="max-w-3xl mx-auto animate-fade-in-up delay-200">
              <div className="relative">
                <div className="neo-glass-brutal rounded-neo p-2">
                  <SearchBar
                    initialQuery={query}
                    onSearch={handleSearch}
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 mt-8 animate-fade-in-up delay-300">
              <div className="flex items-center gap-2 text-white/60">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm">500+ Verified Vendors</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/30" />
              <div className="flex items-center gap-2 text-white/60">
                <span className="text-sm">4.8 Average Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar - Desktop */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-8">
                <div className="neo-card-glass rounded-neo overflow-hidden neo-shadow-lg">
                  <div className="p-4 bg-white/50 border-b-4 border-black">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-primary" />
                      <h2 className="font-bold text-gray-900">Filters</h2>
                    </div>
                  </div>
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                    variant="sidebar"
                  />
                </div>
              </div>
            </aside>

            {/* Results Area */}
            <main className="flex-1 min-w-0">
              {/* Screen reader announcement for search results - WCAG 4.1.3 */}
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
              >
                {isLoading ? "Searching for food trucks..." : `Found ${totalResults} food truck${totalResults === 1 ? '' : 's'}`}
              </div>

              {/* Controls Bar */}
              <div className="neo-card-glass rounded-neo neo-shadow p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Results count and mobile filter button */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-orange-500 animate-pulse" />
                      <h2 className="text-lg font-bold text-gray-900">
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-pulse">Searching</span>
                            <span className="animate-bounce">...</span>
                          </span>
                        ) : (
                          <span>
                            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">{totalResults}</span>
                            {" "}Results
                          </span>
                        )}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowMobileFilters(!showMobileFilters)}
                      className="lg:hidden flex items-center gap-2 neo-btn-secondary px-4 py-2 text-sm"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                    </button>
                  </div>

                  {/* View toggle and sort */}
                  <div className="flex items-center gap-3">
                    {/* View toggle - WCAG 4.1.2 */}
                    <div className="flex gap-1 neo-border rounded-neo p-1 bg-gray-50" role="group" aria-label="View mode">
                      <button
                        onClick={() => setViewMode("grid")}
                        aria-label="Grid view"
                        aria-pressed={viewMode === "grid"}
                        className={`p-2 rounded-neo transition-all duration-200 ${
                          viewMode === "grid"
                            ? "bg-primary text-white neo-shadow"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Grid3X3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        aria-label="List view"
                        aria-pressed={viewMode === "list"}
                        className={`p-2 rounded-neo transition-all duration-200 ${
                          viewMode === "list"
                            ? "bg-primary text-white neo-shadow"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Sort dropdown */}
                    <SortDropdown
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSortChange={handleSortChange}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Filters - Slide-in Drawer */}
              <div className="lg:hidden">
                {/* Backdrop */}
                {showMobileFilters && (
                  <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                    onClick={() => setShowMobileFilters(false)}
                    aria-hidden="true"
                  />
                )}

                {/* Drawer */}
                <div
                  className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white neo-border-l neo-shadow-lg z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${
                    showMobileFilters ? "translate-x-0" : "translate-x-full"
                  }`}
                >
                  <div className="p-4 bg-white/50 border-b-4 border-black sticky top-0 z-10 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-gray-900">Filters</h2>
                      </div>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="p-2 rounded-neo neo-border hover:bg-gray-100 transition-colors text-gray-700"
                        aria-label="Close filters"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                    variant="drawer"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="animate-fade-in-up delay-100">
                {viewMode === "grid" ? (
                  <ResultsGrid
                    trucks={trucks.map(t => ({ ...t, imageUrl: t.coverImageUrl }))}
                    isLoading={isLoading}
                  />
                ) : (
                  <ResultsList
                    trucks={trucks.map(t => ({ ...t, imageUrl: t.coverImageUrl }))}
                    isLoading={isLoading}
                  />
                )}
              </div>

              {/* Pagination */}
              {!isLoading && trucks.length > 0 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalResults={totalResults}
                    resultsPerPage={20}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
