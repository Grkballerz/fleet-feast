/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { notificationService } from '@/modules/notification/notification.service';
import { NotificationError } from '@/modules/notification/notification.types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const notificationId = params.id;

    // Mark notification as read
    const notification = await notificationService.markAsRead(
      notificationId,
      currentUser.id
    );

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('[API] PUT /api/notifications/:id/read error:', error);

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
          message: 'Failed to mark notification as read',
        },
      },
      { status: 500 }
    );
  }
}
