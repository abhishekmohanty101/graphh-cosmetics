import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, serverErrorResponse } from '@/lib/api'

// GET /api/v1/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        image: true,
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    })

    const transformedCategories = categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      image: cat.image,
      productCount: cat._count.products,
    }))

    return successResponse(transformedCategories)
  } catch (error) {
    return serverErrorResponse(error)
  }
}
