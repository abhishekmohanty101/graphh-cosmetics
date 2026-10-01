import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api'
import { z } from 'zod'

async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'ORDER_MANAGER', 'SUPPORT']
  if (!user || !adminRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }

  return { user: session.user }
}

// GET /api/v1/admin/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            
            email: true,
            phone: true,
            _count: { select: { orders: true } },
          },
        },
        items: {
          include: {
            product: { select: { slug: true, images: true } },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        shipments: true,
      },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    return successResponse({ order })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

const updateOrderSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
    'RETURN_REQUESTED',
    'RETURNED',
  ]).optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  note: z.string().optional(),
})

// PATCH /api/v1/admin/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    const body = await request.json()
    const result = updateOrderSchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Invalid request data', 400)
    }

    const { status, trackingNumber, carrier, note } = result.data

    // Update order status
    if (status) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status,
          ...(note && { notes: note }),
        },
      })

      // If shipped, create/update shipment
      if (status === 'SHIPPED' && trackingNumber) {
        await prisma.shipment.upsert({
          where: { orderId: order.id },
          create: {
            orderId: order.id,
            carrier: carrier || 'Shiprocket',
            trackingNumber,
            status: 'SHIPPED',
            shippedAt: new Date(),
          },
          update: {
            trackingNumber,
            carrier: carrier || 'Shiprocket',
            status: 'SHIPPED',
            shippedAt: new Date(),
          },
        })
      }

      // If delivered, update shipment
      if (status === 'DELIVERED') {
        await prisma.shipment.updateMany({
          where: { orderId: order.id },
          data: {
            status: 'DELIVERED',
            deliveredAt: new Date(),
          },
        })
      }

      // If COD and delivered, mark as paid
      if (status === 'DELIVERED') {
        const codPayment = await prisma.payment.findFirst({
          where: { orderId: order.id, method: 'COD' },
        })
        if (codPayment) {
          await prisma.payment.update({
            where: { id: codPayment.id },
            data: { status: 'COMPLETED', paidAt: new Date() },
          })
        }
      }

      // TODO: Send notification email to customer
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        shipment: true,
      },
    })

    return successResponse({
      message: 'Order updated successfully',
      order: updatedOrder,
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
