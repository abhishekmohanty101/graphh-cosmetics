import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isBestseller: true },
      take: 12,
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({
      products: products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        images: p.images,
        isBestseller: p.isBestseller,
      })),
    })
  } catch (error) {
    return errorResponse('Failed to fetch bestsellers', 500)
  }
}
