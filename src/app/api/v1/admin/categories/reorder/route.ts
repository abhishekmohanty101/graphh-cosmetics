import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/v1/admin/categories/reorder - Reorder categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categories } = body // Array of { id, sortOrder }

    if (!categories || !Array.isArray(categories)) {
      return errorResponse('Categories array is required', 400)
    }

    // Update sort order for each category
    await Promise.all(
      categories.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder },
        })
      )
    )

    // Fetch updated categories
    const updatedCategories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return successResponse({
      message: 'Categories reordered',
      categories: updatedCategories,
    })
  } catch (error) {
    console.error('Reorder categories error:', error)
    return errorResponse('Failed to reorder categories', 500)
  }
}
