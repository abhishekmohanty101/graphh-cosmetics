import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  getPaginationParams,
  createPagination,
} from '@/lib/api/response'

// GET /api/v1/support/tickets - Get user's support tickets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const status = searchParams.get('status')

    const where: any = { userId: session.user.id }
    if (status) {
      where.status = status
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          category: true,
          priority: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          order: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ])

    const transformedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      order: ticket.order,
      messageCount: ticket._count.messages,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    }))

    return successResponse(
      { tickets: transformedTickets },
      createPagination(page, limit, total)
    )
  } catch (error) {
    console.error('Get tickets error:', error)
    // If SupportTicket model doesn't exist
    if ((error as any)?.code === 'P2021') {
      return successResponse({ tickets: [] })
    }
    return errorResponse('Failed to fetch tickets', 500)
  }
}

// POST /api/v1/support/tickets - Create a support ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { subject, message, category, priority, orderId } = body

    if (!subject || !message) {
      return errorResponse('Subject and message are required', 400)
    }

    // Generate ticket number
    const ticketCount = await prisma.supportTicket.count()
    const ticketNumber = `TKT-${String(ticketCount + 1).padStart(6, '0')}`

    // Verify order belongs to user if provided
    if (orderId) {
      const order = await prisma.order.findFirst({
        where: { id: orderId, userId: session.user.id },
      })
      if (!order) {
        return errorResponse('Order not found', 404)
      }
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: session.user.id,
        orderId: orderId || null,
        subject,
        category: category || 'GENERAL',
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        messages: {
          create: {
            userId: session.user.id,
            content: message,
            isStaff: false,
          },
        },
      },
      include: {
        messages: true,
        order: {
          select: { id: true, orderNumber: true },
        },
      },
    })

    return successResponse({
      message: 'Support ticket created successfully',
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        order: ticket.order,
        createdAt: ticket.createdAt,
      },
    })
  } catch (error) {
    console.error('Create ticket error:', error)
    // If SupportTicket model doesn't exist
    if ((error as any)?.code === 'P2021') {
      return errorResponse(
        'Support ticket system is not yet configured. Please email support@graphh.com',
        503
      )
    }
    return errorResponse('Failed to create ticket', 500)
  }
}
