import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  getPaginationParams,
  createPagination,
} from '@/lib/api/response'

// GET /api/v1/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const unreadOnly = searchParams.get('unread') === 'true'

    const where: any = { userId: session.user.id }
    if (unreadOnly) {
      where.read = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
    ])

    return successResponse(
      {
        notifications,
        unreadCount,
      },
      createPagination(page, limit, total)
    )
  } catch (error) {
    console.error('Get notifications error:', error)
    // If Notification model doesn't exist
    if ((error as any)?.code === 'P2021') {
      return successResponse({ notifications: [], unreadCount: 0 })
    }
    return errorResponse('Failed to fetch notifications', 500)
  }
}

// POST /api/v1/notifications - Mark all as read
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { action } = body

    if (action === 'mark_all_read') {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: { read: true },
      })

      return successResponse({
        message: 'All notifications marked as read',
      })
    }

    if (action === 'delete_all_read') {
      await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
          read: true,
        },
      })

      return successResponse({
        message: 'All read notifications deleted',
      })
    }

    return errorResponse('Invalid action', 400)
  } catch (error) {
    console.error('Notifications action error:', error)
    if ((error as any)?.code === 'P2021') {
      return successResponse({ message: 'No notifications to update' })
    }
    return errorResponse('Failed to update notifications', 500)
  }
}
