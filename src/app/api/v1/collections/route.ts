import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/collections - Get all active collections
export async function GET(request: NextRequest) {
  try {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        sortOrder: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    const transformedCollections = collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image: collection.image,
      productCount: collection._count.products,
    }))

    return successResponse({ collections: transformedCollections })
  } catch (error) {
    console.error('Get collections error:', error)
    // If Collection model doesn't exist yet, return empty array
    if ((error as any)?.code === 'P2021') {
      return successResponse({ collections: [] })
    }
    return errorResponse('Failed to fetch collections', 500)
  }
}
