import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

// POST /api/v1/admin/orders/[id]/ship - Create shipment for order
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { carrier, trackingNumber, weight, dimensions, pickup_date } = body

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        items: { include: { product: true } },
        shipment: true,
      },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    if (order.shipment) {
      return errorResponse('Shipment already exists for this order', 400)
    }

    if (!['CONFIRMED', 'PROCESSING'].includes(order.status)) {
      return errorResponse(`Cannot ship order with status ${order.status}`, 400)
    }

    const shippingAddress = order.shippingAddress as any

    // In production, call Shiprocket API to create shipment
    // const shiprocketResponse = await shiprocket.createOrder({
    //   order_id: order.orderNumber,
    //   order_date: order.createdAt,
    //   pickup_location: "Primary",
    //   billing_customer_name: order.user.name,
    //   billing_address: shippingAddress.addressLine1,
    //   billing_city: shippingAddress.city,
    //   billing_pincode: shippingAddress.pincode,
    //   billing_state: shippingAddress.state,
    //   billing_country: "India",
    //   billing_phone: order.user.phone,
    //   ...
    // })

    // For now, create shipment record
    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: carrier || 'Shiprocket',
        trackingNumber: trackingNumber || `SR${Date.now()}`,
        status: 'PENDING',
        weight: weight || 500, // grams
        dimensions: dimensions || { length: 20, width: 15, height: 10 },
      },
    })

    // Update order status
    await prisma.order.update({
      where: { id: params.id },
      data: { status: 'SHIPPED' },
    })

    // TODO: Send shipping notification email to customer

    return successResponse({
      message: 'Shipment created successfully',
      shipment: {
        id: shipment.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        carrier: shipment.carrier,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        trackingUrl: `https://shiprocket.co/tracking/${shipment.trackingNumber}`,
        estimatedDelivery: getEstimatedDelivery(shippingAddress.pincode),
      },
    })
  } catch (error) {
    console.error('Create shipment error:', error)
    return errorResponse('Failed to create shipment', 500)
  }
}

function getEstimatedDelivery(pincode: string): string {
  const metroPincodes = ['110', '400', '560', '600', '700', '500']
  const isMetro = metroPincodes.some((p) => pincode?.startsWith(p))
  const daysToAdd = isMetro ? 3 : 7
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd)
  return deliveryDate.toISOString().split('T')[0]
}
