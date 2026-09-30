import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'

// GET /api/v1/user/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    // Get user with preferences
    // Since we don't have a separate preferences table, store in user metadata
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        metadata: true,
      },
    })

    // Default preferences
    const defaultPreferences = {
      notifications: {
        email: {
          orders: true,
          promotions: true,
          newsletter: true,
          reviews: true,
        },
        sms: {
          orders: true,
          promotions: false,
        },
        push: {
          orders: true,
          promotions: false,
        },
      },
      privacy: {
        showProfile: false,
        showReviews: true,
      },
      display: {
        currency: 'INR',
        language: 'en',
      },
    }

    const userMetadata = (user?.metadata as any) || {}
    const preferences = {
      ...defaultPreferences,
      ...userMetadata.preferences,
    }

    return successResponse({ preferences })
  } catch (error) {
    console.error('Get preferences error:', error)
    return errorResponse('Failed to fetch preferences', 500)
  }
}

// PATCH /api/v1/user/preferences - Update user preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { notifications, privacy, display } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { metadata: true },
    })

    const currentMetadata = (user?.metadata as any) || {}
    const currentPreferences = currentMetadata.preferences || {}

    const updatedPreferences = {
      ...currentPreferences,
      ...(notifications && { notifications: { ...currentPreferences.notifications, ...notifications } }),
      ...(privacy && { privacy: { ...currentPreferences.privacy, ...privacy } }),
      ...(display && { display: { ...currentPreferences.display, ...display } }),
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        metadata: {
          ...currentMetadata,
          preferences: updatedPreferences,
        },
      },
    })

    return successResponse({
      preferences: updatedPreferences,
      message: 'Preferences updated successfully',
    })
  } catch (error) {
    console.error('Update preferences error:', error)
    return errorResponse('Failed to update preferences', 500)
  }
}
