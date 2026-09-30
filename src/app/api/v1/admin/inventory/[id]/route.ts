import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse } from '@/lib/api/response'

// GET /api/v1/admin/inventory/[id] - Get product inventory details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        variants: true,
        category: { select: { id: true, name: true } },
      },
    })

    if (!product) {
      return notFoundResponse('Product')
    }

    // Get recent inventory adjustments
    const adjustments = await prisma.inventoryAdjustment.findMany({
      where: { productId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    return successResponse({
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        inventory: product.inventory,
        variants: product.variants,
        category: product.category,
      },
      adjustments,
    })
  } catch (error) {
    console.error('Get inventory details error:', error)
    return errorResponse('Failed to fetch inventory details', 500)
  }
}

// PATCH /api/v1/admin/inventory/[id] - Update product inventory
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { quantity, type, reason, variantId } = body

    if (quantity === undefined || !type) {
      return errorResponse('Quantity and type are required', 400)
    }

    const validTypes = ['SET', 'ADD', 'SUBTRACT', 'ADJUSTMENT']
    if (!validTypes.includes(type)) {
      return errorResponse('Invalid adjustment type', 400)
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    })

    if (!product) {
      return notFoundResponse('Product')
    }

    let newQuantity: number
    let previousQuantity: number

    if (variantId) {
      // Update variant inventory
      const variant = product.variants.find((v) => v.id === variantId)
      if (!variant) {
        return notFoundResponse('Variant')
      }

      previousQuantity = variant.inventory

      switch (type) {
        case 'SET':
          newQuantity = quantity
          break
        case 'ADD':
          newQuantity = previousQuantity + quantity
          break
        case 'SUBTRACT':
          newQuantity = Math.max(0, previousQuantity - quantity)
          break
        case 'ADJUSTMENT':
          newQuantity = previousQuantity + quantity // quantity can be negative
          break
        default:
          newQuantity = previousQuantity
      }

      await prisma.productVariant.update({
        where: { id: variantId },
        data: { inventory: Math.max(0, newQuantity) },
      })
    } else {
      // Update product inventory
      previousQuantity = product.inventory

      switch (type) {
        case 'SET':
          newQuantity = quantity
          break
        case 'ADD':
          newQuantity = previousQuantity + quantity
          break
        case 'SUBTRACT':
          newQuantity = Math.max(0, previousQuantity - quantity)
          break
        case 'ADJUSTMENT':
          newQuantity = previousQuantity + quantity
          break
        default:
          newQuantity = previousQuantity
      }

      await prisma.product.update({
        where: { id: params.id },
        data: { inventory: Math.max(0, newQuantity) },
      })
    }

    // Log the adjustment
    await prisma.inventoryAdjustment.create({
      data: {
        productId: params.id,
        variantId,
        userId: session.user.id,
        type,
        quantity,
        previousQuantity,
        newQuantity: Math.max(0, newQuantity),
        reason: reason || `${type} adjustment`,
      },
    })

    return successResponse({
      message: 'Inventory updated successfully',
      previousQuantity,
      newQuantity: Math.max(0, newQuantity),
      change: newQuantity - previousQuantity,
    })
  } catch (error) {
    console.error('Update inventory error:', error)
    return errorResponse('Failed to update inventory', 500)
  }
}
