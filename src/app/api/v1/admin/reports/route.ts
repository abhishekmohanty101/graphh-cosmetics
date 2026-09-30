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

async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER']
  if (!user || !adminRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user }
}

// GET /api/v1/admin/reports - Get various reports
export async function GET(request: NextRequest) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'sales'
    const period = searchParams.get('period') || '30d'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    let dateFrom: Date
    let dateTo = new Date()

    if (startDate && endDate) {
      dateFrom = new Date(startDate)
      dateTo = new Date(endDate)
    } else {
      dateFrom = new Date()
      switch (period) {
        case '7d':
          dateFrom.setDate(dateFrom.getDate() - 7)
          break
        case '30d':
          dateFrom.setDate(dateFrom.getDate() - 30)
          break
        case '90d':
          dateFrom.setDate(dateFrom.getDate() - 90)
          break
        case '1y':
          dateFrom.setFullYear(dateFrom.getFullYear() - 1)
          break
        default:
          dateFrom.setDate(dateFrom.getDate() - 30)
      }
    }

    switch (type) {
      case 'sales':
        return await getSalesReport(dateFrom, dateTo)
      case 'products':
        return await getProductsReport(dateFrom, dateTo)
      case 'customers':
        return await getCustomersReport(dateFrom, dateTo)
      case 'inventory':
        return await getInventoryReport()
      default:
        return errorResponse('Invalid report type', 400)
    }
  } catch (error) {
    console.error('Get report error:', error)
    return errorResponse('Failed to generate report', 500)
  }
}

async function getSalesReport(dateFrom: Date, dateTo: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: dateFrom, lte: dateTo },
      status: { notIn: ['CANCELLED', 'REFUNDED'] },
    },
    select: {
      id: true,
      total: true,
      discount: true,
      shipping: true,
      status: true,
      createdAt: true,
      payment: { select: { method: true } },
    },
  })

  // Group by date
  const salesByDate: Record<string, { orders: number; revenue: number }> = {}
  orders.forEach((order) => {
    const date = order.createdAt.toISOString().split('T')[0]
    if (!salesByDate[date]) {
      salesByDate[date] = { orders: 0, revenue: 0 }
    }
    salesByDate[date].orders++
    salesByDate[date].revenue += Number(order.total)
  })

  // Group by payment method
  const paymentMethods: Record<string, number> = {}
  orders.forEach((order) => {
    const method = order.payment?.method || 'unknown'
    paymentMethods[method] = (paymentMethods[method] || 0) + 1
  })

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalDiscount = orders.reduce((sum, o) => sum + Number(o.discount), 0)
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  return successResponse({
    report: {
      type: 'sales',
      period: { from: dateFrom, to: dateTo },
      summary: {
        totalOrders: orders.length,
        totalRevenue,
        totalDiscount,
        avgOrderValue: Math.round(avgOrderValue),
      },
      chartData: Object.entries(salesByDate).map(([date, data]) => ({
        date,
        ...data,
      })),
      paymentMethods,
    },
  })
}

async function getProductsReport(dateFrom: Date, dateTo: Date) {
  // Get top selling products
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: { gte: dateFrom, lte: dateTo },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
    },
    select: {
      productId: true,
      quantity: true,
      total: true,
      product: {
        select: { name: true, slug: true, images: true },
      },
    },
  })

  // Aggregate by product
  const productStats: Record<string, { 
    id: string
    name: string
    slug: string
    image: string
    quantity: number
    revenue: number
  }> = {}

  orderItems.forEach((item) => {
    if (!productStats[item.productId]) {
      productStats[item.productId] = {
        id: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        image: item.product.images[0] || '',
        quantity: 0,
        revenue: 0,
      }
    }
    productStats[item.productId].quantity += item.quantity
    productStats[item.productId].revenue += Number(item.total)
  })

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20)

  return successResponse({
    report: {
      type: 'products',
      period: { from: dateFrom, to: dateTo },
      topProducts,
      totalProductsSold: orderItems.reduce((sum, i) => sum + i.quantity, 0),
    },
  })
}

async function getCustomersReport(dateFrom: Date, dateTo: Date) {
  // New customers
  const newCustomers = await prisma.user.count({
    where: {
      role: 'CUSTOMER',
      createdAt: { gte: dateFrom, lte: dateTo },
    },
  })

  // Repeat customers (more than 1 order)
  const repeatCustomers = await prisma.user.count({
    where: {
      role: 'CUSTOMER',
      orders: { some: {} },
      AND: [
        {
          orders: {
            every: {
              createdAt: { gte: dateFrom, lte: dateTo },
            },
          },
        },
      ],
    },
  })

  // Top customers by spend
  const topCustomers = await prisma.user.findMany({
    where: {
      role: 'CUSTOMER',
      orders: {
        some: {
          createdAt: { gte: dateFrom, lte: dateTo },
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      orders: {
        where: {
          createdAt: { gte: dateFrom, lte: dateTo },
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
        select: { total: true },
      },
    },
    take: 20,
  })

  const topCustomersWithSpend = topCustomers
    .map((c) => ({
      id: c.id,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
      email: c.email,
      orders: c.orders.length,
      totalSpent: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)

  return successResponse({
    report: {
      type: 'customers',
      period: { from: dateFrom, to: dateTo },
      summary: {
        newCustomers,
        repeatCustomers,
      },
      topCustomers: topCustomersWithSpend,
    },
  })
}

async function getInventoryReport() {
  // Products by stock status
  const [outOfStock, lowStock, inStock, totalProducts] = await Promise.all([
    prisma.product.count({ where: { isActive: true, inventory: 0 } }),
    prisma.product.count({
      where: {
        isActive: true,
        inventory: { gt: 0, lte: prisma.product.fields.lowStockAlert },
      },
    }),
    prisma.product.count({ where: { isActive: true, inventory: { gt: 10 } } }),
    prisma.product.count({ where: { isActive: true } }),
  ])

  // Low stock products
  const lowStockProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { inventory: { lte: 10 } },
        { variants: { some: { inventory: { lte: 5 } } } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      inventory: true,
      lowStockAlert: true,
      images: true,
      variants: {
        where: { inventory: { lte: 5 } },
        select: { id: true, name: true, sku: true, inventory: true },
      },
    },
    orderBy: { inventory: 'asc' },
    take: 50,
  })

  // Calculate total inventory value (rough estimate)
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { inventory: true, costPrice: true, price: true },
  })
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.inventory * Number(p.costPrice || p.price),
    0
  )

  return successResponse({
    report: {
      type: 'inventory',
      summary: {
        totalProducts,
        outOfStock,
        lowStock,
        inStock,
        totalInventoryValue: Math.round(totalInventoryValue),
      },
      lowStockProducts,
    },
  })
}
