import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  getPaginationParams,
  createPagination,
} from '@/lib/api/response'

// GET /api/v1/collections/[slug] - Get collection with products
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const sort = searchParams.get('sort') || 'newest'

    const collection = await prisma.collection.findUnique({
      where: { slug: params.slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        metaTitle: true,
        metaDesc: true,
      },
    })

    if (!collection) {
      return notFoundResponse('Collection')
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'name_asc':
        orderBy = { name: 'asc' }
        break
      case 'popular':
        orderBy = { soldCount: 'desc' }
        break
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          collections: {
            some: { id: collection.id },
          },
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: {
          isActive: true,
          collections: { some: { id: collection.id } },
        },
      }),
    ])

    // Transform products
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
        inStock: product.inventory > 0 || product.variants.some((v) => v.inventory > 0),
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length,
      }
    })

    return successResponse(
      {
        collection,
        products: transformedProducts,
      },
      createPagination(page, limit, total)
    )
  } catch (error) {
    console.error('Get collection error:', error)
    // If Collection model doesn't exist
    if ((error as any)?.code === 'P2021') {
      return notFoundResponse('Collection')
    }
    return errorResponse('Failed to fetch collection', 500)
  }
}
