/**
 * Sentry Error Tracking Configuration
 *
 * Fleet Feast - Monitoring & Alerting
 * Initializes Sentry for error tracking, performance monitoring, and distributed tracing
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry with environment-specific configuration
 *
 * Features:
 * - Error tracking with context
 * - Performance monitoring (traces)
 * - Session tracking
 * - Release tracking
 * - User context (when authenticated)
 */
export function initSentry() {
  Sentry.init({
    // Data Source Name - connects to your Sentry project
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,

    // Environment helps segregate errors by deployment
    environment: process.env.NODE_ENV || 'development',

    // Release tracking for better debugging
    release: process.env.NEXT_PUBLIC_APP_VERSION || `fleet-feast@${process.env.VERCEL_GIT_COMMIT_SHA || 'dev'}`,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay (opt-in for privacy)
    replaysSessionSampleRate: 0.0, // Disabled by default
    replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Integrations
    integrations: [
      new Sentry.BrowserTracing({
        // Trace specific routes
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/fleet-feast\.vercel\.app/,
          /^https:\/\/.*\.fleet-feast\.com/,
        ],
      }),
      new Sentry.Replay({
        // Privacy settings
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Filter before sending to Sentry
    beforeSend(event, hint) {
      // Don't send errors in development (unless explicitly enabled)
      if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEV_ENABLED) {
        console.error('[Sentry - Dev Only]', hint.originalException || hint.syntheticException);
        return null;
      }

      // Filter out sensitive data
      if (event.request) {
        // Remove cookies (may contain auth tokens)
        delete event.request.cookies;

        // Remove authorization headers
        if (event.request.headers) {
          delete event.request.headers.Authorization;
          delete event.request.headers.Cookie;
        }

        // Sanitize query parameters
        if (event.request.query_string) {
          const sanitized = event.request.query_string
            .replace(/token=[^&]*/gi, 'token=[REDACTED]')
            .replace(/key=[^&]*/gi, 'key=[REDACTED]')
            .replace(/password=[^&]*/gi, 'password=[REDACTED]');
          event.request.query_string = sanitized;
        }
      }

      // Filter out non-critical errors
      if (event.exception?.values) {
        const errorMessage = event.exception.values[0]?.value || '';

        // Ignore known client-side errors
        const ignoredErrors = [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          'Network request failed', // User connectivity issues
          'ChunkLoadError', // Code splitting issues (retry usually works)
        ];

        if (ignoredErrors.some(ignored => errorMessage.includes(ignored))) {
          return null;
        }
      }

      return event;
    },

    // Add custom tags for filtering
    initialScope: {
      tags: {
        'app.platform': 'web',
        'app.region': process.env.VERCEL_REGION || 'unknown',
      },
    },

    // Ignore specific URLs
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'canvas.contentDocument',
      // Random plugins/extensions
      'Can\'t find variable: ZiteReader',
      'jigsaw is not defined',
      'ComcastECNVideoPlayer is not defined',
    ],
  });
}

/**
 * Capture a custom error with additional context
 *
 * @example
 * captureError(new Error('Payment failed'), {
 *   userId: user.id,
 *   bookingId: booking.id,
 *   paymentIntent: intent.id
 * });
 */
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

/**
 * Capture a message for non-error events
 *
 * @example
 * captureMessage('User reached booking limit', 'warning', {
 *   userId: user.id,
 *   bookingCount: count
 * });
 */
export function captureMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context,
    },
  });
}

/**
 * Set user context for error tracking
 *
 * @example
 * setUser({
 *   id: user.id,
 *   email: user.email,
 *   role: user.role
 * });
 */
export function setUser(user: {
  id: string;
  email?: string;
  role?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    // Add custom fields
    role: user.role,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging context
 *
 * @example
 * addBreadcrumb('booking.created', { bookingId: booking.id });
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start a new transaction for performance monitoring
 *
 * @example
 * const transaction = startTransaction('booking.create', 'task');
 * // ... do work ...
 * transaction.finish();
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Wrap an async function with error tracking
 *
 * @example
 * const safeHandler = withErrorTracking(async () => {
 *   // ... code that might throw ...
 * }, 'api.booking.create');
 */
export function withErrorTracking<T>(
  fn: () => Promise<T>,
  transactionName?: string
): Promise<T> {
  return Sentry.startSpan(
    {
      name: transactionName || 'anonymous',
      op: 'function',
    },
    async () => {
      try {
        return await fn();
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    }
  );
}

// Auto-initialize if running in browser
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  initSentry();
}

export default Sentry;
