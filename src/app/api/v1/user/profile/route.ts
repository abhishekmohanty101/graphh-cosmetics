import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return unauthorizedResponse()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, phone: true, avatar: true, isVerified: true, createdAt: true },
    })

    if (!user) return errorResponse('User not found', 404)

    return successResponse(user)
  } catch (error) {
    return errorResponse('Failed to fetch profile', 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return unauthorizedResponse()

    const body = await request.json()
    const { name, phone } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { ...(name && { name }), ...(phone && { phone }) },
      select: { id: true, email: true, name: true, phone: true },
    })

    return successResponse(user)
  } catch (error) {
    return errorResponse('Failed to update profile', 500)
  }
}
