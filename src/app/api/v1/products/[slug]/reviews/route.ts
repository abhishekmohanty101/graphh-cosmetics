import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
  getPaginationParams,
  createPagination,
} from '@/lib/api'

// GET /api/v1/products/[slug]/reviews - Get reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const sortBy = searchParams.get('sortBy') || 'newest' // newest, helpful, rating-high, rating-low

    // Get product
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { id: true, avgRating: true, reviewCount: true },
    })

    if (!product) {
      return notFoundResponse('Product')
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'helpful') {
      orderBy = { helpfulCount: 'desc' }
    } else if (sortBy === 'rating-high') {
      orderBy = { rating: 'desc' }
    } else if (sortBy === 'rating-low') {
      orderBy = { rating: 'asc' }
    }

    const where = {
      productId: product.id,
      isApproved: true,
    }

    const total = await prisma.review.count({ where })

    const reviews = await prisma.review.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        isVerifiedPurchase: true,
        helpfulCount: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
    })

    // Calculate rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId: product.id,
        isApproved: true,
      },
      _count: true,
    })

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingDistribution.forEach((r) => {
      distribution[r.rating] = r._count
    })

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerifiedPurchase: review.isVerifiedPurchase,
      helpfulCount: review.helpfulCount,
      createdAt: review.createdAt,
      author: {
        name: `${review.user.firstName} ${review.user.lastName?.charAt(0) || ''}.`,
        image: review.user.image,
      },
    }))

    return successResponse(
      {
        summary: {
          avgRating: product.avgRating,
          totalReviews: product.reviewCount,
          ratingDistribution: distribution,
        },
        reviews: formattedReviews,
      },
      createPagination(page, limit, total)
    )
  } catch (error) {
    return serverErrorResponse(error)
  }
}
