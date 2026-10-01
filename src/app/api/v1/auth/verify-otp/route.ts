import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'
import { sendWelcomeEmail } from '@/lib/email'
import { sign } from 'jsonwebtoken'
import crypto from 'crypto'

// POST /api/v1/auth/verify-otp - Verify OTP and login/register user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, type = 'login', name } = body

    if (!email || !otp) {
      return errorResponse('Email and OTP are required', 400)
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Hash the provided OTP to compare
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex')

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token: hashedOTP,
      },
    })

    if (!verificationToken) {
      return errorResponse('Invalid OTP', 400)
    }

    // Check if OTP is expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: normalizedEmail,
            token: hashedOTP,
          },
        },
      })
      return errorResponse('OTP has expired. Please request a new one.', 400)
    }

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: normalizedEmail,
          token: hashedOTP,
        },
      },
    })

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // For registration, create new user
    if (type === 'register' && !user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name || null,
          isVerified: true,
          role: 'CUSTOMER',
        },
      })

      // Send welcome email (don't await, fire and forget)
      sendWelcomeEmail({ to: normalizedEmail, name }).catch(console.error)
    }

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Update user as verified if not already
    if (!user.isVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      })
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return errorResponse('Your account has been blocked. Please contact support.', 403)
    }

    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    return successResponse({
      message: type === 'register' ? 'Account created successfully' : 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return errorResponse('Failed to verify OTP', 500)
  }
}
