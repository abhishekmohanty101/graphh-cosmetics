import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api'

// GET /api/v1/orders/[orderId] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: params.orderId },
          { orderNumber: params.orderId },
        ],
        userId: session.user.id,
      },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            variantId: true,
            name: true,
            variantName: true,
            sku: true,
            quantity: true,
            price: true,
            discount: true,
            total: true,
            image: true,
            product: {
              select: { slug: true },
            },
          },
        },
        shippingAddress: {
          select: {
            name: true,
            
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          },
        },
        billingAddress: {
          select: {
            name: true,
            
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          },
        },
        payments: {
          select: {
            id: true,
            method: true,
            status: true,
            amount: true,
            transactionId: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        shipments: {
          select: {
            id: true,
            carrier: true,
            trackingNumber: true,
            trackingUrl: true,
            status: true,
            estimatedDelivery: true,
            shippedAt: true,
            deliveredAt: true,
          },
        },
      },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    const formattedItems = order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productSlug: item.product?.slug,
      variantId: item.variantId,
      name: item.name,
      variantName: item.variantName,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount,
      total: item.total,
      image: item.image,
    }))

    return successResponse({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.payments?.[0]?.status || 'PENDING',
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: formattedItems,
      shippingAddress: order.shippingAddress,
      payment: order.payments?.[0] || null,
      shipment: order.shipment || null,
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// PATCH /api/v1/orders/[orderId] - Cancel order
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { action, reason } = body

    if (action !== 'cancel') {
      return errorResponse('Invalid action', 400)
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: params.orderId },
          { orderNumber: params.orderId },
        ],
        userId: session.user.id,
      },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING']
    if (!cancellableStatuses.includes(order.status)) {
      return errorResponse(
        'Order cannot be cancelled. It may have already been shipped or delivered.',
        400
      )
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        notes: reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer',
      },
    })

    // TODO: Restore inventory
    // TODO: Process refund if paid

    return successResponse({ message: 'Order cancelled successfully' })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
