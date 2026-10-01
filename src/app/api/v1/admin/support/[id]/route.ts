import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    // If customer, only allow viewing their own tickets
    if (session.user.role === 'CUSTOMER' && ticket.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Fetch order details if orderId exists
    let order = null
    if (ticket.orderId) {
      order = await prisma.order.findUnique({
        where: { id: ticket.orderId },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: { ticket, order },
    })
  } catch (error) {
    console.error('Failed to fetch ticket:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch ticket' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'SUPPORT_AGENT', 'EMPLOYEE'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, priority, assignedTo } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo

    const ticket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })

    return NextResponse.json({ success: true, data: { ticket } })
  } catch (error) {
    console.error('Failed to update ticket:', error)
    return NextResponse.json({ success: false, error: 'Failed to update ticket' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.supportTicket.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true, message: 'Ticket deleted' })
  } catch (error) {
    console.error('Failed to delete ticket:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete ticket' }, { status: 500 })
  }
}
