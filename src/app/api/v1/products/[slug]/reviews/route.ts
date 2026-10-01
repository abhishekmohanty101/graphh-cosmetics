import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    })

    if (!product) return errorResponse('Product not found', 404)

    const reviews = await prisma.review.findMany({
      where: { productId: product.id, isApproved: true },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const ratings = reviews.map((r) => r.rating)
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

    return successResponse({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        images: r.images,
        isVerified: r.isVerified,
        helpful: r.helpful,
        createdAt: r.createdAt,
        author: { name: r.user.name || 'Anonymous', image: r.user.avatar },
      })),
      summary: { avgRating, totalReviews: reviews.length },
    })
  } catch (error) {
    return errorResponse('Failed to fetch reviews', 500)
  }
}
