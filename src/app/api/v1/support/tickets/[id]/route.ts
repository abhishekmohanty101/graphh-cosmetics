import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/api/response'

// GET /api/v1/support/tickets/[id] - Get ticket details with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                
                avatar: true,
              },
            },
          },
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
        user: {
          select: {
            id: true,
            name: true,
            
            email: true,
          },
        },
      },
    })

    if (!ticket) {
      return notFoundResponse('Ticket')
    }

    // Check if ticket belongs to user
    if (ticket.userId !== session.user.id) {
      return errorResponse('Ticket not found', 404)
    }

    return successResponse({
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        order: ticket.order,
        messages: ticket.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          isStaff: msg.isStaff,
          user: msg.user,
          createdAt: msg.createdAt,
        })),
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
    })
  } catch (error) {
    console.error('Get ticket error:', error)
    if ((error as any)?.code === 'P2021') {
      return notFoundResponse('Ticket')
    }
    return errorResponse('Failed to fetch ticket', 500)
  }
}

// POST /api/v1/support/tickets/[id] - Add message to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { message } = body

    if (!message) {
      return errorResponse('Message is required', 400)
    }

    // Find ticket and verify ownership
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    })

    if (!ticket) {
      return notFoundResponse('Ticket')
    }

    if (ticket.userId !== session.user.id) {
      return errorResponse('Ticket not found', 404)
    }

    // Check if ticket is closed
    if (ticket.status === 'CLOSED') {
      return errorResponse('Cannot reply to a closed ticket', 400)
    }

    // Add message
    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        userId: session.user.id,
        content: message,
        isStaff: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            
            avatar: true,
          },
        },
      },
    })

    // Update ticket status if it was waiting for customer
    if (ticket.status === 'WAITING_CUSTOMER') {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { status: 'OPEN' },
      })
    }

    return successResponse({
      message: {
        id: newMessage.id,
        content: newMessage.content,
        isStaff: newMessage.isStaff,
        user: newMessage.user,
        createdAt: newMessage.createdAt,
      },
    })
  } catch (error) {
    console.error('Add message error:', error)
    if ((error as any)?.code === 'P2021') {
      return errorResponse('Support system not configured', 503)
    }
    return errorResponse('Failed to add message', 500)
  }
}

// PATCH /api/v1/support/tickets/[id] - Close ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { action } = body

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    })

    if (!ticket) {
      return notFoundResponse('Ticket')
    }

    if (ticket.userId !== session.user.id) {
      return errorResponse('Ticket not found', 404)
    }

    if (action === 'close') {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { status: 'CLOSED' },
      })

      return successResponse({
        message: 'Ticket closed successfully',
        status: 'CLOSED',
      })
    }

    if (action === 'reopen') {
      if (ticket.status !== 'CLOSED') {
        return errorResponse('Only closed tickets can be reopened', 400)
      }

      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { status: 'OPEN' },
      })

      return successResponse({
        message: 'Ticket reopened successfully',
        status: 'OPEN',
      })
    }

    return errorResponse('Invalid action', 400)
  } catch (error) {
    console.error('Update ticket error:', error)
    return errorResponse('Failed to update ticket', 500)
  }
}
