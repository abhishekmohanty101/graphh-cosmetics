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
import { trackShipment } from '@/lib/shipping/shiprocket'

// GET /api/v1/orders/[orderId]/track - Track order shipment
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    // Find the order with shipment
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        shipment: true,
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            image: true,
          },
        },
      },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    // Check if order belongs to user
    if (order.userId !== session.user.id) {
      return errorResponse('Order not found', 404)
    }

    // Check if order has been shipped
    if (!order.shipment) {
      return successResponse({
        tracking: null,
        message: 'Order not yet shipped',
        status: order.status,
        timeline: [
          {
            status: 'ORDER_PLACED',
            title: 'Order Placed',
            description: 'Your order has been placed successfully',
            timestamp: order.createdAt,
            completed: true,
          },
          {
            status: 'PROCESSING',
            title: 'Processing',
            description: 'Your order is being processed',
            timestamp: order.status === 'PROCESSING' ? new Date() : null,
            completed: ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
          },
          {
            status: 'SHIPPED',
            title: 'Shipped',
            description: 'Your order has been shipped',
            timestamp: null,
            completed: false,
          },
          {
            status: 'DELIVERED',
            title: 'Delivered',
            description: 'Your order has been delivered',
            timestamp: null,
            completed: false,
          },
        ],
      })
    }

    // If we have Shiprocket shipment ID, get live tracking
    let liveTracking = null
    if (order.shipment.shiprocketShipmentId) {
      try {
        liveTracking = await trackShipment(order.shipment.shiprocketShipmentId)
      } catch (error) {
        console.error('Shiprocket tracking error:', error)
      }
    }

    // Build timeline
    const timeline = [
      {
        status: 'ORDER_PLACED',
        title: 'Order Placed',
        description: 'Your order has been placed successfully',
        timestamp: order.createdAt,
        completed: true,
      },
      {
        status: 'CONFIRMED',
        title: 'Order Confirmed',
        description: 'Payment confirmed and order is being prepared',
        timestamp: order.status !== 'PENDING' ? order.updatedAt : null,
        completed: order.status !== 'PENDING',
      },
      {
        status: 'SHIPPED',
        title: 'Shipped',
        description: order.shipment.carrier 
          ? `Shipped via ${order.shipment.carrier}`
          : 'Your order has been shipped',
        timestamp: order.shipment.shippedAt,
        completed: !!order.shipment.shippedAt,
      },
      {
        status: 'IN_TRANSIT',
        title: 'In Transit',
        description: 'Your order is on its way',
        timestamp: order.shipment.status === 'IN_TRANSIT' ? new Date() : null,
        completed: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.shipment.status),
      },
      {
        status: 'OUT_FOR_DELIVERY',
        title: 'Out for Delivery',
        description: 'Your order is out for delivery',
        timestamp: order.shipment.status === 'OUT_FOR_DELIVERY' ? new Date() : null,
        completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.shipment.status),
      },
      {
        status: 'DELIVERED',
        title: 'Delivered',
        description: 'Your order has been delivered',
        timestamp: order.shipment.deliveredAt,
        completed: order.shipment.status === 'DELIVERED',
      },
    ]

    return successResponse({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        items: order.items,
      },
      shipment: {
        id: order.shipment.id,
        status: order.shipment.status,
        carrier: order.shipment.carrier,
        trackingNumber: order.shipment.trackingNumber,
        trackingUrl: order.shipment.trackingUrl,
        estimatedDelivery: order.shipment.estimatedDelivery,
        shippedAt: order.shipment.shippedAt,
        deliveredAt: order.shipment.deliveredAt,
      },
      timeline,
      liveTracking: liveTracking?.tracking_data || null,
    })
  } catch (error) {
    console.error('Track order error:', error)
    return errorResponse('Failed to fetch tracking information', 500)
  }
}
