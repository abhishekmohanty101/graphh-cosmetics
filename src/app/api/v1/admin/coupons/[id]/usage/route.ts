import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

// GET /api/v1/admin/coupons/[id]/usage - Get coupon usage statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    })

    if (!coupon) {
      return notFoundResponse('Coupon')
    }

    // Get orders that used this coupon
    const orders = await prisma.order.findMany({
      where: { couponId: params.id },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        discount: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Calculate statistics
    const totalUsage = orders.length
    const totalDiscount = orders.reduce((sum, o) => sum + Number(o.discount), 0)
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
    const avgDiscount = totalUsage > 0 ? totalDiscount / totalUsage : 0
    const avgOrderValue = totalUsage > 0 ? totalRevenue / totalUsage : 0

    // Usage by day
    const usageByDay: Record<string, { count: number; discount: number }> = {}
    orders.forEach((order) => {
      const day = order.createdAt.toISOString().split('T')[0]
      if (!usageByDay[day]) {
        usageByDay[day] = { count: 0, discount: 0 }
      }
      usageByDay[day].count += 1
      usageByDay[day].discount += Number(order.discount)
    })

    // Unique users
    const uniqueUsers = Array.from(new Set(orders.map((o) => o.user.id))).length

    return successResponse({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        usageLimit: coupon.usageLimit,
        usageCount: coupon.usageCount,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
      },
      statistics: {
        totalUsage,
        uniqueUsers,
        totalDiscount,
        totalRevenue,
        avgDiscount: Math.round(avgDiscount),
        avgOrderValue: Math.round(avgOrderValue),
        remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.usageCount : null,
      },
      usageByDay: Object.entries(usageByDay).map(([date, data]) => ({
        date,
        ...data,
      })),
      recentOrders: orders.slice(0, 10).map((o) => ({
        orderId: o.id,
        orderNumber: o.orderNumber,
        customer: o.user.name,
        discount: o.discount,
        total: o.total,
        date: o.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get coupon usage error:', error)
    return errorResponse('Failed to fetch coupon usage', 500)
  }
}
