import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { compare, hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return unauthorizedResponse()

    const { currentPassword, newPassword } = await request.json()

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user?.passwordHash) return errorResponse('Password not set', 400)

    const isValid = await compare(currentPassword, user.passwordHash)
    if (!isValid) return errorResponse('Current password is incorrect', 400)

    const hashedPassword = await hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: hashedPassword },
    })

    return successResponse({ message: 'Password changed successfully' })
  } catch (error) {
    return errorResponse('Failed to change password', 500)
  }
}
