import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
  validationErrorResponse,
  serverErrorResponse,
  getPaginationParams,
  createPagination,
} from '@/lib/api'
import { productSchema } from '@/lib/validations'

async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'PRODUCT_MANAGER']
  if (!user || !adminRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }

  return { user: session.user }
}

// GET /api/v1/admin/products - List all products (admin view)
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.categoryId = category
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    } else if (status === 'out_of_stock') {
      where.inventory = 0
    } else if (status === 'low_stock') {
      where.inventory = { gt: 0, lte: 10 }
    }

    const total = await prisma.product.count({ where })

    const products = await prisma.product.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { reviews: true, orderItems: true } },
      },
    })

    return successResponse(
      {
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          price: p.price,
          comparePrice: p.comparePrice,
          inventory: p.inventory,
          images: p.images,
          category: p.category,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          isNew: p.isNew,
          avgRating: p.avgRating,
          reviewCount: p._count.reviews,
          orderCount: p._count.orderItems,
          createdAt: p.createdAt,
        })),
      },
      createPagination(page, limit, total)
    )
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// POST /api/v1/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const body = await request.json()
    const result = productSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const data = result.data

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }

    // Check if slug exists
    const existingSlug = await prisma.product.findUnique({
      where: { slug: data.slug },
    })

    if (existingSlug) {
      return errorResponse('A product with this slug already exists', 400)
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDesc: data.shortDesc,
        price: data.price,
        comparePrice: data.comparePrice,
        costPrice: data.costPrice,
        categoryId: data.categoryId,
        tags: data.tags || [],
        sku: data.sku,
        barcode: data.barcode,
        inventory: data.inventory,
        lowStockAlert: data.lowStockAlert,
        trackInventory: data.trackInventory,
        hasVariants: data.hasVariants,
        ingredients: data.ingredients,
        howToUse: data.howToUse,
        benefits: data.benefits || [],
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isNew: data.isNewArrival,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    })

    return successResponse({
      message: 'Product created successfully',
      product,
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
