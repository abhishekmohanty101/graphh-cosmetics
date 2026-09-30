import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api'
import { z } from 'zod'

const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().positive().default(1),
})

// GET /api/v1/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                price: true,
                comparePrice: true,
                images: true,
                inventory: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                price: true,
                comparePrice: true,
                inventory: true,
                attributes: true,
              },
            },
          },
        },
      },
    })

    if (!cart) {
      return successResponse({ items: [], subtotal: 0 })
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      productSlug: item.product.slug,
      variantId: item.variant?.id || null,
      name: item.product.name,
      variant: item.variant?.name || null,
      price: item.variant?.price || item.product.price,
      comparePrice: item.variant?.comparePrice || item.product.comparePrice,
      quantity: item.quantity,
      image: item.product.images[0] || null,
      inventory: item.variant?.inventory || item.product.inventory,
      inStock: (item.variant?.inventory || item.product.inventory) > 0,
    }))

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return successResponse({ items, subtotal })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// POST /api/v1/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const result = addToCartSchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Invalid request data', 400)
    }

    const { productId, variantId, quantity } = result.data

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { id: true, inventory: true },
    })

    if (!product) {
      return errorResponse('Product not found', 404)
    }

    // Check variant if specified
    let variant = null
    if (variantId) {
      variant = await prisma.productVariant.findUnique({
        where: { id: variantId, isActive: true },
        select: { id: true, inventory: true },
      })
      if (!variant) {
        return errorResponse('Variant not found', 404)
      }
    }

    // Check inventory
    const availableInventory = variant?.inventory ?? product.inventory
    if (availableInventory < quantity) {
      return errorResponse('Not enough inventory', 400)
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      })
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    })

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > availableInventory) {
        return errorResponse('Not enough inventory', 400)
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      })
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
      })
    }

    // Update cart timestamp
    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    })

    return successResponse({ message: 'Item added to cart' })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// DELETE /api/v1/cart - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      })
    }

    return successResponse({ message: 'Cart cleared' })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
