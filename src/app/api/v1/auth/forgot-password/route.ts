import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// POST /api/v1/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Invalid email address', 400)
    }

    const { email } = result.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, firstName: true },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse({
        message: 'If an account with this email exists, you will receive a password reset link.',
      })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save reset token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // TODO: Send reset email with link
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Reset your password - Graphh Cosmetics',
    //   template: 'password-reset',
    //   data: { firstName: user.firstName, resetUrl }
    // })

    console.log(`Password reset token for ${email}: ${resetToken}`)

    return successResponse({
      message: 'If an account with this email exists, you will receive a password reset link.',
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
