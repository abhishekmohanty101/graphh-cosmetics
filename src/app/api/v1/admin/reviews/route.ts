import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, slug: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return successResponse({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isApproved: r.isApproved,
        isVerified: r.isVerified,
        helpful: r.helpful,
        createdAt: r.createdAt,
        user: { id: r.user.id, name: r.user.name || 'Unknown', email: r.user.email },
        product: r.product,
      })),
    })
  } catch (error) {
    return errorResponse('Failed to fetch reviews', 500)
  }
}
