import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  getPaginationParams,
  createPagination,
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
  const staffRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'SUPPORT_AGENT']
  if (!user || !staffRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user, role: user.role }
}

// GET /api/v1/staff/orders - List orders for processing
export async function GET(request: NextRequest) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search } } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          updatedAt: true,
          shippingAddress: true,
          payment: {
            select: { method: true, status: true },
          },
          user: {
            select: { name: true,  email: true, phone: true },
          },
          items: {
            select: {
              id: true,
              name: true,
              sku: true,
              quantity: true,
              image: true,
            },
          },
          shipment: {
            select: { status: true, trackingNumber: true, carrier: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      customer: {
        name: order.user.name || order.user.email,
        email: order.user.email,
        phone: order.user.phone,
      },
      shippingAddress: order.shippingAddress,
      payment: order.payment,
      items: order.items,
      itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
      shipment: order.shipment,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }))

    return successResponse(
      { orders: transformedOrders },
      createPagination(page, limit, total)
    )
  } catch (error) {
    console.error('Staff orders error:', error)
    return errorResponse('Failed to fetch orders', 500)
  }
}
