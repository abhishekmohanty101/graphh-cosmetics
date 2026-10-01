import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return successResponse({
      collections: collections.map((c) => ({
        ...c,
        productCount: c.productIds?.length || 0,
      })),
    })
  } catch (error) {
    return errorResponse('Failed to fetch collections', 500)
  }
}
