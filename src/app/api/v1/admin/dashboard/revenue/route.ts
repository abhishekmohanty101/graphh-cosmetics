import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/admin/dashboard/revenue - Get revenue data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    const now = new Date()
    let startDate: Date
    let previousStartDate: Date

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Current period revenue
    const currentOrders = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ['CANCELLED'] },
      },
      _sum: { total: true, subtotal: true, discount: true, shipping: true, tax: true },
      _count: true,
    })

    // Previous period revenue
    const previousOrders = await prisma.order.aggregate({
      where: {
        createdAt: { gte: previousStartDate, lt: startDate },
        status: { notIn: ['CANCELLED'] },
      },
      _sum: { total: true },
      _count: true,
    })

    // Revenue by payment method
    const byPaymentMethod = await prisma.order.groupBy({
      by: ['paymentMethod'],
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ['CANCELLED'] },
      },
      _sum: { total: true },
      _count: true,
    })

    // Revenue by category (top 5)
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { notIn: ['CANCELLED'] },
        },
      },
      include: {
        product: { include: { category: true } },
      },
    })

    const byCategory: Record<string, number> = {}
    orderItems.forEach((item) => {
      const categoryName = item.product?.category?.name || 'Uncategorized'
      byCategory[categoryName] = (byCategory[categoryName] || 0) + item.total
    })

    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }))

    const currentRevenue = currentOrders._sum.total || 0
    const previousRevenue = previousOrders._sum.total || 0
    const change = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    return successResponse({
      period,
      current: {
        revenue: currentRevenue,
        subtotal: currentOrders._sum.subtotal || 0,
        discount: currentOrders._sum.discount || 0,
        shipping: currentOrders._sum.shipping || 0,
        tax: currentOrders._sum.tax || 0,
        orders: currentOrders._count,
      },
      previous: {
        revenue: previousRevenue,
        orders: previousOrders._count,
      },
      change: Math.round(change * 10) / 10,
      breakdown: {
        byPaymentMethod: byPaymentMethod.map((pm) => ({
          method: pm.paymentMethod || 'Unknown',
          revenue: pm._sum.total || 0,
          orders: pm._count,
        })),
        byCategory: topCategories,
      },
    })
  } catch (error) {
    console.error('Get revenue data error:', error)
    return errorResponse('Failed to fetch revenue data', 500)
  }
}
