import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api/response'

export async function GET(request: NextRequest, { params }: { params: { addressId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return unauthorizedResponse()

    const address = await prisma.address.findFirst({
      where: { id: params.addressId, userId: session.user.id },
    })

    if (!address) return notFoundResponse('Address')
    return successResponse({ address })
  } catch (error) {
    return errorResponse('Failed to fetch address', 500)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { addressId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return unauthorizedResponse()

    const body = await request.json()
    const address = await prisma.address.updateMany({
      where: { id: params.addressId, userId: session.user.id },
      data: body,
    })

    return successResponse({ message: 'Address updated' })
  } catch (error) {
    return errorResponse('Failed to update address', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { addressId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return unauthorizedResponse()

    await prisma.address.deleteMany({
      where: { id: params.addressId, userId: session.user.id },
    })

    return successResponse({ message: 'Address deleted' })
  } catch (error) {
    return errorResponse('Failed to delete address', 500)
  }
}
