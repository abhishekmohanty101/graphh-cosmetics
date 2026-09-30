import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

// POST /api/v1/admin/orders/[id]/refund - Process refund
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { amount, reason, refundType = 'full' } = body

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { payment: true, items: true },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    if (!order.payment) {
      return errorResponse('No payment found for this order', 400)
    }

    if (order.payment.status !== 'CAPTURED') {
      return errorResponse('Payment not captured, cannot refund', 400)
    }

    const refundAmount = refundType === 'full' ? order.payment.amount : amount

    if (!refundAmount || refundAmount <= 0) {
      return errorResponse('Invalid refund amount', 400)
    }

    if (refundAmount > order.payment.amount) {
      return errorResponse('Refund amount exceeds payment amount', 400)
    }

    // In production, call Razorpay refund API
    // const razorpay = new Razorpay({ key_id, key_secret })
    // const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
    //   amount: refundAmount * 100, // in paise
    //   notes: { reason, orderId: order.id }
    // })

    // Update payment record
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        status: refundType === 'full' ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundAmount: refundAmount,
        refundedAt: new Date(),
      },
    })

    // Update order status
    await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'REFUNDED',
        notes: `Refund processed: ₹${refundAmount}. Reason: ${reason || 'Customer request'}`,
      },
    })

    // Restore inventory if full refund
    if (refundType === 'full') {
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
    }

    return successResponse({
      message: 'Refund processed successfully',
      refund: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        refundAmount,
        refundType,
        status: 'PROCESSED',
        processedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Process refund error:', error)
    return errorResponse('Failed to process refund', 500)
  }
}
