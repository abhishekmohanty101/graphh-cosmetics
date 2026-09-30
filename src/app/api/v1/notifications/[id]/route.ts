import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/api/response'

// PATCH /api/v1/notifications/[id] - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!notification) {
      return notFoundResponse('Notification')
    }

    if (notification.userId !== session.user.id) {
      return errorResponse('Notification not found', 404)
    }

    await prisma.notification.update({
      where: { id: params.id },
      data: { read: true },
    })

    return successResponse({
      message: 'Notification marked as read',
    })
  } catch (error) {
    console.error('Mark notification error:', error)
    if ((error as any)?.code === 'P2021') {
      return notFoundResponse('Notification')
    }
    return errorResponse('Failed to update notification', 500)
  }
}

// DELETE /api/v1/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!notification) {
      return notFoundResponse('Notification')
    }

    if (notification.userId !== session.user.id) {
      return errorResponse('Notification not found', 404)
    }

    await prisma.notification.delete({
      where: { id: params.id },
    })

    return successResponse({
      message: 'Notification deleted',
    })
  } catch (error) {
    console.error('Delete notification error:', error)
    if ((error as any)?.code === 'P2021') {
      return notFoundResponse('Notification')
    }
    return errorResponse('Failed to delete notification', 500)
  }
}
