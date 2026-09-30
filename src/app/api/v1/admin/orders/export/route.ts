import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/admin/orders/export - Export orders as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (status) where.status = status
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
        payment: true,
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (format === 'csv') {
      const headers = [
        'Order Number',
        'Date',
        'Customer Name',
        'Email',
        'Phone',
        'Status',
        'Payment Method',
        'Payment Status',
        'Subtotal',
        'Discount',
        'Shipping',
        'Tax',
        'Total',
        'Items',
        'Shipping City',
        'Shipping State',
        'Pincode',
        'Tracking Number',
      ]

      const rows = orders.map((o) => {
        const address = o.shippingAddress as any
        return [
          o.orderNumber,
          o.createdAt.toISOString(),
          `"${o.user?.name || 'Guest'}"`,
          o.user?.email || '',
          o.user?.phone || '',
          o.status,
          o.paymentMethod,
          o.payment?.status || 'PENDING',
          o.subtotal,
          o.discount,
          o.shipping,
          o.tax,
          o.total,
          o.items.length,
          address?.city || '',
          address?.state || '',
          address?.pincode || '',
          o.shipment?.trackingNumber || '',
        ]
      })

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="orders-export-${Date.now()}.csv"`,
        },
      })
    }

    // JSON format
    return successResponse({
      orders: orders.map((o) => ({
        orderNumber: o.orderNumber,
        date: o.createdAt,
        customer: o.user,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.payment?.status,
        subtotal: o.subtotal,
        discount: o.discount,
        shipping: o.shipping,
        tax: o.tax,
        total: o.total,
        itemCount: o.items.length,
        shippingAddress: o.shippingAddress,
        trackingNumber: o.shipment?.trackingNumber,
      })),
      total: orders.length,
      exportedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Export orders error:', error)
    return errorResponse('Failed to export orders', 500)
  }
}
