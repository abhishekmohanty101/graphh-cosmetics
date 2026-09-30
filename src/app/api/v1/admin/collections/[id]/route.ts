import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

// GET /api/v1/admin/collections/[id] - Get collection details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: params.id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!collection) {
      return notFoundResponse('Collection')
    }

    return successResponse({ collection })
  } catch (error) {
    console.error('Get collection error:', error)
    return errorResponse('Failed to fetch collection', 500)
  }
}

// PUT /api/v1/admin/collections/[id] - Update collection
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, slug, description, image, isActive, sortOrder } = body

    const existing = await prisma.collection.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return notFoundResponse('Collection')
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.collection.findFirst({
        where: { slug, id: { not: params.id } },
      })
      if (slugExists) {
        return errorResponse('Collection with this slug already exists', 400)
      }
    }

    const collection = await prisma.collection.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })

    return successResponse({ collection })
  } catch (error) {
    console.error('Update collection error:', error)
    return errorResponse('Failed to update collection', 500)
  }
}

// DELETE /api/v1/admin/collections/[id] - Delete collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.collection.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return notFoundResponse('Collection')
    }

    // Remove product associations first
    await prisma.collectionProduct.deleteMany({
      where: { collectionId: params.id },
    })

    await prisma.collection.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Collection deleted successfully' })
  } catch (error) {
    console.error('Delete collection error:', error)
    return errorResponse('Failed to delete collection', 500)
  }
}
