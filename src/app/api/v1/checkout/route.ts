import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import Razorpay from 'razorpay'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api'
import { z } from 'zod'

const checkoutSchema = z.object({
  shippingAddressId: z.string().min(1, 'Shipping address is required'),
  billingAddressId: z.string().optional(),
  sameAsBilling: z.boolean().default(true),
  paymentMethod: z.enum(['RAZORPAY', 'COD']),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
})

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `GC${timestamp}${random}`
}

// POST /api/v1/checkout - Create order from cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const result = checkoutSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const { shippingAddressId, billingAddressId, sameAsBilling, paymentMethod, couponCode, notes } = result.data

    // Get user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                images: true,
                inventory: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                inventory: true,
              },
            },
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return errorResponse('Cart is empty', 400)
    }

    // Verify shipping address
    const shippingAddress = await prisma.address.findFirst({
      where: { id: shippingAddressId, userId: session.user.id },
    })

    if (!shippingAddress) {
      return errorResponse('Invalid shipping address', 400)
    }

    // Verify billing address (or use shipping)
    let billingAddressData = shippingAddress
    if (!sameAsBilling && billingAddressId) {
      const billingAddress = await prisma.address.findFirst({
        where: { id: billingAddressId, userId: session.user.id },
      })
      if (!billingAddress) {
        return errorResponse('Invalid billing address', 400)
      }
      billingAddressData = billingAddress
    }

    // Calculate totals and verify inventory
    let subtotal = 0
    const orderItems = []

    for (const item of cart.items) {
      const price = item.variant?.price ?? item.product.price
      const inventory = item.variant?.inventory ?? item.product.inventory
      const sku = item.variant?.sku ?? item.product.sku

      if (inventory < item.quantity) {
        return errorResponse(
          `Not enough stock for ${item.product.name}${item.variant ? ` (${item.variant.name})` : ''}`,
          400
        )
      }

      const itemTotal = price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        productId: item.product.id,
        variantId: item.variant?.id || null,
        name: item.product.name,
        variantName: item.variant?.name || null,
        sku: sku || '',
        quantity: item.quantity,
        price: price,
        discount: 0,
        total: itemTotal,
        image: item.product.images[0] || null,
      })
    }

    // Apply coupon discount (TODO: implement coupon logic)
    let discount = 0

    // Calculate shipping (free above ₹999)
    const shippingCost = subtotal >= 999 ? 0 : 49

    // Calculate tax (18% GST)
    const tax = Math.round((subtotal - discount) * 0.18)

    // Total
    const totalAmount = subtotal - discount + shippingCost + tax

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Prepare address snapshots as JSON
    const shippingAddressSnapshot = {
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      line1: shippingAddress.line1,
      line2: shippingAddress.line2 || null,
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      country: shippingAddress.country || 'India',
    }

    // Create order with addresses snapshot
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        status: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
        subtotal,
        discount,
        shipping: shippingCost,
        tax,
        total: totalAmount,
        notes,
        shippingAddress: shippingAddressSnapshot,
        couponCode: couponCode || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    })

    // Decrease inventory
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

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    // If COD, order is ready
    if (paymentMethod === 'COD') {
      // Create COD payment record
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'COD',
          status: 'PENDING',
          amount: totalAmount,
        },
      })

      // TODO: Send order confirmation email

      return successResponse({
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: 'COD',
        total: totalAmount,
        message: 'Order placed successfully!',
      })
    }

    // For Razorpay, create payment order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    })

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'RAZORPAY',
        status: 'PENDING',
        amount: totalAmount,
        providerOrderId: razorpayOrder.id,
      },
    })

    return successResponse({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMethod: 'RAZORPAY',
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: totalAmount,
      currency: 'INR',
      prefill: {
        name: shippingAddress.name,
        contact: shippingAddress.phone,
        email: session.user.email,
      },
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
