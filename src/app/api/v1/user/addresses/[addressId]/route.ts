import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api'
import { addressSchema } from '@/lib/validations'

// GET /api/v1/user/addresses/[addressId] - Get single address
export async function GET(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const address = await prisma.address.findFirst({
      where: {
        id: params.addressId,
        userId: session.user.id,
      },
      select: {
        id: true,
        type: true,
        firstName: true,
        lastName: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        isDefault: true,
      },
    })

    if (!address) {
      return notFoundResponse('Address')
    }

    return successResponse({ address })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// PATCH /api/v1/user/addresses/[addressId] - Update address
export async function PATCH(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.addressId,
        userId: session.user.id,
      },
    })

    if (!existingAddress) {
      return notFoundResponse('Address')
    }

    const body = await request.json()
    const result = addressSchema.partial().safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const { isDefault, ...updateData } = result.data

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          id: { not: params.addressId },
          isDefault: true,
        },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.update({
      where: { id: params.addressId },
      data: {
        ...updateData,
        ...(isDefault !== undefined && { isDefault }),
      },
      select: {
        id: true,
        type: true,
        firstName: true,
        lastName: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        isDefault: true,
      },
    })

    return successResponse({ message: 'Address updated', address })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// DELETE /api/v1/user/addresses/[addressId] - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: params.addressId,
        userId: session.user.id,
      },
    })

    if (!address) {
      return notFoundResponse('Address')
    }

    // Delete address
    await prisma.address.delete({
      where: { id: params.addressId },
    })

    // If it was default, set another as default
    if (address.isDefault) {
      const anotherAddress = await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      })

      if (anotherAddress) {
        await prisma.address.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true },
        })
      }
    }

    return successResponse({ message: 'Address deleted' })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
