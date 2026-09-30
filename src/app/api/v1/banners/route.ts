import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/banners - Get active banners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position') // hero, secondary, sidebar

    const now = new Date()

    const where: any = {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    }

    if (position) {
      where.position = position
    }

    try {
      const banners = await prisma.banner.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
      })

      return successResponse({ banners })
    } catch {
      // If Banner model doesn't exist, return default banners
      return successResponse({
        banners: [
          {
            id: '1',
            title: 'Discover Your Perfect Look',
            subtitle: 'Shop our new collection of premium cosmetics',
            image: '/images/banner-hero.jpg',
            mobileImage: '/images/banner-hero-mobile.jpg',
            link: '/products',
            buttonText: 'Shop Now',
            position: 'hero',
            isActive: true,
            sortOrder: 1,
          },
          {
            id: '2',
            title: 'Free Shipping on Orders ₹499+',
            subtitle: 'Limited time offer',
            image: '/images/banner-promo.jpg',
            link: '/products',
            buttonText: 'Start Shopping',
            position: 'hero',
            isActive: true,
            sortOrder: 2,
          },
        ],
      })
    }
  } catch (error) {
    console.error('Get banners error:', error)
    return errorResponse('Failed to fetch banners', 500)
  }
}
