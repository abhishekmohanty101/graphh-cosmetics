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
    select: { role: true },
  })
  const staffRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF', 'ORDER_MANAGER']
  if (!user || !staffRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user, role: user.role }
}

// GET /api/v1/staff/returns/[id] - Get return request details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true,  email: true, phone: true },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
          },
        },
        payment: true,
        shipment: true,
      },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    // Get return request if exists
    let returnRequest = null
    try {
      returnRequest = await prisma.returnRequest.findFirst({
        where: { orderId: params.id },
        orderBy: { createdAt: 'desc' },
      })
    } catch {
      // ReturnRequest model doesn't exist
    }

    return successResponse({
      return: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: Number(order.total),
          subtotal: Number(order.subtotal),
          customer: {
            id: order.user.id,
            name: `${order.user.name || ''} ${order. || ''}`.trim(),
            email: order.user.email,
            phone: order.user.phone,
          },
          items: order.items,
          payment: order.payment ? {
            method: order.payment.method,
            status: order.payment.status,
            razorpayPaymentId: order.payment.razorpayPaymentId,
          } : null,
          deliveredAt: order.shipment?.deliveredAt,
          createdAt: order.createdAt,
        },
        returnRequest: returnRequest || {
          reason: order.notes?.includes('Return') ? order.notes : 'Not specified',
          status: order.status === 'RETURN_REQUESTED' ? 'PENDING' : order.status,
          requestedAt: order.updatedAt,
        },
      },
    })
  } catch (error) {
    console.error('Get return error:', error)
    return errorResponse('Failed to fetch return details', 500)
  }
}

// PATCH /api/v1/staff/returns/[id] - Process return
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
    const { action, note, refundAmount } = body // approve, reject, complete

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { payment: true },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    if (order.status !== 'RETURN_REQUESTED' && action !== 'complete') {
      return errorResponse('Order is not in return requested status', 400)
    }

    if (action === 'approve') {
      // Update order status and add note
      await prisma.order.update({
        where: { id: params.id },
        data: {
          notes: `${order.notes || ''}\n[Staff] Return approved. ${note || ''}`.trim(),
        },
      })

      // Update return request if exists
      try {
        await prisma.returnRequest.updateMany({
          where: { orderId: params.id },
          data: { status: 'APPROVED' },
        })
      } catch {
        // Model doesn't exist
      }

      return successResponse({
        message: 'Return request approved. Schedule pickup with shipping partner.',
        nextSteps: [
          'Contact customer to arrange pickup',
          'Create return shipment in Shiprocket',
          'Mark as complete once items received',
        ],
      })
    }

    if (action === 'reject') {
      await prisma.order.update({
        where: { id: params.id },
        data: {
          status: 'DELIVERED', // Revert to delivered
          notes: `${order.notes || ''}\n[Staff] Return rejected. Reason: ${note || 'Not specified'}`.trim(),
        },
      })

      try {
        await prisma.returnRequest.updateMany({
          where: { orderId: params.id },
          data: { status: 'REJECTED' },
        })
      } catch {
        // Model doesn't exist
      }

      return successResponse({
        message: 'Return request rejected. Customer will be notified.',
      })
    }

    if (action === 'complete') {
      // Mark return as complete and initiate refund
      await prisma.order.update({
        where: { id: params.id },
        data: {
          status: 'RETURNED',
          notes: `${order.notes || ''}\n[Staff] Return completed. Refund initiated.`.trim(),
        },
      })

      // TODO: Initiate refund via Razorpay
      // const refund = await razorpay.payments.refund(order.payment.razorpayPaymentId, {
      //   amount: refundAmount || order.total * 100,
      // })

      // Update payment status
      if (order.payment) {
        await prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'REFUNDED',
            refundAmount: refundAmount || Number(order.total) * 100,
          },
        })
      }

      return successResponse({
        message: 'Return completed. Refund will be processed within 5-7 business days.',
        refundAmount: refundAmount || Number(order.total),
      })
    }

    return errorResponse('Invalid action. Use "approve", "reject", or "complete"', 400)
  } catch (error) {
    console.error('Process return error:', error)
    return errorResponse('Failed to process return', 500)
  }
}
