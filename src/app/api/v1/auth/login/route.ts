import { NextRequest } from 'next/server'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return errorResponse('Invalid credentials', 401)
    }

    if (!user.passwordHash) {
      return errorResponse('Password not set', 400)
    }

    if (user.isBlocked) {
      return errorResponse('Account is blocked', 403)
    }

    const isValid = await compare(password, user.passwordHash)
    if (!isValid) {
      return errorResponse('Invalid credentials', 401)
    }

    const token = sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Login failed', 500)
  }
}
