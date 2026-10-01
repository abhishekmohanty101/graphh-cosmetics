import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
  getPaginationParams,
  createPagination,
} from '@/lib/api'
import { z } from 'zod'

const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(100).optional(),
  comment: z.string().min(10).max(2000),
})

// GET /api/v1/reviews - Get user's reviews
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      const { searchParams } = new URL(request.url)
      const productId = searchParams.get('productId')

      if (!productId) {
        return errorResponse('Product ID required', 400)
      }

      // Public: get approved reviews for a product
      const { page, limit, skip } = getPaginationParams(searchParams)

      const where = {
        productId,
        isApproved: true,
      }

      const total = await prisma.review.count({ where })

      const reviews = await prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              
              image: true,
            },
          },
        },
      })

      const formattedReviews = reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.createdAt,
        author: {
          name: `${review.user.name} ${review.?.charAt(0) || ''}.`,
          image: review.user.image,
        },
      }))

      return successResponse(
        { reviews: formattedReviews },
        createPagination(page, limit, total)
      )
    }

    // Authenticated: get user's reviews
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)

    const total = await prisma.review.count({
      where: { userId: session.user.id },
    })

    const reviews = await prisma.review.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            images: true,
          },
        },
      },
    })

    return successResponse(
      { reviews },
      createPagination(page, limit, total)
    )
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// POST /api/v1/reviews - Create a review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return errorResponse('You must be logged in to write a review', 401)
    }

    const body = await request.json()
    const result = createReviewSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const { productId, rating, title, comment } = result.data

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return errorResponse('Product not found', 404)
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        productId,
      },
    })

    if (existingReview) {
      return errorResponse('You have already reviewed this product', 400)
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: { in: ['DELIVERED', 'COMPLETED'] },
        },
      },
    })

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        title,
        comment,
        isVerifiedPurchase: !!hasPurchased,
        isApproved: false, // Requires moderation
      },
    })

    return successResponse({
      message: 'Review submitted and pending approval',
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        isVerifiedPurchase: review.isVerifiedPurchase,
      },
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
