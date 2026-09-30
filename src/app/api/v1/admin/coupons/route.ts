import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  getPaginationParams,
  createPagination,
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

// GET /api/v1/admin/coupons - List all coupons
export async function GET(request: NextRequest) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const status = searchParams.get('status') // active, expired, upcoming

    const now = new Date()
    let where: any = {}

    if (status === 'active') {
      where = {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      }
    } else if (status === 'expired') {
      where = { validUntil: { lt: now } }
    } else if (status === 'upcoming') {
      where = { validFrom: { gt: now } }
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ])

    const transformedCoupons = coupons.map((coupon) => {
      const isExpired = coupon.validUntil < now
      const isUpcoming = coupon.validFrom > now
      const isUsageLimitReached = coupon.usageLimit ? coupon.usageCount >= coupon.usageLimit : false

      return {
        ...coupon,
        status: isExpired
          ? 'expired'
          : isUpcoming
          ? 'upcoming'
          : !coupon.isActive
          ? 'inactive'
          : isUsageLimitReached
          ? 'limit_reached'
          : 'active',
        value: Number(coupon.value),
        minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      }
    })

    return successResponse(
      { coupons: transformedCoupons },
      createPagination(page, limit, total)
    )
  } catch (error) {
    console.error('Get coupons error:', error)
    return errorResponse('Failed to fetch coupons', 500)
  }
}

// POST /api/v1/admin/coupons - Create coupon
export async function POST(request: NextRequest) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const body = await request.json()
    const {
      code,
      type,
      value,
      minPurchase,
      maxDiscount,
      usageLimit,
      perUserLimit,
      validFrom,
      validUntil,
      categories,
      products,
      excludeProducts,
      isActive,
    } = body

    if (!code || !type || !value || !validFrom || !validUntil) {
      return errorResponse('Code, type, value, validFrom, and validUntil are required', 400)
    }

    // Validate type
    if (!['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'].includes(type)) {
      return errorResponse('Invalid coupon type', 400)
    }

    // Validate dates
    const from = new Date(validFrom)
    const until = new Date(validUntil)
    if (until <= from) {
      return errorResponse('validUntil must be after validFrom', 400)
    }

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (existing) {
      return errorResponse('Coupon code already exists', 400)
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        minPurchase: minPurchase || null,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        perUserLimit: perUserLimit || 1,
        validFrom: from,
        validUntil: until,
        categories: categories || [],
        products: products || [],
        excludeProducts: excludeProducts || [],
        isActive: isActive !== false,
        usageCount: 0,
      },
    })

    return successResponse({
      message: 'Coupon created successfully',
      coupon: {
        ...coupon,
        value: Number(coupon.value),
        minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      },
    })
  } catch (error) {
    console.error('Create coupon error:', error)
    return errorResponse('Failed to create coupon', 500)
  }
}
