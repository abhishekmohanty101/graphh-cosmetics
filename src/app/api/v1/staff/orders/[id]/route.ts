import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api/response'

async function checkStaffAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  const staffRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF', 'ORDER_MANAGER']
  if (!user || !staffRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user, role: user.role }
}

// GET /api/v1/staff/orders/[id] - Get order details for processing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                images: true,
                inventory: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                attributes: true,
                inventory: true,
              },
            },
          },
        },
        payment: true,
        shipment: true,
        address: true,
      },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    // Generate pick list (for warehouse staff)
    const pickList = order.items.map((item) => ({
      sku: item.sku || item.product.sku,
      name: item.name,
      variant: item.variant?.name || null,
      quantity: item.quantity,
      image: item.image || item.product.images[0],
      location: `Aisle ${Math.floor(Math.random() * 10) + 1}, Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`, // Placeholder
      inStock: item.variant 
        ? item.variant.inventory >= item.quantity 
        : item.product.inventory >= item.quantity,
    }))

    return successResponse({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        shipping: Number(order.shipping),
        tax: Number(order.tax),
        notes: order.notes,
        giftMessage: order.giftMessage,
        customer: {
          id: order.user.id,
          name: order.user.name || 'Unknown',
          email: order.user.email,
          phone: order.user.phone,
        },
        shippingAddress: order.shippingAddress,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.total),
          image: item.image,
          attributes: item.attributes,
        })),
        payment: order.payment ? {
          status: order.payment.status,
          method: order.payment.method,
          paidAt: order.payment.paidAt,
        } : null,
        shipment: order.shipment,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      pickList,
    })
  } catch (error) {
    console.error('Get staff order error:', error)
    return errorResponse('Failed to fetch order', 500)
  }
}

// PATCH /api/v1/staff/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const body = await request.json()
    const { status, note, trackingNumber, carrier } = body

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { shipment: true },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
      RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
    }

    if (status && validTransitions[order.status] && !validTransitions[order.status].includes(status)) {
      return errorResponse(
        `Cannot transition from ${order.status} to ${status}`,
        400
      )
    }

    // Update order
    const updates: any = {}
    if (status) {
      updates.status = status
    }
    if (note) {
      updates.notes = order.notes ? `${order.notes}\n[Staff] ${note}` : `[Staff] ${note}`
    }

    await prisma.order.update({
      where: { id: params.id },
      data: updates,
    })

    // Update shipment if tracking info provided
    if ((trackingNumber || carrier) && order.shipment) {
      await prisma.shipment.update({
        where: { id: order.shipment.id },
        data: {
          trackingNumber: trackingNumber || order.shipment.trackingNumber,
          carrier: carrier || order.shipment.carrier,
          status: status === 'SHIPPED' ? 'IN_TRANSIT' : order.shipment.status,
          shippedAt: status === 'SHIPPED' ? new Date() : order.shipment.shippedAt,
        },
      })
    } else if (status === 'SHIPPED' && !order.shipment) {
      // Create shipment if not exists
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          trackingNumber: trackingNumber || null,
          carrier: carrier || null,
          status: 'IN_TRANSIT',
          shippedAt: new Date(),
        },
      })
    }

    return successResponse({
      message: 'Order updated successfully',
      status: status || order.status,
    })
  } catch (error) {
    console.error('Update staff order error:', error)
    return errorResponse('Failed to update order', 500)
  }
}
