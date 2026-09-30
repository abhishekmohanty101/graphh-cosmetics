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

// GET /api/v1/admin/banners/[id] - Get banner
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    try {
      const banner = await prisma.banner.findUnique({
        where: { id: params.id },
      })

      if (!banner) {
        return notFoundResponse('Banner')
      }

      return successResponse({ banner })
    } catch {
      return notFoundResponse('Banner')
    }
  } catch (error) {
    console.error('Get banner error:', error)
    return errorResponse('Failed to fetch banner', 500)
  }
}

// PUT /api/v1/admin/banners/[id] - Update banner
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

    try {
      const banner = await prisma.banner.findUnique({
        where: { id: params.id },
      })

      if (!banner) {
        return notFoundResponse('Banner')
      }

      const updated = await prisma.banner.update({
        where: { id: params.id },
        data: {
          title: body.title ?? banner.title,
          subtitle: body.subtitle !== undefined ? body.subtitle : banner.subtitle,
          image: body.image ?? banner.image,
          mobileImage: body.mobileImage !== undefined ? body.mobileImage : banner.mobileImage,
          link: body.link !== undefined ? body.link : banner.link,
          position: body.position ?? banner.position,
          isActive: body.isActive !== undefined ? body.isActive : banner.isActive,
          sortOrder: body.sortOrder !== undefined ? body.sortOrder : banner.sortOrder,
          startDate: body.startDate ? new Date(body.startDate) : banner.startDate,
          endDate: body.endDate ? new Date(body.endDate) : banner.endDate,
        },
      })

      return successResponse({
        message: 'Banner updated successfully',
        banner: updated,
      })
    } catch {
      return notFoundResponse('Banner')
    }
  } catch (error) {
    console.error('Update banner error:', error)
    return errorResponse('Failed to update banner', 500)
  }
}

// DELETE /api/v1/admin/banners/[id] - Delete banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    try {
      const banner = await prisma.banner.findUnique({
        where: { id: params.id },
      })

      if (!banner) {
        return notFoundResponse('Banner')
      }

      await prisma.banner.delete({
        where: { id: params.id },
      })

      return successResponse({
        message: 'Banner deleted successfully',
      })
    } catch {
      return notFoundResponse('Banner')
    }
  } catch (error) {
    console.error('Delete banner error:', error)
    return errorResponse('Failed to delete banner', 500)
  }
}
