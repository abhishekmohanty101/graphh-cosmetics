import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/admin/inventory/alerts - Get low stock alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const threshold = parseInt(searchParams.get('threshold') || '10')

    // Products with low stock
    const lowStockProducts = await prisma.product.findMany({
      where: {
        inventory: { lte: threshold, gt: 0 },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        inventory: true,
        images: true,
        category: { select: { name: true } },
      },
      orderBy: { inventory: 'asc' },
      take: 50,
    })

    // Products out of stock
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        inventory: 0,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        inventory: true,
        images: true,
        category: { select: { name: true } },
      },
      take: 50,
    })

    // Variants with low stock
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        inventory: { lte: threshold, gt: 0 },
        product: { isActive: true },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        inventory: true,
        product: {
          select: { id: true, name: true, images: true },
        },
      },
      orderBy: { inventory: 'asc' },
      take: 50,
    })

    return successResponse({
      alerts: {
        lowStock: {
          count: lowStockProducts.length,
          products: lowStockProducts,
        },
        outOfStock: {
          count: outOfStockProducts.length,
          products: outOfStockProducts,
        },
        lowStockVariants: {
          count: lowStockVariants.length,
          variants: lowStockVariants,
        },
      },
      threshold,
    })
  } catch (error) {
    console.error('Get inventory alerts error:', error)
    return errorResponse('Failed to fetch alerts', 500)
  }
}
