import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    const where: any = { isApproved: true }
    if (productId) where.productId = productId

    const reviews = await prisma.review.findMany({
      where,
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return successResponse({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt,
        author: { name: r.user.name || 'Anonymous', image: r.user.avatar },
      })),
    })
  } catch (error) {
    return errorResponse('Failed to fetch reviews', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return unauthorizedResponse()

    const { productId, rating, title, comment, images } = await request.json()

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        title,
        comment,
        images: images || [],
      },
    })

    return successResponse({ review, message: 'Review submitted for approval' })
  } catch (error) {
    return errorResponse('Failed to submit review', 500)
  }
}
