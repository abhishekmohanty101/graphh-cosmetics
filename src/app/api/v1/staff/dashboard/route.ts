import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
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

// GET /api/v1/staff/dashboard - Staff dashboard stats
export async function GET(request: NextRequest) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      todayOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      lowStockCount,
      pendingReviews,
      openTickets,
      returnRequests,
    ] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
      prisma.order.count({
        where: { status: 'PROCESSING' },
      }),
      prisma.order.count({
        where: { status: 'SHIPPED' },
      }),
      prisma.product.count({
        where: {
          isActive: true,
          inventory: { lte: 10 },
        },
      }),
      prisma.review.count({
        where: { isApproved: false },
      }),
      // Support tickets (if model exists)
      prisma.supportTicket.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }).catch(() => 0),
      // Return requests
      prisma.order.count({
        where: { status: 'RETURN_REQUESTED' },
      }),
    ])

    // Get today's revenue
    const todayOrdersWithTotal = await prisma.order.findMany({
      where: {
        createdAt: { gte: today },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      select: { total: true },
    })
    const todayRevenue = todayOrdersWithTotal.reduce((sum, o) => sum + Number(o.total), 0)

    // Recent pending orders
    const recentPendingOrders = await prisma.order.findMany({
      where: { status: { in: ['PENDING', 'CONFIRMED'] } },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        user: { select: { name: true,  email: true } },
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
    })

    // Low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        inventory: { lte: 10 },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        inventory: true,
        images: true,
      },
      orderBy: { inventory: 'asc' },
      take: 10,
    })

    return successResponse({
      summary: {
        todayOrders,
        todayRevenue,
        pendingOrders,
        processingOrders,
        shippedOrders,
        lowStockCount,
        pendingReviews,
        openTickets,
        returnRequests,
      },
      alerts: {
        pendingOrders: pendingOrders > 0,
        lowStock: lowStockCount > 0,
        openTickets: openTickets > 0,
        pendingReviews: pendingReviews > 0,
        returnRequests: returnRequests > 0,
      },
      recentPendingOrders: recentPendingOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: `${o.user.name || ''} ${o. || ''}`.trim() || o.user.email,
        total: Number(o.total),
        status: o.status,
        itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
        createdAt: o.createdAt,
      })),
      lowStockProducts,
    })
  } catch (error) {
    console.error('Staff dashboard error:', error)
    return errorResponse('Failed to fetch dashboard data', 500)
  }
}
