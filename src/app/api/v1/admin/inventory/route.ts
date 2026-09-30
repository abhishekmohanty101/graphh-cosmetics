import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getPaginationParams, createPagination } from '@/lib/api/response'

// GET /api/v1/admin/inventory - Get inventory list with alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const search = searchParams.get('search')
    const lowStock = searchParams.get('lowStock') === 'true'
    const outOfStock = searchParams.get('outOfStock') === 'true'
    const categoryId = searchParams.get('categoryId')

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (outOfStock) {
      where.inventory = 0
    } else if (lowStock) {
      where.inventory = { lte: 10, gt: 0 }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          sku: true,
          inventory: true,
          price: true,
          images: true,
          isActive: true,
          category: { select: { id: true, name: true } },
          variants: {
            select: {
              id: true,
              name: true,
              sku: true,
              inventory: true,
            },
          },
        },
        orderBy: { inventory: 'asc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    // Calculate inventory stats
    const stats = await prisma.product.aggregate({
      _sum: { inventory: true },
      _count: true,
    })

    const lowStockCount = await prisma.product.count({
      where: { inventory: { lte: 10, gt: 0 } },
    })

    const outOfStockCount = await prisma.product.count({
      where: { inventory: 0 },
    })

    return successResponse({
      products: products.map((p) => ({
        ...p,
        totalVariantStock: p.variants.reduce((sum, v) => sum + v.inventory, 0),
        lowStock: p.inventory <= 10 && p.inventory > 0,
        outOfStock: p.inventory === 0,
      })),
      stats: {
        totalProducts: stats._count,
        totalStock: stats._sum.inventory || 0,
        lowStockCount,
        outOfStockCount,
      },
      pagination: createPagination(page, limit, total),
    })
  } catch (error) {
    console.error('Get inventory error:', error)
    return errorResponse('Failed to fetch inventory', 500)
  }
}
