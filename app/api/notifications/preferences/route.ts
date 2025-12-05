/**
 * GET/PUT /api/notifications/preferences
 * Manage user's notification preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { notificationService } from '@/modules/notification/notification.service';
import { NotificationError } from '@/modules/notification/notification.types';
import { z } from 'zod';

// Validation schema for preferences
const updatePreferencesSchema = z.object({
  emailBookingRequest: z.boolean().optional(),
  emailBookingAccepted: z.boolean().optional(),
  emailBookingDeclined: z.boolean().optional(),
  emailBookingCancelled: z.boolean().optional(),
  emailPaymentConfirmed: z.boolean().optional(),
  emailNewMessage: z.boolean().optional(),
  emailEventReminder: z.boolean().optional(),
  emailReviewPrompt: z.boolean().optional(),
  emailDisputeCreated: z.boolean().optional(),
  emailDisputeResolved: z.boolean().optional(),
  emailViolationWarning: z.boolean().optional(),
  emailAccountStatusChanged: z.boolean().optional(),
  emailDigest: z.boolean().optional(),
});

/**
 * GET /api/notifications/preferences
 */
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

    // Get preferences
    const preferences = await notificationService.getPreferences(currentUser.id);

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('[API] GET /api/notifications/preferences error:', error);

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
          message: 'Failed to fetch notification preferences',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 */
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updatePreferencesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid notification preferences',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Update preferences
    const preferences = await notificationService.updatePreferences(
      currentUser.id,
      validationResult.data
    );

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated',
      data: preferences,
    });
  } catch (error) {
    console.error('[API] PUT /api/notifications/preferences error:', error);

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
          message: 'Failed to update notification preferences',
        },
      },
      { status: 500 }
    );
  }
}
