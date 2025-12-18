/**
 * Admin API - Cache Statistics
 * Provides cache performance metrics for monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getCacheMetrics,
  getCacheStatsSummary,
  resetCacheMetrics,
  warmAllCaches,
} from '@/lib/cache';
import { UserRole } from '@prisma/client';

/**
 * GET /api/admin/cache-stats
 * Get current cache metrics and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can view cache stats
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get metrics
    const metrics = getCacheMetrics();
    const summary = getCacheStatsSummary();

    return NextResponse.json({
      metrics,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cache Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cache statistics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/cache-stats
 * Perform cache management operations
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can manage cache
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'reset-metrics':
        resetCacheMetrics();
        return NextResponse.json({
          success: true,
          message: 'Cache metrics reset successfully',
        });

      case 'warm-all':
        const results = await warmAllCaches();
        return NextResponse.json({
          success: true,
          message: 'Cache warming completed',
          results,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: reset-metrics, warm-all' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Cache Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to perform cache operation' },
      { status: 500 }
    );
  }
}
