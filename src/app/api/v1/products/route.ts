import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getPaginationParams, createPagination } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const categorySlug = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    const where: any = { isActive: true }

    if (categorySlug) {
      where.category = { slug: categorySlug }
    }
    if (featured === 'true') {
      where.isFeatured = true
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    const formattedProducts = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      shortDesc: p.shortDesc,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      images: p.images,
      category: p.category,
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      isBestseller: p.isBestseller,
      inventory: p.inventory,
    }))

    return successResponse({ products: formattedProducts }, createPagination(page, limit, total))
  } catch (error) {
    console.error('Get products error:', error)
    return errorResponse('Failed to fetch products', 500)
  }
}
