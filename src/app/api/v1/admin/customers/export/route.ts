import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/admin/customers/export - Export customers as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { role: 'CUSTOMER' }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isBlocked: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
        orders: {
          select: { total: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const customersWithStats = customers.map((c) => ({
      ...c,
      ordersCount: c._count.orders,
      totalSpent: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
    }))

    if (format === 'csv') {
      const headers = [
        'ID',
        'Name',
        'Email',
        'Phone',
        'Active',
        'Email Verified',
        'Phone Verified',
        'Orders Count',
        'Total Spent',
        'Registered At',
      ]

      const rows = customersWithStats.map((c) => [
        c.id,
        `"${c.name || ''}"`,
        c.email,
        c.phone || '',
        c.isBlocked ? 'Blocked' : 'Active',
        c.isVerified ? 'Yes' : 'No',
        c.ordersCount,
        c.totalSpent,
        c.createdAt.toISOString(),
      ])

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="customers-export-${Date.now()}.csv"`,
        },
      })
    }

    // JSON format
    return successResponse({
      customers: customersWithStats.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        isBlocked: c.isBlocked,
        isVerified: c.isVerified,
        ordersCount: c.ordersCount,
        totalSpent: c.totalSpent,
        createdAt: c.createdAt,
      })),
      total: customersWithStats.length,
      exportedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Export customers error:', error)
    return errorResponse('Failed to export customers', 500)
  }
}
