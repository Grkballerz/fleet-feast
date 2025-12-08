/**
 * Fleet Feast - Performance Monitoring Utilities
 * Client and server-side performance tracking
 */

/**
 * Web Vitals tracking
 * Measure Core Web Vitals for real user monitoring
 */
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: 'web-vital' | 'custom';
}) {
  // Send to analytics service (Google Analytics, Sentry, etc.)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    // @ts-expect-error - gtag is injected by Google Analytics script
    if (window.gtag) {
      // @ts-expect-error - gtag is injected by Google Analytics script
      window.gtag('event', metric.name, {
        event_category: metric.label === 'web-vital' ? 'Web Vitals' : 'Custom Metrics',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Log to console in development
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[Performance]', metric.name, metric.value, metric.label);
  }
}

/**
 * Performance marks for custom measurements
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  mark(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
      this.marks.set(name, performance.now());
    }
  }

  measure(name: string, startMark: string, endMark?: string) {
    if (typeof performance !== 'undefined') {
      const start = this.marks.get(startMark);
      const end = endMark ? this.marks.get(endMark) : performance.now();

      if (start !== undefined && end !== undefined) {
        const duration = end - start;

        // Log slow operations (> 100ms)
        if (duration > 100) {
          console.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
        }

        return duration;
      }
    }

    return 0;
  }

  clear(name?: string) {
    if (name) {
      this.marks.delete(name);
      if (typeof performance !== 'undefined') {
        performance.clearMarks(name);
      }
    } else {
      this.marks.clear();
      if (typeof performance !== 'undefined') {
        performance.clearMarks();
      }
    }
  }
}

/**
 * Database query performance tracker
 * Use for monitoring slow queries
 */
export function trackQueryPerformance(queryName: string, duration: number) {
  // Log slow queries (> 500ms)
  if (duration > 500) {
    console.warn(`[DB Performance] Slow query: ${queryName} took ${duration.toFixed(2)}ms`);

    // Send to monitoring service (Sentry, DataDog, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry
      // Sentry.captureMessage(`Slow query: ${queryName}`, {
      //   level: 'warning',
      //   extra: { duration, queryName },
      // });
    }
  }
}

/**
 * API route performance wrapper
 */
export function withPerformanceTracking<T>(
  handler: () => Promise<T>,
  routeName: string
): Promise<T> {
  const start = performance.now();

  return handler()
    .then((result) => {
      const duration = performance.now() - start;

      // Log slow API routes (> 1000ms)
      if (duration > 1000) {
        console.warn(`[API Performance] Slow route: ${routeName} took ${duration.toFixed(2)}ms`);
      }

      return result;
    })
    .catch((error) => {
      const duration = performance.now() - start;
      console.error(`[API Performance] Failed route: ${routeName} after ${duration.toFixed(2)}ms`, error);
      throw error;
    });
}

/**
 * Client-side route transition tracking
 */
export function trackRouteChange(url: string) {
  if (typeof window !== 'undefined') {
    const navigationStart = performance.now();

    // Track time to interactive after route change
    setTimeout(() => {
      const duration = performance.now() - navigationStart;

      if (duration > 3000) {
        console.warn(`[Navigation] Slow route transition to ${url}: ${duration.toFixed(2)}ms`);
      }
    }, 0);
  }
}

/**
 * Image loading performance tracker
 */
export function trackImageLoad(imageSrc: string, loadTime: number) {
  if (loadTime > 2000) {
    console.warn(`[Image Performance] Slow image load: ${imageSrc} took ${loadTime.toFixed(2)}ms`);
  }
}

/**
 * Bundle size monitoring
 * Track JavaScript bundle sizes
 */
export function logBundleSize() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Use Performance API to get resource timings
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const jsResources = resources.filter((r) => r.name.endsWith('.js'));
    const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

    console.log('[Bundle Size] Total JS:', (totalSize / 1024).toFixed(2), 'KB');
    console.log('[Bundle Size] Scripts:', jsResources.length);

    // Log individual large scripts (> 100KB)
    jsResources.forEach((r) => {
      const size = (r.transferSize || 0) / 1024;
      if (size > 100) {
        console.warn(`[Bundle Size] Large script: ${r.name.split('/').pop()} - ${size.toFixed(2)}KB`);
      }
    });
  }
}

/**
 * Performance budget checker
 * Warn when metrics exceed thresholds
 */
export const PERFORMANCE_BUDGETS = {
  LCP: 2500, // Largest Contentful Paint
  FID: 100, // First Input Delay
  CLS: 0.1, // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint
  TTI: 3500, // Time to Interactive
  BUNDLE_SIZE: 200 * 1024, // 200KB gzipped
};

export function checkPerformanceBudget(metric: string, value: number): boolean {
  const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS];

  if (budget && value > budget) {
    console.warn(`[Performance Budget] ${metric} exceeded: ${value} > ${budget}`);
    return false;
  }

  return true;
}
