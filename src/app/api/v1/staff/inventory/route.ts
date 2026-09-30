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

async function checkStaffAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  const staffRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF', 'PRODUCT_MANAGER']
  if (!user || !staffRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user, role: user.role }
}

// GET /api/v1/staff/inventory - List products with stock status
export async function GET(request: NextRequest) {
  try {
    const access = await checkStaffAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const filter = searchParams.get('filter') // all, low, out
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    const where: any = { isActive: true }

    if (filter === 'low') {
      where.inventory = { gt: 0, lte: 10 }
    } else if (filter === 'out') {
      where.inventory = 0
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.categoryId = category
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          inventory: true,
          lowStockAlert: true,
          images: true,
          price: true,
          category: { select: { id: true, name: true } },
          variants: {
            select: {
              id: true,
              name: true,
              sku: true,
              inventory: true,
              attributes: true,
            },
          },
        },
        orderBy: { inventory: 'asc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    const transformedProducts = products.map((product) => {
      const totalInventory = product.hasVariants
        ? product.variants.reduce((sum, v) => sum + v.inventory, 0)
        : product.inventory

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        image: product.images[0] || null,
        price: Number(product.price),
        category: product.category,
        inventory: product.inventory,
        totalInventory,
        lowStockAlert: product.lowStockAlert,
        status:
          totalInventory === 0
            ? 'OUT_OF_STOCK'
            : totalInventory <= product.lowStockAlert
            ? 'LOW_STOCK'
            : 'IN_STOCK',
        variants: product.variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          inventory: v.inventory,
          attributes: v.attributes,
          status: v.inventory === 0 ? 'OUT_OF_STOCK' : v.inventory <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
        })),
      }
    })

    // Summary stats
    const [outOfStock, lowStock, totalProducts] = await Promise.all([
      prisma.product.count({ where: { isActive: true, inventory: 0 } }),
      prisma.product.count({ where: { isActive: true, inventory: { gt: 0, lte: 10 } } }),
      prisma.product.count({ where: { isActive: true } }),
    ])

    return successResponse(
      {
        products: transformedProducts,
        summary: {
          totalProducts,
          outOfStock,
          lowStock,
          inStock: totalProducts - outOfStock - lowStock,
        },
      },
      createPagination(page, limit, total)
    )
  } catch (error) {
    console.error('Staff inventory error:', error)
    return errorResponse('Failed to fetch inventory', 500)
  }
}
