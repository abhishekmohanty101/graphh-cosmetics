import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/api/response'

// GET /api/v1/reviews/[id] - Get user's review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const review = await prisma.review.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    })

    if (!review) {
      return notFoundResponse('Review')
    }

    return successResponse({ review })
  } catch (error) {
    console.error('Get review error:', error)
    return errorResponse('Failed to fetch review', 500)
  }
}

// PATCH /api/v1/reviews/[id] - Update user's review
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { rating, title, comment } = body

    // Find review and ensure user owns it
    const review = await prisma.review.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!review) {
      return notFoundResponse('Review')
    }

    // Validate rating
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return errorResponse('Rating must be between 1 and 5', 400)
    }

    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: {
        ...(rating !== undefined && { rating }),
        ...(title !== undefined && { title }),
        ...(comment !== undefined && { comment }),
        status: 'PENDING', // Reset to pending for re-moderation
      },
    })

    return successResponse({
      review: updatedReview,
      message: 'Review updated successfully. It will be visible after moderation.',
    })
  } catch (error) {
    console.error('Update review error:', error)
    return errorResponse('Failed to update review', 500)
  }
}

// DELETE /api/v1/reviews/[id] - Delete user's review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    // Find review and ensure user owns it
    const review = await prisma.review.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!review) {
      return notFoundResponse('Review')
    }

    await prisma.review.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Delete review error:', error)
    return errorResponse('Failed to delete review', 500)
  }
}
