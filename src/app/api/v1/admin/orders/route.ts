import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
  serverErrorResponse,
  getPaginationParams,
  createPagination,
} from '@/lib/api'

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

// GET /api/v1/admin/orders - List all orders (admin view)
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (paymentStatus) {
      where.payment = { status: paymentStatus }
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const total = await prisma.order.count({ where })

    const orders = await prisma.order.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        payment: {
          select: { status: true },
        },
        _count: { select: { items: true } },
      },
    })

    return successResponse(
      {
        orders: orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.payment?.status || 'PENDING',
          total: Number(order.total),
          itemCount: order._count.items,
          customer: {
            id: order.user.id,
            name: order.user.name || 'Unknown',
            email: order.user.email,
            phone: order.user.phone,
          },
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
        })),
      },
      createPagination(page, limit, total)
    )
  } catch (error) {
    return serverErrorResponse(error)
  }
}
