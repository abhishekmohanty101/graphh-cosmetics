import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const review = await prisma.review.findUnique({ where: { id: params.id } })
    if (!review) return notFoundResponse('Review')
    return successResponse({ review })
  } catch (error) {
    return errorResponse('Failed to fetch review', 500)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { isApproved } = await request.json()
    const review = await prisma.review.update({
      where: { id: params.id },
      data: { isApproved },
    })
    return successResponse({ review, message: 'Review updated' })
  } catch (error) {
    return errorResponse('Failed to update review', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.review.delete({ where: { id: params.id } })
    return successResponse({ message: 'Review deleted' })
  } catch (error) {
    return errorResponse('Failed to delete review', 500)
  }
}
