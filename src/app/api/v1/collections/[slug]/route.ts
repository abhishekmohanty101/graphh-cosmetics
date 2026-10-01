import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { slug: params.slug },
    })

    if (!collection) return notFoundResponse('Collection')

    let products: any[] = []
    if (collection.productIds && collection.productIds.length > 0) {
      products = await prisma.product.findMany({
        where: { id: { in: collection.productIds }, isActive: true },
      })
    }

    return successResponse({
      collection: { ...collection, products },
    })
  } catch (error) {
    return errorResponse('Failed to fetch collection', 500)
  }
}
