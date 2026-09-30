import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
  getPaginationParams,
  createPagination,
} from '@/lib/api'

// GET /api/v1/categories/[slug] - Get category with products
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)

    // Filter params
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const inStock = searchParams.get('inStock')
    const rating = searchParams.get('rating')
    const sortBy = searchParams.get('sortBy') || 'featured'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Get category
    const category = await prisma.category.findUnique({
      where: { slug: params.slug, isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        image: true,
        metaTitle: true,
        metaDescription: true,
      },
    })

    if (!category) {
      return notFoundResponse('Category')
    }

    // Build product where clause
    const productWhere: any = {
      categoryId: category.id,
      isActive: true,
    }

    if (minPrice || maxPrice) {
      productWhere.price = {}
      if (minPrice) productWhere.price.gte = parseFloat(minPrice)
      if (maxPrice) productWhere.price.lte = parseFloat(maxPrice)
    }

    if (inStock === 'true') {
      productWhere.inventory = { gt: 0 }
    }

    if (rating) {
      productWhere.avgRating = { gte: parseFloat(rating) }
    }

    // Build orderBy
    let orderBy: any = { sortOrder: 'asc' }
    if (sortBy === 'price') {
      orderBy = { price: sortOrder }
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' }
    } else if (sortBy === 'rating') {
      orderBy = { avgRating: 'desc' }
    } else if (sortBy === 'featured') {
      orderBy = [{ isFeatured: 'desc' }, { avgRating: 'desc' }]
    }

    // Get total count
    const total = await prisma.product.count({ where: productWhere })

    // Get products
    const products = await prisma.product.findMany({
      where: productWhere,
      orderBy,
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
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            attributes: true,
          },
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
      variants: product.variants,
    }))

    return successResponse(
      {
        category: {
          id: category.id,
          slug: category.slug,
          name: category.name,
          description: category.description,
          image: category.image,
          metaTitle: category.metaTitle,
          metaDescription: category.metaDescription,
        },
        products: transformedProducts,
      },
      createPagination(page, limit, total)
    )
  } catch (error) {
    return serverErrorResponse(error)
  }
}
