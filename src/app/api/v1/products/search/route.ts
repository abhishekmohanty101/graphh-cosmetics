import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, serverErrorResponse, getPaginationParams, createPagination } from '@/lib/api'

// GET /api/v1/products/search - Search products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const { page, limit, skip } = getPaginationParams(searchParams)

    if (!query || query.length < 2) {
      return successResponse([], createPagination(page, limit, 0))
    }

    const where = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { shortDescription: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { tags: { has: query.toLowerCase() } },
        { category: { name: { contains: query, mode: 'insensitive' as const } } },
      ],
    }

    const total = await prisma.product.count({ where })

    const products = await prisma.product.findMany({
      where,
      orderBy: { avgRating: 'desc' },
      skip,
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
        category: {
          select: { name: true, slug: true },
        },
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
      category: product.category?.name,
    }))

    return successResponse(transformedProducts, createPagination(page, limit, total))
  } catch (error) {
    return serverErrorResponse(error)
  }
}
