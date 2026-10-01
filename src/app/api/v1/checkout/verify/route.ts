import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api'
import { z } from 'zod'

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

// POST /api/v1/checkout/verify - Verify Razorpay payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const result = verifyPaymentSchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Invalid payment data', 400)
    }

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = result.data

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        payments: {
          where: { providerOrderId: razorpay_order_id },
          take: 1,
        },
      },
    })

    if (!order) {
      return errorResponse('Order not found', 404)
    }

    if (order.payments.length === 0) {
      return errorResponse('Payment record not found', 404)
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      // Update payment as failed
      await prisma.payment.update({
        where: { id: order.payments[0].id },
        data: { status: 'FAILED' },
      })

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
        },
      })

      // TODO: Restore inventory

      return errorResponse('Payment verification failed', 400)
    }

    // Payment successful - update records
    await prisma.payment.update({
      where: { id: order.payments[0].id },
      data: {
        status: 'COMPLETED',
        transactionId: razorpay_payment_id,
        paidAt: new Date(),
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
      },
    })

    // TODO: Send order confirmation email

    return successResponse({
      message: 'Payment verified successfully',
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
