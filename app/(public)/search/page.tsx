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
}

interface SearchResponse {
  success: boolean;
  data: TruckSearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Search Page
 *
 * Main food truck search and discovery page.
 * Features: search bar, filters, sorting, pagination, grid/list view toggle.
 */
export default function SearchPage() {
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

      if (data.success && data.data) {
        setTrucks(data.data);
        setTotalResults(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
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
      <div className="bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Find Your Perfect Food Truck
            </h1>
            <SearchBar
              initialQuery={query}
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar - Desktop */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-8">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                  variant="sidebar"
                />
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
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Results count and mobile filter button */}
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      {isLoading ? "Searching..." : `${totalResults} Results`}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMobileFilters(!showMobileFilters)}
                      className="lg:hidden"
                    >
                      Filters
                    </Button>
                  </div>

                  {/* View toggle and sort */}
                  <div className="flex items-center gap-4">
                    {/* View toggle - WCAG 4.1.2 */}
                    <div className="flex gap-1 bg-gray-100 rounded-md p-1" role="group" aria-label="View mode">
                      <button
                        onClick={() => setViewMode("grid")}
                        aria-label="Grid view"
                        aria-pressed={viewMode === "grid"}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          viewMode === "grid"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Grid
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        aria-label="List view"
                        aria-pressed={viewMode === "list"}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          viewMode === "list"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        List
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

              {/* Mobile Filters */}
              {showMobileFilters && (
                <div className="lg:hidden mb-6 bg-white rounded-lg shadow-sm">
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                    variant="drawer"
                  />
                </div>
              )}

              {/* Results */}
              {viewMode === "grid" ? (
                <ResultsGrid trucks={trucks} isLoading={isLoading} />
              ) : (
                <ResultsList trucks={trucks} isLoading={isLoading} />
              )}

              {/* Pagination */}
              {!isLoading && trucks.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalResults={totalResults}
                  resultsPerPage={20}
                  onPageChange={handlePageChange}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
