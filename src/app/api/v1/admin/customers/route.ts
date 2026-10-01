import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  getPaginationParams,
  createPagination,
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

// GET /api/v1/admin/customers - List all customers
export async function GET(request: NextRequest) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'

    const where: any = {
      role: 'CUSTOMER',
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      case 'orders':
        orderBy = { orders: { _count: 'desc' } }
        break
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          
          phone: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
          orders: {
            select: { total: true },
            where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    const transformedCustomers = customers.map((customer) => ({
      id: customer.id,
      email: customer.email,
      name: customer.name || 'N/A',
      phone: customer.phone,
      avatar: customer.avatar,
      isVerified: customer.isVerified,
      orderCount: customer._count.orders,
      totalSpent: customer.orders.reduce((sum, o) => sum + Number(o.total), 0),
      createdAt: customer.createdAt,
    }))

    return successResponse(
      { customers: transformedCustomers },
      createPagination(page, limit, total)
    )
  } catch (error) {
    console.error('Get customers error:', error)
    return errorResponse('Failed to fetch customers', 500)
  }
}
