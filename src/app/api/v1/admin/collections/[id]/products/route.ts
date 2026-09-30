import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

// POST /api/v1/admin/collections/[id]/products - Add products to collection
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { productIds } = body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return errorResponse('Product IDs array is required', 400)
    }

    const collection = await prisma.collection.findUnique({
      where: { id: params.id },
    })

    if (!collection) {
      return notFoundResponse('Collection')
    }

    // Get existing products in collection
    const existingProducts = await prisma.collectionProduct.findMany({
      where: { collectionId: params.id },
      select: { productId: true },
    })
    const existingIds = new Set(existingProducts.map((p) => p.productId))

    // Filter out already added products
    const newProductIds = productIds.filter((id: string) => !existingIds.has(id))

    if (newProductIds.length === 0) {
      return errorResponse('All products are already in this collection', 400)
    }

    // Get max sort order
    const maxOrder = await prisma.collectionProduct.findFirst({
      where: { collectionId: params.id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    })

    let currentOrder = (maxOrder?.sortOrder || 0) + 1

    // Add new products
    await prisma.collectionProduct.createMany({
      data: newProductIds.map((productId: string) => ({
        collectionId: params.id,
        productId,
        sortOrder: currentOrder++,
      })),
    })

    return successResponse({
      message: `${newProductIds.length} products added to collection`,
      addedCount: newProductIds.length,
    })
  } catch (error) {
    console.error('Add products to collection error:', error)
    return errorResponse('Failed to add products', 500)
  }
}

// DELETE /api/v1/admin/collections/[id]/products - Remove products from collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get('productIds')?.split(',')

    if (!productIds || productIds.length === 0) {
      return errorResponse('Product IDs are required', 400)
    }

    const collection = await prisma.collection.findUnique({
      where: { id: params.id },
    })

    if (!collection) {
      return notFoundResponse('Collection')
    }

    const result = await prisma.collectionProduct.deleteMany({
      where: {
        collectionId: params.id,
        productId: { in: productIds },
      },
    })

    return successResponse({
      message: `${result.count} products removed from collection`,
      removedCount: result.count,
    })
  } catch (error) {
    console.error('Remove products from collection error:', error)
    return errorResponse('Failed to remove products', 500)
  }
}
