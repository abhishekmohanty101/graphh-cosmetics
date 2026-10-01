import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
  getPaginationParams,
  createPagination,
} from '@/lib/api'

// GET /api/v1/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const status = searchParams.get('status')

    const where: any = { userId: session.user.id }
    if (status) {
      where.status = status
    }

    const total = await prisma.order.count({ where })

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        payment: {
          select: { status: true },
        },
        items: {
          select: {
            id: true,
            name: true,
            image: true,
            quantity: true,
            price: true,
          },
          take: 3,
        },
        _count: {
          select: { items: true },
        },
      },
    })

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.payment?.status || 'PENDING',
      total: Number(order.total),
      createdAt: order.createdAt,
      itemCount: order._count.items,
      previewItems: order.items,
    }))

    return successResponse(
      { orders: formattedOrders },
      createPagination(page, limit, total)
    )
  } catch (error) {
    return serverErrorResponse(error)
  }
}
