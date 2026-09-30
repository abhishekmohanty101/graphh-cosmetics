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

// GET /api/v1/admin/categories/[id] - Get category details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true, isActive: true } },
        _count: { select: { products: true } },
      },
    })

    if (!category) {
      return notFoundResponse('Category')
    }

    return successResponse({ category })
  } catch (error) {
    console.error('Get category error:', error)
    return errorResponse('Failed to fetch category', 500)
  }
}

// PUT /api/v1/admin/categories/[id] - Update category
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
    const { name, slug, description, image, parentId, isActive, sortOrder } = body

    const category = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!category) {
      return notFoundResponse('Category')
    }

    // Check slug uniqueness if changed
    if (slug && slug !== category.slug) {
      const existing = await prisma.category.findUnique({
        where: { slug },
      })
      if (existing) {
        return errorResponse('Category with this slug already exists', 400)
      }
    }

    // Prevent setting self as parent
    if (parentId === params.id) {
      return errorResponse('Category cannot be its own parent', 400)
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: name || category.name,
        slug: slug || category.slug,
        description: description !== undefined ? description : category.description,
        image: image !== undefined ? image : category.image,
        parentId: parentId !== undefined ? parentId : category.parentId,
        isActive: isActive !== undefined ? isActive : category.isActive,
        sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
      },
      include: {
        parent: { select: { id: true, name: true } },
      },
    })

    return successResponse({
      message: 'Category updated successfully',
      category: updated,
    })
  } catch (error) {
    console.error('Update category error:', error)
    return errorResponse('Failed to update category', 500)
  }
}

// DELETE /api/v1/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    })

    if (!category) {
      return notFoundResponse('Category')
    }

    // Check if category has products
    if (category._count.products > 0) {
      return errorResponse(
        `Cannot delete category with ${category._count.products} products. Move or delete products first.`,
        400
      )
    }

    // Check if category has children
    if (category._count.children > 0) {
      return errorResponse(
        `Cannot delete category with ${category._count.children} subcategories. Delete subcategories first.`,
        400
      )
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    return successResponse({
      message: 'Category deleted successfully',
    })
  } catch (error) {
    console.error('Delete category error:', error)
    return errorResponse('Failed to delete category', 500)
  }
}
