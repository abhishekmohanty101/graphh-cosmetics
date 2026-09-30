import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/v1/admin/banners/reorder - Reorder banners
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { banners } = body // Array of { id, sortOrder }

    if (!banners || !Array.isArray(banners)) {
      return errorResponse('Banners array is required', 400)
    }

    // Update sort order for each banner
    await Promise.all(
      banners.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
        prisma.banner.update({
          where: { id },
          data: { sortOrder },
        })
      )
    )

    // Fetch updated banners
    const updatedBanners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return successResponse({
      message: 'Banners reordered',
      banners: updatedBanners,
    })
  } catch (error) {
    console.error('Reorder banners error:', error)
    return errorResponse('Failed to reorder banners', 500)
  }
}
