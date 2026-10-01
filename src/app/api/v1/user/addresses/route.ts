import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return unauthorizedResponse()

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: 'desc' },
    })

    return successResponse({ addresses })
  } catch (error) {
    return errorResponse('Failed to fetch addresses', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return unauthorizedResponse()

    const body = await request.json()
    const { name, phone, line1, line2, city, state, pincode, type, isDefault } = body

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        name,
        phone,
        line1,
        line2,
        city,
        state,
        pincode,
        type: type || 'HOME',
        isDefault: isDefault || false,
      },
    })

    return successResponse({ address })
  } catch (error) {
    return errorResponse('Failed to create address', 500)
  }
}
