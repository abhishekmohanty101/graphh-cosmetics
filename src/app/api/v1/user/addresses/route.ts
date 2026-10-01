import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/auth-options'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api'
import { addressSchema } from '@/lib/validations'

// GET /api/v1/user/addresses - Get all user addresses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        type: true,
        name: true,
        
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

    return successResponse({ addresses })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// POST /api/v1/user/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const result = addressSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const { isDefault, ...addressData } = result.data

    // If this is default, unset other default addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    // Check if this is the first address, make it default
    const addressCount = await prisma.address.count({
      where: { userId: session.user.id },
    })
    const shouldBeDefault = isDefault || addressCount === 0

    const address = await prisma.address.create({
      data: {
        ...addressData,
        userId: session.user.id,
        isDefault: shouldBeDefault,
        country: addressData.country || 'India',
      },
      select: {
        id: true,
        type: true,
        name: true,
        
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

    return successResponse({ message: 'Address added', address })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
