import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
  serverErrorResponse,
  getPaginationParams,
  createPagination,
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

// GET /api/v1/admin/reviews - List all reviews (admin view)
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const status = searchParams.get('status') // pending, approved, all
    const rating = searchParams.get('rating')
    const productId = searchParams.get('productId')

    const where: any = {}

    if (status === 'pending') {
      where.isApproved = false
    } else if (status === 'approved') {
      where.isApproved = true
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    if (productId) {
      where.productId = productId
    }

    const total = await prisma.review.count({ where })

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    return successResponse(
      {
        reviews: reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          isApproved: r.isApproved,
          isVerifiedPurchase: r.isVerifiedPurchase,
          helpfulCount: r.helpfulCount,
          createdAt: r.createdAt,
          user: {
            id: r.user.id,
            name: `${r.user.firstName} ${r.user.lastName}`,
            email: r.user.email,
          },
          product: r.product,
        })),
      },
      createPagination(page, limit, total)
    )
  } catch (error) {
    return serverErrorResponse(error)
  }
}
