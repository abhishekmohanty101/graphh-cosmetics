import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/admin/dashboard/trends - Get trends analysis
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Trending products (most ordered in last 30 days)
    const orderItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: ['CANCELLED'] },
        },
      },
      _sum: { quantity: true, total: true },
      _count: true,
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    })

    const trendingProductIds = orderItems.map((item) => item.productId)
    const trendingProducts = await prisma.product.findMany({
      where: { id: { in: trendingProductIds } },
      select: { id: true, name: true, slug: true, images: true, price: true },
    })

    const trendingProductsWithStats = orderItems.map((item) => {
      const product = trendingProducts.find((p) => p.id === item.productId)
      return {
        product,
        soldQuantity: item._sum.quantity || 0,
        revenue: item._sum.total || 0,
        orders: item._count,
      }
    })

    // Customer growth trend
    const newCustomersThisMonth = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    const newCustomersLastMonth = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    })

    const customerGrowth = newCustomersLastMonth > 0
      ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100
      : 0

    // Order status distribution
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    })

    // Peak hours (most orders)
    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    })

    const ordersByHour: Record<number, number> = {}
    recentOrders.forEach((order) => {
      const hour = order.createdAt.getHours()
      ordersByHour[hour] = (ordersByHour[hour] || 0) + 1
    })

    const peakHours = Object.entries(ordersByHour)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        label: `${hour}:00 - ${parseInt(hour) + 1}:00`,
        orders: count,
      }))

    // Review sentiment (if we had sentiment analysis)
    const recentReviews = await prisma.review.groupBy({
      by: ['rating'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    })

    const avgRating = recentReviews.length > 0
      ? recentReviews.reduce((sum, r) => sum + r.rating * r._count, 0) / 
        recentReviews.reduce((sum, r) => sum + r._count, 0)
      : 0

    return successResponse({
      trendingProducts: trendingProductsWithStats,
      customerGrowth: {
        thisMonth: newCustomersThisMonth,
        lastMonth: newCustomersLastMonth,
        change: Math.round(customerGrowth * 10) / 10,
      },
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      peakHours,
      reviewSentiment: {
        avgRating: Math.round(avgRating * 10) / 10,
        distribution: recentReviews.map((r) => ({
          rating: r.rating,
          count: r._count,
        })),
      },
    })
  } catch (error) {
    console.error('Get trends error:', error)
    return errorResponse('Failed to fetch trends', 500)
  }
}
