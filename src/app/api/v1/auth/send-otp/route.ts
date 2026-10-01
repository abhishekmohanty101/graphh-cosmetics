import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'
import { sendOTPEmail } from '@/lib/email'
import crypto from 'crypto'

// POST /api/v1/auth/send-otp - Send OTP to email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type = 'login' } = body

    if (!email) {
      return errorResponse('Email is required', 400)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', 400)
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists for login, or doesn't exist for registration
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (type === 'login' && !existingUser) {
      return errorResponse('No account found with this email', 404)
    }

    if (type === 'register' && existingUser) {
      return errorResponse('Email already registered', 400)
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Hash the OTP for storage (security)
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex')

    // Delete any existing OTP for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    })

    // Store hashed OTP in database
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: hashedOTP,
        expires: expiresAt,
      },
    })

    // Send OTP via email
    const emailResult = await sendOTPEmail({
      to: normalizedEmail,
      otp,
      name: existingUser?.name || undefined,
    })

    if (!emailResult.success) {
      return errorResponse('Failed to send OTP email. Please try again.', 500)
    }

    return successResponse({
      message: 'OTP sent successfully',
      email: normalizedEmail.slice(0, 3) + '***@' + normalizedEmail.split('@')[1],
      expiresAt: expiresAt.toISOString(),
      expiresIn: 600, // 10 minutes in seconds
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return errorResponse('Failed to send OTP', 500)
  }
}
