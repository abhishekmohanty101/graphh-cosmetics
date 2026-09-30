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
import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number').optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
})

// GET /api/v1/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        image: true,
        dateOfBirth: true,
        gender: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    return successResponse({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      image: user.image,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      emailVerified: !!user.emailVerified,
      memberSince: user.createdAt,
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// PATCH /api/v1/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const result = updateProfileSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const data: any = {}

    if (result.data.firstName !== undefined) data.firstName = result.data.firstName
    if (result.data.lastName !== undefined) data.lastName = result.data.lastName
    if (result.data.phone !== undefined) {
      // Check if phone is already in use
      if (result.data.phone) {
        const existingPhone = await prisma.user.findFirst({
          where: {
            phone: result.data.phone,
            id: { not: session.user.id },
          },
        })
        if (existingPhone) {
          return errorResponse('Phone number already in use', 400)
        }
      }
      data.phone = result.data.phone
    }
    if (result.data.dateOfBirth !== undefined) {
      data.dateOfBirth = result.data.dateOfBirth ? new Date(result.data.dateOfBirth) : null
    }
    if (result.data.gender !== undefined) data.gender = result.data.gender

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
      },
    })

    return successResponse({
      message: 'Profile updated successfully',
      user,
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
