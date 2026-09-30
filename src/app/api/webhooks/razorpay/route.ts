import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'

// Razorpay sends webhooks for payment events
// POST /api/webhooks/razorpay
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Razorpay webhook signature mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const { event: eventType, payload } = event

    console.log('Razorpay webhook event:', eventType)

    switch (eventType) {
      case 'payment.captured': {
        // Payment successful
        const paymentEntity = payload.payment.entity
        const orderId = paymentEntity.notes?.orderId || paymentEntity.order_id

        // Find payment record by Razorpay order ID
        const payment = await prisma.payment.findFirst({
          where: { providerOrderId: paymentEntity.order_id },
        })

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              transactionId: paymentEntity.id,
              paidAt: new Date(),
            },
          })

          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
            },
          })
        }
        break
      }

      case 'payment.failed': {
        // Payment failed
        const paymentEntity = payload.payment.entity

        const payment = await prisma.payment.findFirst({
          where: { providerOrderId: paymentEntity.order_id },
        })

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              transactionId: paymentEntity.id,
            },
          })

          // Keep order as pending, customer can retry
        }
        break
      }

      case 'refund.processed': {
        // Refund completed
        const refundEntity = payload.refund.entity
        const paymentId = refundEntity.payment_id

        const payment = await prisma.payment.findFirst({
          where: { transactionId: paymentId },
        })

        if (payment) {
          // Check if full refund
          if (refundEntity.amount === payment.amount * 100) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'REFUNDED' },
            })

            await prisma.order.update({
              where: { id: payment.orderId },
              data: { paymentStatus: 'REFUNDED' },
            })
          } else {
            // Partial refund
            await prisma.order.update({
              where: { id: payment.orderId },
              data: { paymentStatus: 'PARTIALLY_REFUNDED' },
            })
          }
        }
        break
      }

      case 'order.paid': {
        // Order fully paid
        const orderEntity = payload.order.entity

        const payment = await prisma.payment.findFirst({
          where: { providerOrderId: orderEntity.id },
        })

        if (payment && payment.status !== 'COMPLETED') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              paidAt: new Date(),
            },
          })

          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
            },
          })
        }
        break
      }

      default:
        console.log('Unhandled Razorpay event:', eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
