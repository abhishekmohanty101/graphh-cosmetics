import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api'
import { z } from 'zod'

const updateQuantitySchema = z.object({
  quantity: z.number().int().positive(),
})

// PATCH /api/v1/cart/[itemId] - Update item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const result = updateQuantitySchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Invalid quantity', 400)
    }

    const { quantity } = result.data

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      return notFoundResponse('Cart')
    }

    // Get cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: params.itemId,
        cartId: cart.id,
      },
      include: {
        product: { select: { inventory: true } },
        variant: { select: { inventory: true } },
      },
    })

    if (!cartItem) {
      return notFoundResponse('Cart item')
    }

    // Check inventory
    const availableInventory = cartItem.variant?.inventory ?? cartItem.product.inventory
    if (quantity > availableInventory) {
      return errorResponse('Not enough inventory', 400)
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: params.itemId },
      data: { quantity },
    })

    return successResponse({ message: 'Quantity updated' })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// DELETE /api/v1/cart/[itemId] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      return notFoundResponse('Cart')
    }

    // Verify item belongs to user's cart
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: params.itemId,
        cartId: cart.id,
      },
    })

    if (!cartItem) {
      return notFoundResponse('Cart item')
    }

    // Delete item
    await prisma.cartItem.delete({
      where: { id: params.itemId },
    })

    return successResponse({ message: 'Item removed from cart' })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
