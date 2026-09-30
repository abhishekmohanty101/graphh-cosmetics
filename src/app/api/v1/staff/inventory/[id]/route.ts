import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api/response'

async function checkStaffAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  const staffRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF', 'PRODUCT_MANAGER']
  if (!user || !staffRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user, role: user.role }
}

// GET /api/v1/staff/inventory/[id] - Get product inventory details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: { select: { id: true, name: true } },
        variants: {
          select: {
            id: true,
            name: true,
            sku: true,
            inventory: true,
            attributes: true,
            price: true,
          },
        },
      },
    })

    if (!product) {
      return notFoundResponse('Product')
    }

    return successResponse({ product })
  } catch (error) {
    console.error('Get inventory item error:', error)
    return errorResponse('Failed to fetch product', 500)
  }
}

// PATCH /api/v1/staff/inventory/[id] - Update inventory
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const body = await request.json()
    const { inventory, variantId, adjustment, reason } = body

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    })

    if (!product) {
      return notFoundResponse('Product')
    }

    // If updating variant inventory
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId)
      if (!variant) {
        return notFoundResponse('Variant')
      }

      let newInventory = variant.inventory
      if (adjustment !== undefined) {
        newInventory = Math.max(0, variant.inventory + adjustment)
      } else if (inventory !== undefined) {
        newInventory = Math.max(0, inventory)
      }

      await prisma.productVariant.update({
        where: { id: variantId },
        data: { inventory: newInventory },
      })

      // Log the adjustment
      // TODO: Create InventoryLog model and log here

      return successResponse({
        message: 'Variant inventory updated',
        variantId,
        previousInventory: variant.inventory,
        newInventory,
      })
    }

    // Update main product inventory
    let newInventory = product.inventory
    if (adjustment !== undefined) {
      newInventory = Math.max(0, product.inventory + adjustment)
    } else if (inventory !== undefined) {
      newInventory = Math.max(0, inventory)
    }

    await prisma.product.update({
      where: { id: params.id },
      data: { inventory: newInventory },
    })

    return successResponse({
      message: 'Product inventory updated',
      productId: params.id,
      previousInventory: product.inventory,
      newInventory,
      reason: reason || 'Manual adjustment',
    })
  } catch (error) {
    console.error('Update inventory error:', error)
    return errorResponse('Failed to update inventory', 500)
  }
}
