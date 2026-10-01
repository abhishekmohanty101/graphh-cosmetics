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
  const staffRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF', 'SUPPORT_AGENT']
  if (!user || !staffRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user, role: user.role }
}

// GET /api/v1/staff/support - List support tickets
export async function GET(request: NextRequest) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (priority) {
      where.priority = priority
    }

    try {
      const [tickets, total, stats] = await Promise.all([
        prisma.supportTicket.findMany({
          where,
          include: {
            user: {
              select: { name: true,  email: true },
            },
            order: {
              select: { orderNumber: true },
            },
            _count: { select: { messages: true } },
          },
          orderBy: [
            { priority: 'desc' },
            { updatedAt: 'desc' },
          ],
          skip,
          take: limit,
        }),
        prisma.supportTicket.count({ where }),
        prisma.supportTicket.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
      ])

      const transformedTickets = tickets.map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        customer: {
          name: `${ticket.user.name || ''} ${ticket. || ''}`.trim() || ticket.user.email,
          email: ticket.user.email,
        },
        orderNumber: ticket.order?.orderNumber || null,
        messageCount: ticket._count.messages,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      }))

      const statusCounts = stats.reduce((acc: any, s) => {
        acc[s.status] = s._count.status
        return acc
      }, {})

      return successResponse(
        {
          tickets: transformedTickets,
          stats: {
            open: statusCounts.OPEN || 0,
            inProgress: statusCounts.IN_PROGRESS || 0,
            waitingCustomer: statusCounts.WAITING_CUSTOMER || 0,
            closed: statusCounts.CLOSED || 0,
          },
        },
        createPagination(page, limit, total)
      )
    } catch {
      // SupportTicket model might not exist
      return successResponse({
        tickets: [],
        stats: { open: 0, inProgress: 0, waitingCustomer: 0, closed: 0 },
      })
    }
  } catch (error) {
    console.error('Staff support error:', error)
    return errorResponse('Failed to fetch tickets', 500)
  }
}
