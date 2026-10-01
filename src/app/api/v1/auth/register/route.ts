import { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api'
import { registerSchema } from '@/lib/validations'

// POST /api/v1/auth/register - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const { name, email, phone, password } = result.data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return errorResponse('An account with this email already exists', 400)
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      })
      if (existingPhone) {
        return errorResponse('An account with this phone number already exists', 400)
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        phone,
        passwordHash: hashedPassword,
        name,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    })

    // TODO: Send welcome email

    return successResponse({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
