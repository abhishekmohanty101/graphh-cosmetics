import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

// POST /api/v1/admin/products/[id]/variants - Add product variant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return notFoundResponse('Product')
    }

    const body = await request.json()
    const { name, sku, price, inventory, attributes } = body

    if (!name || !sku) {
      return errorResponse('Name and SKU are required', 400)
    }

    // Check for duplicate SKU
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku },
    })

    if (existingSku) {
      return errorResponse('SKU already exists', 400)
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId: params.id,
        name,
        sku,
        price: price || product.price,
        inventory: inventory || 0,
        attributes: attributes || {},
      },
    })

    return successResponse({
      message: 'Variant added',
      variant,
    })
  } catch (error) {
    console.error('Add variant error:', error)
    return errorResponse('Failed to add variant', 500)
  }
}

// GET /api/v1/admin/products/[id]/variants - List product variants
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    })

    if (!product) {
      return notFoundResponse('Product')
    }

    return successResponse({
      productId: params.id,
      productName: product.name,
      variants: product.variants,
    })
  } catch (error) {
    console.error('Get variants error:', error)
    return errorResponse('Failed to fetch variants', 500)
  }
}
