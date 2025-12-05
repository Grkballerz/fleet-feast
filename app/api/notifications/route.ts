/**
 * GET /api/notifications
 * List user's notifications with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { notificationService } from '@/modules/notification/notification.service';
import { NotificationError } from '@/modules/notification/notification.types';

export async function GET(request: NextRequest) {
  try {
    // Authentication required
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Validate pagination
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Limit must be between 1 and 100',
          },
        },
        { status: 400 }
      );
    }

    // Get notifications
    const result = await notificationService.getUserNotifications(currentUser.id, {
      limit,
      offset,
      unreadOnly,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API] GET /api/notifications error:', error);

    if (error instanceof NotificationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications',
        },
      },
      { status: 500 }
    );
  }
}
