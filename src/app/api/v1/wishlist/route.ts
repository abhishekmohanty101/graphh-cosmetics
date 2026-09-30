import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api'
import { z } from 'zod'

const addToWishlistSchema = z.object({
  productId: z.string().min(1),
})

// GET /api/v1/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                price: true,
                comparePrice: true,
                images: true,
                inventory: true,
                avgRating: true,
                reviewCount: true,
                isNew: true,
                isFeatured: true,
                category: {
                  select: { slug: true, name: true },
                },
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    })

    if (!wishlist) {
      return successResponse({ items: [] })
    }

    const items = wishlist.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      price: item.product.price,
      comparePrice: item.product.comparePrice,
      image: item.product.images[0] || null,
      rating: item.product.avgRating,
      reviewCount: item.product.reviewCount,
      inStock: item.product.inventory > 0,
      isNew: item.product.isNew,
      isBestseller: item.product.isFeatured,
      category: item.product.category?.name || null,
      addedAt: item.addedAt,
    }))

    return successResponse({ items })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// POST /api/v1/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const result = addToWishlistSchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Invalid request data', 400)
    }

    const { productId } = result.data

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { id: true },
    })

    if (!product) {
      return errorResponse('Product not found', 404)
    }

    // Get or create wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
    })

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: session.user.id },
      })
    }

    // Check if item already in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    })

    if (existingItem) {
      return successResponse({ message: 'Item already in wishlist' })
    }

    // Add item to wishlist
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    })

    return successResponse({ message: 'Item added to wishlist' })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// DELETE /api/v1/wishlist - Clear wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
    })

    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: { wishlistId: wishlist.id },
      })
    }

    return successResponse({ message: 'Wishlist cleared' })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
