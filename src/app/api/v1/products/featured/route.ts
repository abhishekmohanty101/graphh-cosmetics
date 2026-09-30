import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, serverErrorResponse } from '@/lib/api'

// GET /api/v1/products/featured - Get featured products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(20, parseInt(searchParams.get('limit') || '8'))

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      orderBy: { avgRating: 'desc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        comparePrice: true,
        images: true,
        avgRating: true,
        reviewCount: true,
        inventory: true,
        isFeatured: true,
        isNew: true,
      },
    })

    const transformedProducts = products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images,
      rating: product.avgRating,
      reviewCount: product.reviewCount,
      inStock: product.inventory > 0,
      isBestseller: product.isFeatured,
      isNew: product.isNew,
    }))

    return successResponse(transformedProducts)
  } catch (error) {
    return serverErrorResponse(error)
  }
}
