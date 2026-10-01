import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api/response'

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return unauthorizedResponse()

    const order = await prisma.order.findFirst({
      where: { id: params.orderId, userId: session.user.id },
      include: { items: true, payment: true, shipment: true },
    })

    if (!order) return notFoundResponse('Order')

    return successResponse({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.payment?.status || 'PENDING',
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      shippingAddress: order.shippingAddress,
      items: order.items,
      payment: order.payment,
      shipment: order.shipment,
      createdAt: order.createdAt,
    })
  } catch (error) {
    return errorResponse('Failed to fetch order', 500)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  return successResponse({ message: 'Order cancellation not implemented' })
}
