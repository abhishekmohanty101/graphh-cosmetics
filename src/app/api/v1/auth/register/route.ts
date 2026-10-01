import { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json()

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return errorResponse('Email already exists', 400)
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        phone,
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
      },
    })

    return successResponse({
      message: 'Registration successful',
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    console.error('Register error:', error)
    return errorResponse('Registration failed', 500)
  }
}
