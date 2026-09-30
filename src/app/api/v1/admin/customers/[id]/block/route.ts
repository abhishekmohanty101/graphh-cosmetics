import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

// POST /api/v1/admin/customers/[id]/block - Block/unblock customer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { blocked, reason } = body

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return notFoundResponse('Customer')
    }

    if (user.role !== 'CUSTOMER') {
      return errorResponse('Can only block customer accounts', 400)
    }

    await prisma.user.update({
      where: { id: params.id },
      data: {
        isActive: !blocked,
        metadata: {
          ...(user.metadata as any || {}),
          ...(blocked ? {
            blockedAt: new Date().toISOString(),
            blockReason: reason || 'No reason provided',
          } : {
            unblockedAt: new Date().toISOString(),
          }),
        },
      },
    })

    return successResponse({
      message: blocked ? 'Customer blocked successfully' : 'Customer unblocked successfully',
      customerId: user.id,
      isActive: !blocked,
    })
  } catch (error) {
    console.error('Block customer error:', error)
    return errorResponse('Failed to update customer status', 500)
  }
}
