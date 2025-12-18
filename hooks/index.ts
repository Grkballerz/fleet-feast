/**
 * Fleet Feast - Hooks Index
 * Central export for all custom hooks
 */

// Auth hooks
export { useAuth } from "./useAuth";

// Booking hooks
export { useBooking } from "./useBooking";
export {
  useBookings,
  useBookingDetails,
  useCustomerBookings,
  useVendorBookings,
  useAcceptBooking,
  useDeclineBooking,
} from "./useBookings";

// Truck/Vendor hooks
export {
  useTruckSearch,
  useFeaturedTrucks,
  useTruck,
  useTruckAvailability,
  useToggleFavorite,
} from "./useTrucks";

// Admin hooks
export {
  usePendingVendors,
  useAllVendors,
  useVendorApplication,
  useApproveVendor,
  useRejectVendor,
  useDisputes,
  useViolations,
} from "./useAdmin";

// UI hooks
export { useToast } from "./useToast";
