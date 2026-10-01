import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api'

// Middleware to check admin access
async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'PRODUCT_MANAGER']
  if (!user || !adminRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }

  return { user: session.user }
}

// GET /api/v1/admin/analytics - Dashboard stats
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401 
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get orders stats
    const ordersInPeriod = await prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        total: true,
        status: true,
        createdAt: true,
      },
    })

    const totalRevenue = ordersInPeriod
      .filter((o) => !['CANCELLED', 'REFUNDED'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.total), 0)

    const totalOrders = ordersInPeriod.length
    const completedOrders = ordersInPeriod.filter((o) => o.status === 'DELIVERED').length

    // Get previous period for comparison
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: previousStartDate, lt: startDate },
      },
      select: { total: true, status: true },
    })

    const previousRevenue = previousOrders
      .filter((o) => !['CANCELLED', 'REFUNDED'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.total), 0)

    const revenueChange = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 100

    const ordersChange = previousOrders.length > 0
      ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100
      : 100

    // Customer stats
    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    })

    const newCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: startDate },
      },
    })

    // Product stats
    const totalProducts = await prisma.product.count({
      where: { isActive: true },
    })

    const lowStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        inventory: { lte: 10 },
      },
    })

    // Order status breakdown
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    })

    // Top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    })

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, slug: true, images: true },
        })
        return {
          name: product?.name,
          slug: product?.slug,
          image: product?.images[0] || null,
          sold: item._sum.quantity,
          revenue: item._sum.total,
        }
      })
    )

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        user: {
          select: { name: true, email: true },
        },
        items: { select: { id: true } },
      },
    })

    // Pending reviews
    const pendingReviews = await prisma.review.count({
      where: { isApproved: false },
    })

    return successResponse({
      overview: {
        totalRevenue,
        revenueChange: Math.round(revenueChange * 100) / 100,
        totalOrders,
        ordersChange: Math.round(ordersChange * 100) / 100,
        totalCustomers,
        newCustomers,
        totalProducts,
        lowStockProducts,
      },
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>),
      topProducts: topProductsWithDetails,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt,
        customerName: order.user.name || 'Unknown',
        customerEmail: order.user.email,
        itemCount: order.items.length,
      })),
      pendingReviews,
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
