import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/api/response'

// POST /api/v1/cart/apply-coupon - Apply coupon to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { code } = body

    if (!code) {
      return errorResponse('Coupon code is required', 400)
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return notFoundResponse('Coupon')
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return errorResponse('This coupon is no longer active', 400)
    }

    // Check validity dates
    const now = new Date()
    if (now < coupon.validFrom) {
      return errorResponse('This coupon is not yet valid', 400)
    }
    if (now > coupon.validUntil) {
      return errorResponse('This coupon has expired', 400)
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return errorResponse('This coupon has reached its usage limit', 400)
    }

    // Check per-user limit
    const userUsageCount = await prisma.order.count({
      where: {
        userId: session.user.id,
        couponId: coupon.id,
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
    })

    if (userUsageCount >= coupon.perUserLimit) {
      return errorResponse('You have already used this coupon', 400)
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      return errorResponse('Cart not found', 404)
    }

    const cartItems = cart.items as any[]
    if (!cartItems || cartItems.length === 0) {
      return errorResponse('Cart is empty', 400)
    }

    // Calculate cart subtotal
    let subtotal = 0
    for (const item of cartItems) {
      subtotal += item.price * item.quantity
    }

    // Check minimum purchase
    if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) {
      return errorResponse(
        `Minimum purchase of ₹${coupon.minPurchase} required for this coupon`,
        400
      )
    }

    // Calculate discount
    let discount = 0
    if (coupon.type === 'PERCENTAGE') {
      discount = (subtotal * Number(coupon.value)) / 100
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount)
      }
    } else if (coupon.type === 'FIXED') {
      discount = Number(coupon.value)
    }
    // FREE_SHIPPING handled at checkout

    // Update cart with coupon
    await prisma.cart.update({
      where: { userId: session.user.id },
      data: {
        items: {
          ...cart.items,
          appliedCoupon: {
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            discount: discount,
          },
        } as any,
      },
    })

    return successResponse({
      message: 'Coupon applied successfully',
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discount: discount,
        description:
          coupon.type === 'PERCENTAGE'
            ? `${coupon.value}% off`
            : coupon.type === 'FIXED'
            ? `₹${coupon.value} off`
            : 'Free shipping',
      },
      cart: {
        subtotal,
        discount,
        total: subtotal - discount,
      },
    })
  } catch (error) {
    console.error('Apply coupon error:', error)
    return errorResponse('Failed to apply coupon', 500)
  }
}
