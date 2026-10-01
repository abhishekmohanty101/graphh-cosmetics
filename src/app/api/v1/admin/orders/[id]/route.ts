import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true, payment: true, shipment: true, user: { select: { id: true, name: true, email: true, phone: true } } },
    })
    if (!order) return notFoundResponse('Order')
    return successResponse({ order })
  } catch (error) {
    return errorResponse('Failed to fetch order', 500)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    })
    return successResponse({ order, message: 'Order updated' })
  } catch (error) {
    return errorResponse('Failed to update order', 500)
  }
}
