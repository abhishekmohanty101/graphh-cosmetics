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
  const staffRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF', 'SUPPORT_AGENT']
  if (!user || !staffRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user, role: user.role }
}

// PATCH /api/v1/staff/reviews/[id] - Approve or reject review
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
    const { action } = body // approve, reject

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return notFoundResponse('Review')
    }

    if (action === 'approve') {
      await prisma.review.update({
        where: { id: params.id },
        data: { isApproved: true },
      })
      return successResponse({ message: 'Review approved' })
    }

    if (action === 'reject') {
      await prisma.review.delete({
        where: { id: params.id },
      })
      return successResponse({ message: 'Review rejected and deleted' })
    }

    return errorResponse('Invalid action. Use "approve" or "reject"', 400)
  } catch (error) {
    console.error('Update review error:', error)
    return errorResponse('Failed to update review', 500)
  }
}
