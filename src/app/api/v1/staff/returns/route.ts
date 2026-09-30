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

async function checkStaffAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  const staffRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF', 'ORDER_MANAGER', 'SUPPORT_AGENT']
  if (!user || !staffRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user, role: user.role }
}

// GET /api/v1/staff/returns - List return requests
export async function GET(request: NextRequest) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const status = searchParams.get('status')

    // Get orders with RETURN_REQUESTED status
    const where: any = {
      status: status === 'all' ? { in: ['RETURN_REQUESTED', 'RETURNED'] } : 'RETURN_REQUESTED',
    }

    const [returns, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { firstName: true, lastName: true, email: true, phone: true },
          },
          items: {
            select: {
              id: true,
              name: true,
              quantity: true,
              price: true,
              image: true,
            },
          },
          shipment: {
            select: { deliveredAt: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    // Try to get return request details if model exists
    const transformedReturns = await Promise.all(
      returns.map(async (order) => {
        let returnRequest = null
        try {
          returnRequest = await prisma.returnRequest.findFirst({
            where: { orderId: order.id },
            orderBy: { createdAt: 'desc' },
          })
        } catch {
          // ReturnRequest model doesn't exist
        }

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: Number(order.total),
          customer: {
            name: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim(),
            email: order.user.email,
            phone: order.user.phone,
          },
          items: order.items,
          deliveredAt: order.shipment?.deliveredAt,
          returnReason: returnRequest?.reason || (order.notes?.includes('[Return]') ? order.notes : null),
          requestedAt: order.updatedAt,
        }
      })
    )

    return successResponse(
      { returns: transformedReturns },
      createPagination(page, limit, total)
    )
  } catch (error) {
    console.error('Staff returns error:', error)
    return errorResponse('Failed to fetch returns', 500)
  }
}
