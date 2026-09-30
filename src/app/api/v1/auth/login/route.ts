import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/v1/auth/login - Customer login with email/password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return errorResponse('Email and password are required', 400)
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return errorResponse('Invalid credentials', 401)
    }

    if (!user.password) {
      return errorResponse('Please use OTP login or reset your password', 400)
    }

    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401)
    }

    if (!user.isActive) {
      return errorResponse('Account is disabled', 403)
    }

    // Generate tokens
    const accessToken = sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '1h' }
    )

    const refreshToken = sign(
      { userId: user.id, type: 'refresh' },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
      accessToken,
      refreshToken,
      expiresIn: 3600,
    })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Login failed', 500)
  }
}
