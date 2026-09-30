import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api'

async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER']
  if (!user || !adminRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }

  return { user: session.user }
}

// GET /api/v1/admin/reviews/[id] - Get review details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    if (!review) {
      return notFoundResponse('Review')
    }

    return successResponse({ review })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// PATCH /api/v1/admin/reviews/[id] - Approve or reject review
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      select: { id: true, productId: true },
    })

    if (!review) {
      return notFoundResponse('Review')
    }

    const body = await request.json()
    const { action } = body // 'approve' or 'reject'

    if (action === 'approve') {
      await prisma.review.update({
        where: { id: params.id },
        data: { isApproved: true },
      })

      // Recalculate product rating
      const stats = await prisma.review.aggregate({
        where: { productId: review.productId, isApproved: true },
        _avg: { rating: true },
        _count: true,
      })

      await prisma.product.update({
        where: { id: review.productId },
        data: {
          avgRating: stats._avg.rating || 0,
          reviewCount: stats._count,
        },
      })

      return successResponse({ message: 'Review approved' })
    } else if (action === 'reject') {
      await prisma.review.delete({
        where: { id: params.id },
      })

      return successResponse({ message: 'Review rejected and deleted' })
    }

    return errorResponse('Invalid action', 400)
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// DELETE /api/v1/admin/reviews/[id] - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      select: { id: true, productId: true },
    })

    if (!review) {
      return notFoundResponse('Review')
    }

    await prisma.review.delete({
      where: { id: params.id },
    })

    // Recalculate product rating
    const stats = await prisma.review.aggregate({
      where: { productId: review.productId, isApproved: true },
      _avg: { rating: true },
      _count: true,
    })

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        avgRating: stats._avg.rating || 0,
        reviewCount: stats._count,
      },
    })

    return successResponse({ message: 'Review deleted' })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
