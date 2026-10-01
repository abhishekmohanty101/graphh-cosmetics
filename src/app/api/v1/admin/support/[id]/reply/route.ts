import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { message } = body

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    })

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    // Determine if staff or customer
    const isStaff = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT_AGENT', 'EMPLOYEE'].includes(session.user.role)

    // If customer, only allow replying to their own tickets
    if (!isStaff && ticket.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Create the message
    const ticketMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: params.id,
        message,
        isStaff,
        staffId: isStaff ? session.user.id : null,
        staffName: isStaff ? session.user.name : null,
      },
    })

    // Update ticket status if staff replied and it was waiting
    if (isStaff && ticket.status === 'OPEN') {
      await prisma.supportTicket.update({
        where: { id: params.id },
        data: { status: 'IN_PROGRESS' },
      })
    } else if (!isStaff && ticket.status === 'IN_PROGRESS') {
      await prisma.supportTicket.update({
        where: { id: params.id },
        data: { status: 'WAITING_CUSTOMER' },
      })
    }

    return NextResponse.json({ success: true, data: { message: ticketMessage } }, { status: 201 })
  } catch (error) {
    console.error('Failed to add reply:', error)
    return NextResponse.json({ success: false, error: 'Failed to add reply' }, { status: 500 })
  }
}
