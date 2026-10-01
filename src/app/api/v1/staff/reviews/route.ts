import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  getPaginationParams,
  createPagination,
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

// GET /api/v1/staff/reviews - List reviews for moderation
export async function GET(request: NextRequest) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const status = searchParams.get('status') // pending, approved, rejected

    const where: any = {}
    if (status === 'pending') {
      where.isApproved = false
    } else if (status === 'approved') {
      where.isApproved = true
    }

    const [reviews, total, pendingCount] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: { name: true,  email: true },
          },
          product: {
            select: { id: true, name: true, slug: true, images: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.count({ where: { isApproved: false } }),
    ])

    const transformedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: review.images,
      isVerified: review.isVerified,
      isApproved: review.isApproved,
      user: {
        name: `${review.user.name || ''} ${review. || ''}`.trim() || review.user.email,
        email: review.user.email,
      },
      product: {
        id: review.product.id,
        name: review.product.name,
        slug: review.product.slug,
        image: review.product.images[0] || null,
      },
      createdAt: review.createdAt,
    }))

    return successResponse(
      {
        reviews: transformedReviews,
        pendingCount,
      },
      createPagination(page, limit, total)
    )
  } catch (error) {
    console.error('Staff reviews error:', error)
    return errorResponse('Failed to fetch reviews', 500)
  }
}
