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

// GET /api/v1/admin/customers/[id] - Get customer details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
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
        isVerified: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
            items: { select: { quantity: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            title: true,
            isApproved: true,
            createdAt: true,
            product: { select: { name: true, slug: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { orders: true, reviews: true, wishlist: true },
        },
      },
    })

    if (!customer) {
      return notFoundResponse('Customer')
    }

    // Calculate customer stats
    const allOrders = await prisma.order.findMany({
      where: { userId: params.id, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
      select: { total: true },
    })

    const totalSpent = allOrders.reduce((sum, o) => sum + Number(o.total), 0)
    const avgOrderValue = allOrders.length > 0 ? totalSpent / allOrders.length : 0

    return successResponse({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        avatar: customer.avatar,
        isVerified: customer.isVerified,
        isBlocked: customer.isBlocked,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        addresses: customer.addresses,
        recentOrders: customer.orders.map((o) => ({
          ...o,
          itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
        })),
        recentReviews: customer.reviews,
        stats: {
          totalOrders: customer._count.orders,
          totalReviews: customer._count.reviews,
          wishlistItems: customer._count.wishlist,
          totalSpent,
          avgOrderValue: Math.round(avgOrderValue),
        },
      },
    })
  } catch (error) {
    console.error('Get customer error:', error)
    return errorResponse('Failed to fetch customer', 500)
  }
}

// PATCH /api/v1/admin/customers/[id] - Update customer
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const body = await request.json()
    const { isBlocked } = body

    const customer = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!customer) {
      return notFoundResponse('Customer')
    }

    // Update customer
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        isBlocked: isBlocked !== undefined ? isBlocked : customer.isBlocked,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBlocked: true,
      },
    })

    return successResponse({
      message: 'Customer updated successfully',
      customer: updated,
    })
  } catch (error) {
    console.error('Update customer error:', error)
    return errorResponse('Failed to update customer', 500)
  }
}
