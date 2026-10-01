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
    const existingIds = new Set(collection.productIds || [])

    // Filter out already added products
    const newProductIds = productIds.filter((id: string) => !existingIds.has(id))

    if (newProductIds.length === 0) {
      return errorResponse('All products are already in this collection', 400)
    }

    // Update collection with new product IDs
    const updatedCollection = await prisma.collection.update({
      where: { id: params.id },
      data: {
        productIds: [...(collection.productIds || []), ...newProductIds],
      },
    })

    return successResponse({
      message: `${newProductIds.length} products added to collection`,
      addedCount: newProductIds.length,
      totalProducts: updatedCollection.productIds.length,
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
    const productIdsParam = searchParams.get('productIds')
    const productIds = productIdsParam?.split(',')

    if (!productIds || productIds.length === 0) {
      return errorResponse('Product IDs are required', 400)
    }

    const collection = await prisma.collection.findUnique({
      where: { id: params.id },
    })

    if (!collection) {
      return notFoundResponse('Collection')
    }

    // Remove specified product IDs
    const updatedProductIds = (collection.productIds || []).filter(
      (id) => !productIds.includes(id)
    )

    const updatedCollection = await prisma.collection.update({
      where: { id: params.id },
      data: { productIds: updatedProductIds },
    })

    return successResponse({
      message: `${productIds.length} products removed from collection`,
      removedCount: productIds.length,
      totalProducts: updatedCollection.productIds.length,
    })
  } catch (error) {
    console.error('Remove products from collection error:', error)
    return errorResponse('Failed to remove products', 500)
  }
}

// GET /api/v1/admin/collections/[id]/products - Get products in collection
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: params.id },
    })

    if (!collection) {
      return notFoundResponse('Collection')
    }

    // Fetch product details
    const products = await prisma.product.findMany({
      where: { id: { in: collection.productIds || [] } },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        isActive: true,
      },
    })

    return successResponse({
      collectionId: params.id,
      collectionName: collection.name,
      products,
      totalProducts: products.length,
    })
  } catch (error) {
    console.error('Get collection products error:', error)
    return errorResponse('Failed to fetch products', 500)
  }
}
