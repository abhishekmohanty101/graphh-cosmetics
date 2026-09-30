import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/admin/dashboard/sales - Get sales analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    const groupBy = searchParams.get('groupBy') || 'day'

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ['CANCELLED'] },
      },
      select: {
        id: true,
        total: true,
        subtotal: true,
        discount: true,
        createdAt: true,
        status: true,
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group by date
    const salesByDate: Record<string, { revenue: number; orders: number; items: number }> = {}
    
    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0]
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { revenue: 0, orders: 0, items: 0 }
      }
      salesByDate[dateKey].revenue += order.total
      salesByDate[dateKey].orders += 1
      salesByDate[dateKey].items += order.items.reduce((sum, i) => sum + i.quantity, 0)
    })

    const chartData = Object.entries(salesByDate).map(([date, data]) => ({
      date,
      ...data,
    }))

    // Calculate totals
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const totalOrders = orders.length
    const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Compare with previous period
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    const previousOrders = await prisma.order.aggregate({
      where: {
        createdAt: { gte: previousStartDate, lt: startDate },
        status: { notIn: ['CANCELLED'] },
      },
      _sum: { total: true },
      _count: true,
    })

    const previousRevenue = previousOrders._sum.total || 0
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    return successResponse({
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      summary: {
        totalRevenue,
        totalOrders,
        totalItems,
        avgOrderValue: Math.round(avgOrderValue),
        revenueChange: Math.round(revenueChange * 10) / 10,
      },
      chartData,
    })
  } catch (error) {
    console.error('Get sales analytics error:', error)
    return errorResponse('Failed to fetch sales data', 500)
  }
}
