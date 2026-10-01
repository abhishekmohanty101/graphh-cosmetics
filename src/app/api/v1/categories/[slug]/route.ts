import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
      include: { children: true },
    })

    if (!category) return notFoundResponse('Category')

    const products = await prisma.product.findMany({
      where: { categoryId: category.id, isActive: true },
      take: 50,
    })

    return successResponse({
      category,
      products: products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        images: p.images,
        inventory: p.inventory,
      })),
    })
  } catch (error) {
    return errorResponse('Failed to fetch category', 500)
  }
}
