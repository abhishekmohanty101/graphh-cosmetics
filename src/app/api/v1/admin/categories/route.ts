import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
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

// GET /api/v1/admin/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const categories = await prisma.category.findMany({
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
    })

    const transformedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      parent: cat.parent,
      children: cat.children,
      productCount: cat._count.products,
      isActive: cat.isActive,
      sortOrder: cat.sortOrder,
      createdAt: cat.createdAt,
    }))

    return successResponse({ categories: transformedCategories })
  } catch (error) {
    console.error('Get categories error:', error)
    return errorResponse('Failed to fetch categories', 500)
  }
}

// POST /api/v1/admin/categories - Create category
export async function POST(request: NextRequest) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const body = await request.json()
    const { name, slug, description, image, parentId, isActive, sortOrder } = body

    if (!name) {
      return errorResponse('Category name is required', 400)
    }

    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: categorySlug },
    })

    if (existing) {
      return errorResponse('Category with this slug already exists', 400)
    }

    // Validate parent if provided
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      })
      if (!parent) {
        return errorResponse('Parent category not found', 400)
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: categorySlug,
        description: description || null,
        image: image || null,
        parentId: parentId || null,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
      include: {
        parent: { select: { id: true, name: true } },
      },
    })

    return successResponse({
      message: 'Category created successfully',
      category,
    })
  } catch (error) {
    console.error('Create category error:', error)
    return errorResponse('Failed to create category', 500)
  }
}
