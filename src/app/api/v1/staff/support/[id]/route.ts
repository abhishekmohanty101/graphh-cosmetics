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
    select: { role: true, firstName: true, lastName: true },
  })
  const staffRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF', 'SUPPORT_AGENT']
  if (!user || !staffRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user, staffName: `${user.firstName || ''} ${user.lastName || ''}`.trim() }
}

// GET /api/v1/staff/support/[id] - Get ticket details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    try {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: params.id },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              total: true,
              createdAt: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: {
                select: { firstName: true, lastName: true, avatar: true },
              },
            },
          },
        },
      })

      if (!ticket) {
        return notFoundResponse('Ticket')
      }

      return successResponse({
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status,
          customer: {
            id: ticket.user.id,
            name: `${ticket.user.firstName || ''} ${ticket.user.lastName || ''}`.trim(),
            email: ticket.user.email,
            phone: ticket.user.phone,
          },
          order: ticket.order,
          messages: ticket.messages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            isStaff: msg.isStaff,
            sender: msg.isStaff
              ? `${msg.user.firstName || ''} ${msg.user.lastName || ''}`.trim() || 'Support Agent'
              : 'Customer',
            avatar: msg.user.avatar,
            createdAt: msg.createdAt,
          })),
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
        },
      })
    } catch {
      return notFoundResponse('Ticket')
    }
  } catch (error) {
    console.error('Get ticket error:', error)
    return errorResponse('Failed to fetch ticket', 500)
  }
}

// POST /api/v1/staff/support/[id] - Reply to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const body = await request.json()
    const { message } = body

    if (!message) {
      return errorResponse('Message is required', 400)
    }

    try {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: params.id },
      })

      if (!ticket) {
        return notFoundResponse('Ticket')
      }

      // Add staff message
      const newMessage = await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          userId: access.user.id,
          content: message,
          isStaff: true,
        },
      })

      // Update ticket status
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: 'WAITING_CUSTOMER',
          updatedAt: new Date(),
        },
      })

      return successResponse({
        message: {
          id: newMessage.id,
          content: newMessage.content,
          isStaff: true,
          sender: access.staffName || 'Support Agent',
          createdAt: newMessage.createdAt,
        },
      })
    } catch {
      return errorResponse('Support system not configured', 503)
    }
  } catch (error) {
    console.error('Reply to ticket error:', error)
    return errorResponse('Failed to send reply', 500)
  }
}

// PATCH /api/v1/staff/support/[id] - Update ticket status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const body = await request.json()
    const { status, priority } = body

    try {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: params.id },
      })

      if (!ticket) {
        return notFoundResponse('Ticket')
      }

      const updates: any = {}
      if (status) {
        const validStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'CLOSED']
        if (!validStatuses.includes(status)) {
          return errorResponse('Invalid status', 400)
        }
        updates.status = status
      }
      if (priority) {
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
        if (!validPriorities.includes(priority)) {
          return errorResponse('Invalid priority', 400)
        }
        updates.priority = priority
      }

      await prisma.supportTicket.update({
        where: { id: params.id },
        data: updates,
      })

      return successResponse({
        message: 'Ticket updated successfully',
        status: status || ticket.status,
        priority: priority || ticket.priority,
      })
    } catch {
      return notFoundResponse('Ticket')
    }
  } catch (error) {
    console.error('Update ticket error:', error)
    return errorResponse('Failed to update ticket', 500)
  }
}
