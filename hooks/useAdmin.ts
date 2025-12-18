/**
 * Fleet Feast - useAdmin Hook
 * React Query hooks for admin data fetching
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";

// Types
interface VendorApplication {
  id: string;
  userId: string;
  userEmail: string;
  businessName: string;
  cuisineType: string[];
  description: string;
  priceRange: string;
  capacityMin: number;
  capacityMax: number;
  serviceArea: string;
  status: string;
  createdAt: string;
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    verified: boolean;
  }>;
}

// API Functions
async function fetchPendingVendors(): Promise<VendorApplication[]> {
  const response = await fetch("/api/admin/vendors/pending");

  if (!response.ok) {
    throw new Error("Failed to fetch pending vendors");
  }

  const data = await response.json();
  return data.applications || [];
}

async function fetchAllVendors(): Promise<VendorApplication[]> {
  const response = await fetch("/api/admin/vendors");

  if (!response.ok) {
    throw new Error("Failed to fetch vendors");
  }

  const data = await response.json();
  return data.applications || [];
}

async function fetchVendorApplication(id: string): Promise<VendorApplication> {
  const response = await fetch(`/api/admin/vendors/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch vendor application");
  }

  const data = await response.json();
  return data.application;
}

async function approveVendor(id: string): Promise<void> {
  const response = await fetch(`/api/admin/vendors/${id}/approve`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to approve vendor");
  }
}

async function rejectVendor(id: string, reason: string): Promise<void> {
  const response = await fetch(`/api/admin/vendors/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error("Failed to reject vendor");
  }
}

async function fetchDisputes(): Promise<any[]> {
  const response = await fetch("/api/admin/disputes");

  if (!response.ok) {
    throw new Error("Failed to fetch disputes");
  }

  const data = await response.json();
  return data.disputes || [];
}

async function fetchViolations(): Promise<any[]> {
  const response = await fetch("/api/admin/violations");

  if (!response.ok) {
    throw new Error("Failed to fetch violations");
  }

  const data = await response.json();
  return data.violations || [];
}

// Hooks

/**
 * Hook to fetch pending vendor applications
 * Stale time: 1 minute (admin reviews happen frequently)
 */
export function usePendingVendors() {
  return useQuery({
    queryKey: queryKeys.admin.vendors.pending(),
    queryFn: fetchPendingVendors,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch all vendor applications
 * Stale time: 2 minutes (less frequently changing than pending)
 */
export function useAllVendors() {
  return useQuery({
    queryKey: queryKeys.admin.vendors.lists(),
    queryFn: fetchAllVendors,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch vendor application details
 * Stale time: 2 minutes (application details semi-static)
 */
export function useVendorApplication(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.vendors.detail(id),
    queryFn: () => fetchVendorApplication(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
  });
}

/**
 * Hook to approve vendor application
 */
export function useApproveVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveVendor,
    onSuccess: (_, vendorId) => {
      // Invalidate all admin vendor queries using hierarchical keys
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.vendors.all });
      // Also invalidate the specific vendor detail
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.vendors.detail(vendorId) });
    },
  });
}

/**
 * Hook to reject vendor application
 */
export function useRejectVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectVendor(id, reason),
    onSuccess: (_, { id }) => {
      // Invalidate all admin vendor queries using hierarchical keys
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.vendors.all });
      // Also invalidate the specific vendor detail
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.vendors.detail(id) });
    },
  });
}

/**
 * Hook to fetch disputes
 * Stale time: 1 minute (disputes need quick attention)
 */
export function useDisputes() {
  return useQuery({
    queryKey: queryKeys.admin.disputes.lists(),
    queryFn: fetchDisputes,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch violations
 * Stale time: 2 minutes (violations less urgent than disputes)
 */
export function useViolations() {
  return useQuery({
    queryKey: queryKeys.admin.violations.lists(),
    queryFn: fetchViolations,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
