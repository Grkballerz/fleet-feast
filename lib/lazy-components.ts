/**
 * Fleet Feast - Lazy Component Loading
 * Dynamic imports for code splitting and reduced initial bundle size
 */

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Loading fallback component
 * Shown while lazy component is loading
 */
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Spinner />
  </div>
);

const LoadingCard = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 rounded-lg"></div>
  </div>
);

/**
 * Heavy components that should be lazy-loaded
 * Only loaded when actually needed
 */

// Map component (Mapbox/Leaflet is heavy ~500KB)
export const MapView = dynamic(
  () => import('@/components/search/MapView').catch(() => ({
    default: () => <div>Map unavailable</div>
  })),
  {
    loading: () => <LoadingCard />,
    ssr: false, // Don't render on server (requires window)
  }
);

// Calendar component (date-fns + UI ~100KB)
export const AvailabilityCalendar = dynamic(
  () => import('@/components/vendor/AvailabilityCalendar'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true, // Can render on server
  }
);

// Rich text editor (heavy ~200KB)
export const RichTextEditor = dynamic(
  () => import('@/components/ui/RichTextEditor'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// Chart components (recharts ~150KB)
export const AnalyticsChart = dynamic(
  () => import('@/components/admin/AnalyticsChart'),
  {
    loading: () => <LoadingCard />,
    ssr: false,
  }
);

// Image upload/crop component (heavy with image processing)
export const ImageUploader = dynamic(
  () => import('@/components/ui/ImageUploader'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// PDF viewer (pdf.js ~500KB)
export const DocumentViewer = dynamic(
  () => import('@/components/admin/DocumentViewer'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// Stripe payment form (Stripe.js ~50KB + UI)
export const PaymentForm = dynamic(
  () => import('@/components/booking/PaymentForm'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Stripe requires client-side
  }
);

// Message thread (can be heavy with many messages)
export const MessageThread = dynamic(
  () => import('@/components/messaging/MessageThread'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  }
);

// Notification center (dropdown with list)
export const NotificationCenter = dynamic(
  () => import('@/components/layout/NotificationCenter'),
  {
    loading: () => null, // No loading state for dropdown
    ssr: false,
  }
);

// Search filters panel (heavy with many inputs)
export const SearchFiltersPanel = dynamic(
  () => import('@/components/search/FiltersPanel'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  }
);

/**
 * Route-based code splitting examples
 * Use in page components for optimal splitting
 */

// Admin dashboard (only for admin users)
export const AdminDashboard = dynamic(
  () => import('@/components/admin/Dashboard'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  }
);

// Vendor dashboard (only for vendors)
export const VendorDashboard = dynamic(
  () => import('@/components/vendor/Dashboard'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  }
);

// Customer dashboard (only for customers)
export const CustomerDashboard = dynamic(
  () => import('@/components/customer/Dashboard'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  }
);

/**
 * Prefetch helper for anticipated navigation
 * Use to preload components before user interaction
 */
export function prefetchComponent(componentName: keyof typeof lazyComponents) {
  // Next.js automatically prefetches dynamic imports on hover/focus
  // This is a placeholder for explicit prefetch if needed
  return lazyComponents[componentName];
}

/**
 * Registry of all lazy components
 * For easy reference and prefetching
 */
const lazyComponents = {
  MapView,
  AvailabilityCalendar,
  RichTextEditor,
  AnalyticsChart,
  ImageUploader,
  DocumentViewer,
  PaymentForm,
  MessageThread,
  NotificationCenter,
  SearchFiltersPanel,
  AdminDashboard,
  VendorDashboard,
  CustomerDashboard,
};

export default lazyComponents;
