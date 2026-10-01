import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
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
  const staffRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF', 'SUPPORT_AGENT']
  if (!user || !staffRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user, role: user.role }
}

// GET /api/v1/staff/customers/[id] - Get customer details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const customer = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        
        phone: true,
        avatar: true,
        createdAt: true,
        addresses: { orderBy: { isDefault: 'desc' } },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { orders: true } },
      },
    })

    if (!customer) {
      return notFoundResponse('Customer')
    }

    // Calculate total spent
    const allOrders = await prisma.order.findMany({
      where: { userId: params.id, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
      select: { total: true },
    })
    const totalSpent = allOrders.reduce((sum, o) => sum + Number(o.total), 0)

    return successResponse({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name || 'N/A',
        phone: customer.phone,
        avatar: customer.avatar,
        createdAt: customer.createdAt,
        addresses: customer.addresses,
        recentOrders: customer.orders,
        stats: {
          totalOrders: customer._count.orders,
          totalSpent,
        },
      },
    })
  } catch (error) {
    console.error('Get staff customer error:', error)
    return errorResponse('Failed to fetch customer', 500)
  }
}
