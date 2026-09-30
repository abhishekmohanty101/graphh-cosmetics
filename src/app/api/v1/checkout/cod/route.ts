import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api/response'

// POST /api/v1/checkout/cod - Create Cash on Delivery order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { addressId, couponCode, notes, giftMessage } = body

    if (!addressId) {
      return errorResponse('Delivery address is required', 400)
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return errorResponse('Cart is empty', 400)
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    })

    if (!address) {
      return errorResponse('Invalid address', 400)
    }

    // Calculate totals
    let subtotal = 0
    const orderItems: any[] = []

    for (const item of cart.items) {
      const price = item.variant?.price || item.product.price
      const itemTotal = price * item.quantity

      // Check stock
      const stock = item.variant?.inventory ?? item.product.inventory
      if (stock < item.quantity) {
        return errorResponse(
          `${item.product.name} has only ${stock} items in stock`,
          400
        )
      }

      subtotal += itemTotal
      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        sku: item.variant?.sku || item.product.sku,
        price,
        quantity: item.quantity,
        total: itemTotal,
      })
    }

    // COD limit check
    const COD_LIMIT = 5000
    if (subtotal > COD_LIMIT) {
      return errorResponse(
        `Cash on Delivery is only available for orders up to ₹${COD_LIMIT}`,
        400
      )
    }

    // Check if COD is available for this pincode
    const COD_BLOCKED_PINCODES = ['110001', '400001'] // Example blocked pincodes
    if (COD_BLOCKED_PINCODES.includes(address.pincode)) {
      return errorResponse(
        'Cash on Delivery is not available for this pincode',
        400
      )
    }

    // Apply coupon if provided
    let discount = 0
    let couponId = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      })

      if (coupon && coupon.isActive) {
        const now = new Date()
        if (
          (!coupon.validFrom || coupon.validFrom <= now) &&
          (!coupon.validUntil || coupon.validUntil >= now) &&
          (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit)
        ) {
          if (!coupon.minPurchase || subtotal >= coupon.minPurchase) {
            if (coupon.type === 'PERCENTAGE') {
              discount = Math.round((subtotal * coupon.value) / 100)
              if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount
              }
            } else if (coupon.type === 'FIXED') {
              discount = coupon.value
            }
            couponId = coupon.id
          }
        }
      }
    }

    // Calculate shipping
    const FREE_SHIPPING_THRESHOLD = 499
    const SHIPPING_CHARGE = 49
    const COD_CHARGE = 29
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE

    // Calculate tax (18% GST)
    const taxableAmount = subtotal - discount
    const tax = Math.round(taxableAmount * 0.18)

    const total = subtotal - discount + shipping + COD_CHARGE + tax

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `GR-${new Date().getFullYear()}-${String(orderCount + 1).padStart(5, '0')}`

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        status: 'CONFIRMED',
        subtotal,
        discount,
        shipping,
        tax,
        total,
        couponId,
        notes,
        giftMessage,
        paymentMethod: 'COD',
        shippingAddress: {
          name: address.name,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        },
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    })

    // Create payment record for COD
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'COD',
        amount: total,
        currency: 'INR',
        status: 'PENDING',
      },
    })

    // Update inventory
    for (const item of cart.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { inventory: { decrement: item.quantity } },
        })
      } else {
        await prisma.product.update({
          where: { id: item.productId },
          data: { inventory: { decrement: item.quantity } },
        })
      }
    }

    // Update coupon usage
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } },
      })
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    // TODO: Send order confirmation email
    // await sendOrderConfirmationEmail(session.user.email, order)

    return successResponse({
      message: 'Order placed successfully! Pay on delivery.',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        codCharge: COD_CHARGE,
        tax: order.tax,
        total: order.total,
        paymentMethod: 'COD',
        estimatedDelivery: getEstimatedDelivery(address.pincode),
        items: order.items,
        shippingAddress: order.shippingAddress,
      },
    })
  } catch (error) {
    console.error('COD checkout error:', error)
    return errorResponse('Failed to place order', 500)
  }
}

function getEstimatedDelivery(pincode: string): string {
  // Metro cities - faster delivery
  const metroPincodes = ['110', '400', '560', '600', '700', '500']
  const isMetro = metroPincodes.some((p) => pincode.startsWith(p))

  const today = new Date()
  const daysToAdd = isMetro ? 3 : 7
  const deliveryDate = new Date(today.setDate(today.getDate() + daysToAdd))

  return deliveryDate.toISOString().split('T')[0]
}
