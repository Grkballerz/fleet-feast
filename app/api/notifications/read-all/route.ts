/**
 * PUT /api/notifications/read-all
 * Mark all user's notifications as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { notificationService } from '@/modules/notification/notification.service';
import { NotificationError } from '@/modules/notification/notification.types';

export async function PUT(request: NextRequest) {
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

    // Mark all notifications as read
    const result = await notificationService.markAllAsRead(currentUser.id);

    return NextResponse.json({
      success: true,
      message: `Marked ${result.count} notifications as read`,
      data: result,
    });
  } catch (error) {
    console.error('[API] PUT /api/notifications/read-all error:', error);

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
          message: 'Failed to mark all notifications as read',
        },
      },
      { status: 500 }
    );
  }
}
