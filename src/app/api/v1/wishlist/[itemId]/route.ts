import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api'

// DELETE /api/v1/wishlist/[itemId] - Remove item from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    // Get user's wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
    })

    if (!wishlist) {
      return notFoundResponse('Wishlist')
    }

    // Verify item belongs to user's wishlist
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        id: params.itemId,
        wishlistId: wishlist.id,
      },
    })

    if (!wishlistItem) {
      return notFoundResponse('Wishlist item')
    }

    // Delete item
    await prisma.wishlistItem.delete({
      where: { id: params.itemId },
    })

    return successResponse({ message: 'Item removed from wishlist' })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
