import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
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

// GET /api/v1/admin/products/[id] - Get product details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: { select: { id: true, name: true } },
        variants: true,
        _count: { select: { reviews: true, orderItems: true } },
      },
    })

    if (!product) {
      return notFoundResponse('Product')
    }

    return successResponse({ product })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// PUT /api/v1/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return notFoundResponse('Product')
    }

    const body = await request.json()
    const result = productSchema.partial().safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const data = result.data

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.product.findFirst({
        where: { slug: data.slug, id: { not: params.id } },
      })
      if (slugExists) {
        return errorResponse('A product with this slug already exists', 400)
      }
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.shortDesc !== undefined && { shortDesc: data.shortDesc }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.comparePrice !== undefined && { comparePrice: data.comparePrice }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.tags && { tags: data.tags }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.barcode !== undefined && { barcode: data.barcode }),
        ...(data.inventory !== undefined && { inventory: data.inventory }),
        ...(data.lowStockAlert !== undefined && { lowStockAlert: data.lowStockAlert }),
        ...(data.trackInventory !== undefined && { trackInventory: data.trackInventory }),
        ...(data.hasVariants !== undefined && { hasVariants: data.hasVariants }),
        ...(data.ingredients !== undefined && { ingredients: data.ingredients }),
        ...(data.howToUse !== undefined && { howToUse: data.howToUse }),
        ...(data.benefits && { benefits: data.benefits }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDesc !== undefined && { metaDesc: data.metaDesc }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isNewArrival !== undefined && { isNew: data.isNewArrival }),
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    })

    return successResponse({
      message: 'Product updated successfully',
      product,
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// DELETE /api/v1/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAccess()
    if ('error' in auth) {
      return auth.status === 401
        ? errorResponse(auth.error, 401)
        : forbiddenResponse()
    }

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { orderItems: true } },
      },
    })

    if (!existing) {
      return notFoundResponse('Product')
    }

    // If product has orders, soft delete (deactivate) instead
    if (existing._count.orderItems > 0) {
      await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false },
      })
      return successResponse({
        message: 'Product deactivated (has order history)',
      })
    }

    // Hard delete if no orders
    await prisma.product.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Product deleted successfully' })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
