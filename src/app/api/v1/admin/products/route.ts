import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getPaginationParams, createPagination } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const search = searchParams.get('search')

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return successResponse({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        images: p.images,
        inventory: p.inventory,
        category: p.category,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestseller: p.isBestseller,
        createdAt: p.createdAt,
      })),
    }, createPagination(page, limit, total))
  } catch (error) {
    return errorResponse('Failed to fetch products', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, price, categoryId, images, sku } = body

    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        price,
        categoryId,
        images: images || [],
        sku,
      },
    })

    return successResponse({ product, message: 'Product created' })
  } catch (error) {
    return errorResponse('Failed to create product', 500)
  }
}
