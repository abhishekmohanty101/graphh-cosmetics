import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api/response'

// POST /api/v1/cart/remove-coupon - Remove coupon from cart
export async function POST(request: NextRequest) {
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
      return errorResponse('Cart not found', 404)
    }

    const cartData = cart.items as any
    
    // Remove coupon from cart
    if (cartData && cartData.appliedCoupon) {
      delete cartData.appliedCoupon
    }

    await prisma.cart.update({
      where: { userId: session.user.id },
      data: {
        items: cartData,
      },
    })

    // Calculate new totals
    const items = Array.isArray(cartData) ? cartData : cartData?.items || []
    let subtotal = 0
    for (const item of items) {
      subtotal += item.price * item.quantity
    }

    return successResponse({
      message: 'Coupon removed successfully',
      cart: {
        subtotal,
        discount: 0,
        total: subtotal,
      },
    })
  } catch (error) {
    console.error('Remove coupon error:', error)
    return errorResponse('Failed to remove coupon', 500)
  }
}
