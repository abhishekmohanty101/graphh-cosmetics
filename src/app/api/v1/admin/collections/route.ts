import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getPaginationParams, createPagination } from '@/lib/api/response'

// GET /api/v1/admin/collections - Get all collections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
      }),
      prisma.collection.count({ where }),
    ])

    return successResponse({
      collections: collections.map((c) => ({
        ...c,
        productCount: c._count.products,
      })),
      pagination: createPagination(page, limit, total),
    })
  } catch (error) {
    console.error('Get collections error:', error)
    return errorResponse('Failed to fetch collections', 500)
  }
}

// POST /api/v1/admin/collections - Create collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, image, isActive = true, sortOrder = 0 } = body

    if (!name) {
      return errorResponse('Collection name is required', 400)
    }

    const collectionSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    // Check for duplicate slug
    const existing = await prisma.collection.findUnique({
      where: { slug: collectionSlug },
    })

    if (existing) {
      return errorResponse('Collection with this slug already exists', 400)
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        slug: collectionSlug,
        description,
        image,
        isActive,
        sortOrder,
      },
    })

    return successResponse({ collection }, undefined)
  } catch (error) {
    console.error('Create collection error:', error)
    return errorResponse('Failed to create collection', 500)
  }
}
