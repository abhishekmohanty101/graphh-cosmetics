import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  getPaginationParams,
  createPagination,
} from '@/lib/api'

// GET /api/v1/products - List all products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)

    // Filter params
    const categorySlug = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const inStock = searchParams.get('inStock')
    const featured = searchParams.get('featured')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (categorySlug) {
      where.category = { slug: categorySlug }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (inStock === 'true') {
      where.inventory = { gt: 0 }
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === 'price') {
      orderBy.price = sortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'rating') {
      orderBy.avgRating = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Get total count
    const total = await prisma.product.count({ where })

    // Get products
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        name: true,
        shortDescription: true,
        price: true,
        comparePrice: true,
        images: true,
        avgRating: true,
        reviewCount: true,
        inventory: true,
        isFeatured: true,
        isNew: true,
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
            price: true,
            inventory: true,
            attributes: true,
          },
        },
      },
    })

    // Transform for frontend
    const transformedProducts = products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortDesc: product.shortDescription,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images,
      rating: product.avgRating,
      reviewCount: product.reviewCount,
      inStock: product.inventory > 0,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isBestseller: product.isFeatured, // Can add separate field
      category: product.category,
      variants: product.variants,
    }))

    return successResponse(transformedProducts, createPagination(page, limit, total))
  } catch (error) {
    return serverErrorResponse(error)
  }
}
