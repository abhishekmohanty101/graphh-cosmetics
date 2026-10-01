import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db'
import { SupportTicket } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'SUPPORT_AGENT', 'EMPLOYEE'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: any = {}

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (priority && priority !== 'all') {
      where.priority = priority
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { messages: true } },
        },
        orderBy: [
          { status: 'asc' }, // OPEN first
          { priority: 'desc' }, // URGENT/HIGH first
          { updatedAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ])

    // Get last message time for each ticket
    const ticketsWithLastReply = await Promise.all(
      tickets.map(async (ticket: SupportTicket & { _count: { messages: number } }) => {
        const lastMessage = await prisma.ticketMessage.findFirst({
          where: { ticketId: ticket.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        })
        return {
          ...ticket,
          lastReply: lastMessage?.createdAt || ticket.createdAt,
          messageCount: ticket._count.messages + 1, // +1 for initial message
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: { tickets: ticketsWithLastReply },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch tickets:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { subject, message, priority, orderId, name, email } = body

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Generate ticket number
    const ticketCount = await prisma.supportTicket.count()
    const ticketNumber = `TKT-${String(ticketCount + 1).padStart(5, '0')}`

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: session.user.id,
        email: email || session.user.email,
        name: name || session.user.name || 'Customer',
        subject,
        message,
        priority: priority || 'MEDIUM',
        orderId: orderId || null,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json({ success: true, data: { ticket } }, { status: 201 })
  } catch (error) {
    console.error('Failed to create ticket:', error)
    return NextResponse.json({ success: false, error: 'Failed to create ticket' }, { status: 500 })
  }
}
