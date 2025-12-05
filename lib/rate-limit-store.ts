/**
 * In-Memory Rate Limit Store for Fleet Feast
 *
 * Simple token bucket implementation for rate limiting.
 * Can be swapped to Redis for distributed systems.
 *
 * Features:
 * - Per-key rate limiting (user ID or IP address)
 * - Automatic cleanup of expired entries
 * - Configurable window and limit
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class RateLimitStore {
  private store: Map<string, RateLimitRecord>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.store = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Check if a request is allowed under rate limit
   * @param key - Unique identifier (user ID or IP)
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and reset time
   */
  check(
    key: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const record = this.store.get(key);

    // No record or expired window - create new
    if (!record || now > record.resetAt) {
      const resetAt = now + windowMs;
      this.store.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: limit - 1, resetAt };
    }

    // Check if limit exceeded
    if (record.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: record.resetAt };
    }

    // Increment count
    record.count++;
    return {
      allowed: true,
      remaining: limit - record.count,
      resetAt: record.resetAt,
    };
  }

  /**
   * Reset rate limit for a specific key
   * Useful for testing or manual overrides
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all rate limit records
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get current count for a key
   */
  getCount(key: string): number {
    const record = this.store.get(key);
    if (!record || Date.now() > record.resetAt) {
      return 0;
    }
    return record.count;
  }

  /**
   * Start periodic cleanup of expired entries
   * Runs every 5 minutes to prevent memory leaks
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (now > record.resetAt) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Prevent Node.js from keeping process alive
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop cleanup interval (useful for testing)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get store statistics
   */
  getStats(): { totalKeys: number; activeKeys: number } {
    const now = Date.now();
    let activeKeys = 0;

    for (const record of this.store.values()) {
      if (now <= record.resetAt) {
        activeKeys++;
      }
    }

    return {
      totalKeys: this.store.size,
      activeKeys,
    };
  }
}

// Singleton instance
export const rateLimitStore = new RateLimitStore();

// Export class for testing
export { RateLimitStore };
