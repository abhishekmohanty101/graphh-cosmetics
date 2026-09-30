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

// POST /api/v1/orders/[orderId]/cancel - Cancel an order
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json().catch(() => ({}))
    const { reason } = body

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        payment: true,
        items: true,
      },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    // Check if order belongs to user
    if (order.userId !== session.user.id) {
      return errorResponse('Order not found', 404)
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['PENDING', 'CONFIRMED']
    if (!cancellableStatuses.includes(order.status)) {
      return errorResponse(
        `Cannot cancel order with status "${order.status}". Only pending or confirmed orders can be cancelled.`,
        400
      )
    }

    // Update order status
    await prisma.order.update({
      where: { id: params.orderId },
      data: {
        status: 'CANCELLED',
        notes: reason ? `Cancelled by customer. Reason: ${reason}` : 'Cancelled by customer',
      },
    })

    // Restore inventory
    for (const item of order.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { inventory: { increment: item.quantity } },
        })
      } else {
        await prisma.product.update({
          where: { id: item.productId },
          data: { inventory: { increment: item.quantity } },
        })
      }
    }

    // If payment was made, initiate refund
    if (order.payment && order.payment.status === 'CAPTURED') {
      // TODO: Initiate refund via Razorpay
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: 'REFUNDED',
          refundAmount: order.payment.amount,
        },
      })
    }

    // Update coupon usage if applicable
    if (order.couponId) {
      await prisma.coupon.update({
        where: { id: order.couponId },
        data: { usageCount: { decrement: 1 } },
      })
    }

    return successResponse({
      message: 'Order cancelled successfully',
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: 'CANCELLED',
      refund: order.payment?.status === 'CAPTURED' 
        ? 'Refund will be processed within 5-7 business days'
        : null,
    })
  } catch (error) {
    console.error('Cancel order error:', error)
    return errorResponse('Failed to cancel order', 500)
  }
}
