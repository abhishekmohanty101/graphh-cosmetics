import { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
})

// POST /api/v1/auth/reset-password - Reset password with token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = resetPasswordSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.errors[0].message, 400)
    }

    const { token, password } = result.data

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
      select: { id: true, email: true },
    })

    if (!user) {
      return errorResponse('Invalid or expired reset token', 400)
    }

    // Hash new password
    const hashedPassword = await hash(password, 12)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    // TODO: Send confirmation email
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Password changed - Graphh Cosmetics',
    //   template: 'password-changed',
    // })

    return successResponse({
      message: 'Password has been reset successfully. You can now login with your new password.',
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
