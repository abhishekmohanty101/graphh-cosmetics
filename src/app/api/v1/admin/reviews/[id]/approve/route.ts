import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

// POST /api/v1/admin/reviews/[id]/approve - Approve or reject review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, reason } = body // status: 'APPROVED' or 'REJECTED'

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return errorResponse('Valid status (APPROVED or REJECTED) is required', 400)
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    if (!review) {
      return notFoundResponse('Review')
    }

    await prisma.review.update({
      where: { id: params.id },
      data: { status },
    })

    // TODO: Send notification to user about review status
    // if (status === 'APPROVED') {
    //   await sendEmail(review.user.email, 'review-approved', { ... })
    // }

    return successResponse({
      message: `Review ${status.toLowerCase()}`,
      review: {
        id: review.id,
        status,
        product: review.product,
        user: review.user,
        rating: review.rating,
      },
    })
  } catch (error) {
    console.error('Approve review error:', error)
    return errorResponse('Failed to update review status', 500)
  }
}
