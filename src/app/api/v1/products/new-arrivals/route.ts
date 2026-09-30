import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getPaginationParams, createPagination } from '@/lib/api/response'

// GET /api/v1/products/new-arrivals - Get newly added products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const categorySlug = searchParams.get('category')
    
    // Products added in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const where: any = {
      isActive: true,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    }

    if (categorySlug) {
      where.category = { slug: categorySlug }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              inventory: true,
              attributes: true,
              image: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
          reviews: {
            where: { isApproved: true },
            select: { rating: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    // Transform products with rating
    const transformedProducts = products.map((product) => {
      const ratings = product.reviews.map((r) => r.rating)
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        shortDesc: product.shortDesc,
        price: product.price,
        comparePrice: product.comparePrice,
        images: product.images,
        category: product.category,
        hasVariants: product.hasVariants,
        variants: product.variants,
        inventory: product.inventory,
        inStock: product.inventory > 0 || product.variants.some((v) => v.inventory > 0),
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length,
        isNew: true,
        createdAt: product.createdAt,
      }
    })

    return successResponse(
      { products: transformedProducts },
      createPagination(page, limit, total)
    )
  } catch (error) {
    console.error('Get new arrivals error:', error)
    return errorResponse('Failed to fetch new arrivals', 500)
  }
}
