/**
 * Monitoring Module Index
 *
 * Fleet Feast - Centralized monitoring and observability utilities
 * Exports error tracking, performance monitoring, and analytics helpers
 */

// Export Sentry error tracking
export {
  initSentry,
  captureError,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  startTransaction,
  withErrorTracking,
} from './sentry';

// Re-export default Sentry instance
export { default as Sentry } from './sentry';

/**
 * Performance Monitoring Utilities
 */

/**
 * Track Web Vitals for performance monitoring
 * To be used in _app.tsx or layout.tsx
 *
 * @example
 * export function reportWebVitals(metric: NextWebVitalsMetric) {
 *   trackWebVital(metric);
 * }
 */
export function trackWebVital(metric: {
  id: string;
  name: string;
  label: string;
  value: number;
}) {
  // Send to analytics provider
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: metric.label === 'web-vital' ? 'Web Vitals' : 'Next.js Metric',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vital]', metric.name, Math.round(metric.value), 'ms');
  }

  // Send to Sentry for performance monitoring
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { captureMessage } = require('./sentry');
    captureMessage(`Web Vital: ${metric.name}`, 'info', {
      metric: metric.name,
      value: metric.value,
      id: metric.id,
    });
  }
}

/**
 * Log a custom performance metric
 *
 * @example
 * const start = performance.now();
 * // ... operation ...
 * logPerformance('database.query.bookings', performance.now() - start);
 */
export function logPerformance(operationName: string, durationMs: number) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${operationName}: ${Math.round(durationMs)}ms`);
  }

  // Send to monitoring if duration exceeds threshold
  if (durationMs > 1000) {
    // Over 1 second
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { captureMessage } = require('./sentry');
    captureMessage(`Slow operation: ${operationName}`, 'warning', {
      operation: operationName,
      duration: durationMs,
    });
  }
}

/**
 * Analytics Event Tracking
 */

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
}

/**
 * Track custom analytics event
 *
 * @example
 * trackEvent({
 *   category: 'Booking',
 *   action: 'create',
 *   label: 'vendor_123',
 *   value: 500
 * });
 */
export function trackEvent(event: AnalyticsEvent) {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }

  // Plausible Analytics (if configured)
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event.action, {
      props: {
        category: event.category,
        label: event.label,
        value: event.value,
      },
    });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event);
  }
}

/**
 * Track page view
 *
 * @example
 * trackPageView('/vendors/123', 'Vendor Profile');
 */
export function trackPageView(url: string, title?: string) {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
      page_path: url,
      page_title: title,
    });
  }

  // Plausible Analytics
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('pageview', { url });
  }
}

/**
 * Uptime Monitoring Utilities
 */

/**
 * Health check endpoint response
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: boolean;
    redis: boolean;
    stripe: boolean;
  };
  responseTime: number;
}

/**
 * Perform system health check
 * To be used in /api/health endpoint
 *
 * @example
 * const health = await performHealthCheck();
 * return Response.json(health);
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const start = performance.now();
  const checks = {
    database: false,
    redis: false,
    stripe: false,
  };

  try {
    // Check database connection
    const { prisma } = await import('@/lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('[Health Check] Database error:', error);
  }

  try {
    // Check Redis connection (if configured)
    if (process.env.REDIS_URL) {
      // Redis check implementation
      checks.redis = true; // Placeholder
    } else {
      checks.redis = true; // Not required
    }
  } catch (error) {
    console.error('[Health Check] Redis error:', error);
  }

  try {
    // Check Stripe API (lightweight check)
    if (process.env.STRIPE_SECRET_KEY) {
      // Stripe check implementation
      checks.stripe = true; // Placeholder
    } else {
      checks.stripe = true; // Not required in dev
    }
  } catch (error) {
    console.error('[Health Check] Stripe error:', error);
  }

  const allHealthy = Object.values(checks).every(Boolean);
  const someHealthy = Object.values(checks).some(Boolean);

  return {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
    responseTime: Math.round(performance.now() - start),
  };
}

/**
 * Type definitions for global analytics
 */
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    plausible?: (
      event: string,
      options?: { props?: Record<string, any>; url?: string }
    ) => void;
  }
}

/**
 * Initialize all monitoring services
 * Call this in your root layout or _app.tsx
 *
 * @example
 * useEffect(() => {
 *   initializeMonitoring();
 * }, []);
 */
export function initializeMonitoring() {
  // Sentry auto-initializes via sentry.ts
  console.log('[Monitoring] Initialized');
}
