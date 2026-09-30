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

async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER']
  if (!user || !adminRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user }
}

// GET /api/v1/admin/coupons/[id] - Get coupon details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            createdAt: true,
            user: { select: { email: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!coupon) {
      return notFoundResponse('Coupon')
    }

    return successResponse({
      coupon: {
        ...coupon,
        value: Number(coupon.value),
        minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      },
    })
  } catch (error) {
    console.error('Get coupon error:', error)
    return errorResponse('Failed to fetch coupon', 500)
  }
}

// PUT /api/v1/admin/coupons/[id] - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const body = await request.json()
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    })

    if (!coupon) {
      return notFoundResponse('Coupon')
    }

    // Check code uniqueness if changed
    if (body.code && body.code.toUpperCase() !== coupon.code) {
      const existing = await prisma.coupon.findUnique({
        where: { code: body.code.toUpperCase() },
      })
      if (existing) {
        return errorResponse('Coupon code already exists', 400)
      }
    }

    const updated = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        code: body.code ? body.code.toUpperCase() : coupon.code,
        type: body.type || coupon.type,
        value: body.value !== undefined ? body.value : coupon.value,
        minPurchase: body.minPurchase !== undefined ? body.minPurchase : coupon.minPurchase,
        maxDiscount: body.maxDiscount !== undefined ? body.maxDiscount : coupon.maxDiscount,
        usageLimit: body.usageLimit !== undefined ? body.usageLimit : coupon.usageLimit,
        perUserLimit: body.perUserLimit !== undefined ? body.perUserLimit : coupon.perUserLimit,
        validFrom: body.validFrom ? new Date(body.validFrom) : coupon.validFrom,
        validUntil: body.validUntil ? new Date(body.validUntil) : coupon.validUntil,
        categories: body.categories !== undefined ? body.categories : coupon.categories,
        products: body.products !== undefined ? body.products : coupon.products,
        excludeProducts: body.excludeProducts !== undefined ? body.excludeProducts : coupon.excludeProducts,
        isActive: body.isActive !== undefined ? body.isActive : coupon.isActive,
      },
    })

    return successResponse({
      message: 'Coupon updated successfully',
      coupon: {
        ...updated,
        value: Number(updated.value),
        minPurchase: updated.minPurchase ? Number(updated.minPurchase) : null,
        maxDiscount: updated.maxDiscount ? Number(updated.maxDiscount) : null,
      },
    })
  } catch (error) {
    console.error('Update coupon error:', error)
    return errorResponse('Failed to update coupon', 500)
  }
}

// DELETE /api/v1/admin/coupons/[id] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    })

    if (!coupon) {
      return notFoundResponse('Coupon')
    }

    // Check if coupon has been used
    if (coupon.usageCount > 0) {
      // Soft delete by deactivating
      await prisma.coupon.update({
        where: { id: params.id },
        data: { isActive: false },
      })
      return successResponse({
        message: 'Coupon deactivated (has usage history)',
      })
    }

    await prisma.coupon.delete({
      where: { id: params.id },
    })

    return successResponse({
      message: 'Coupon deleted successfully',
    })
  } catch (error) {
    console.error('Delete coupon error:', error)
    return errorResponse('Failed to delete coupon', 500)
  }
}
