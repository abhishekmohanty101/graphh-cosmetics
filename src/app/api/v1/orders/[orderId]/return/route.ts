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

// POST /api/v1/orders/[orderId]/return - Request return for an order
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { reason, itemIds, images } = body

    if (!reason) {
      return errorResponse('Return reason is required', 400)
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        items: true,
        shipment: true,
      },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    // Check if order belongs to user
    if (order.userId !== session.user.id) {
      return errorResponse('Order not found', 404)
    }

    // Check if order is eligible for return (must be delivered)
    if (order.status !== 'DELIVERED') {
      return errorResponse('Only delivered orders can be returned', 400)
    }

    // Check return window (7 days from delivery)
    const deliveredAt = order.shipment?.deliveredAt
    if (deliveredAt) {
      const returnWindow = new Date(deliveredAt)
      returnWindow.setDate(returnWindow.getDate() + 7)
      
      if (new Date() > returnWindow) {
        return errorResponse('Return window has expired (7 days from delivery)', 400)
      }
    }

    // Check if return already requested
    if (order.status === 'RETURN_REQUESTED' || order.status === 'RETURNED') {
      return errorResponse('Return already requested for this order', 400)
    }

    // Create return request
    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        userId: session.user.id,
        reason,
        itemIds: itemIds || order.items.map((i) => i.id),
        images: images || [],
        status: 'PENDING',
      },
    })

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'RETURN_REQUESTED' },
    })

    return successResponse({
      message: 'Return request submitted successfully',
      returnRequest: {
        id: returnRequest.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'PENDING',
        reason,
        createdAt: returnRequest.createdAt,
      },
      nextSteps: [
        'Our team will review your request within 24-48 hours',
        'You will receive an email with pickup details once approved',
        'Refund will be processed within 5-7 business days after pickup',
      ],
    })
  } catch (error) {
    console.error('Return request error:', error)
    // If ReturnRequest model doesn't exist, update order directly
    if ((error as any)?.code === 'P2021') {
      try {
        await prisma.order.update({
          where: { id: params.orderId },
          data: { 
            status: 'RETURN_REQUESTED',
            notes: `Return requested. Reason: ${(await request.json()).reason}`,
          },
        })
        return successResponse({
          message: 'Return request submitted successfully',
          nextSteps: ['Our team will contact you within 24-48 hours'],
        })
      } catch {
        return errorResponse('Failed to submit return request', 500)
      }
    }
    return errorResponse('Failed to submit return request', 500)
  }
}

// GET /api/v1/orders/[orderId]/return - Get return request status
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        orderNumber: true,
      },
    })

    if (!order || order.userId !== session.user.id) {
      return notFoundResponse('Order')
    }

    // Try to get return request
    try {
      const returnRequest = await prisma.returnRequest.findFirst({
        where: { orderId: params.orderId },
        orderBy: { createdAt: 'desc' },
      })

      if (!returnRequest) {
        return successResponse({ returnRequest: null })
      }

      return successResponse({ returnRequest })
    } catch {
      // ReturnRequest model doesn't exist
      return successResponse({
        returnRequest: order.status === 'RETURN_REQUESTED' ? {
          orderId: order.id,
          status: 'PENDING',
        } : null,
      })
    }
  } catch (error) {
    console.error('Get return status error:', error)
    return errorResponse('Failed to fetch return status', 500)
  }
}
