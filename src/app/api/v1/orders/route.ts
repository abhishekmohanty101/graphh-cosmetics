import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return unauthorizedResponse()

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true, payment: true },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.payment?.status || 'PENDING',
        total: Number(o.total),
        createdAt: o.createdAt,
        itemCount: o.items.length,
      })),
    })
  } catch (error) {
    return errorResponse('Failed to fetch orders', 500)
  }
}
