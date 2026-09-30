import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'
import { sign } from 'jsonwebtoken'

// POST /api/v1/auth/verify-otp - Verify OTP and authenticate user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, otp, type = 'login', name, email } = body

    if (!phone || !otp) {
      return errorResponse('Phone number and OTP are required', 400)
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return errorResponse('Invalid OTP format', 400)
    }

    // In production, verify OTP from Redis/database
    // For demo, we'll accept any 6-digit OTP in development
    // TODO: Implement proper OTP verification with MSG91 or stored OTP
    
    // MSG91 verification example:
    // const verifyResponse = await fetch(
    //   `https://api.msg91.com/api/v5/otp/verify?mobile=91${phone}&otp=${otp}`,
    //   {
    //     method: 'GET',
    //     headers: { 'authkey': process.env.MSG91_AUTH_KEY! },
    //   }
    // )
    // const verifyResult = await verifyResponse.json()
    // if (verifyResult.type !== 'success') {
    //   return errorResponse('Invalid or expired OTP', 400)
    // }

    // For development, accept OTP (remove in production!)
    if (process.env.NODE_ENV !== 'development') {
      // Add proper OTP verification here
      return errorResponse('OTP verification not configured', 500)
    }

    let user

    if (type === 'register') {
      // Create new user
      if (!name) {
        return errorResponse('Name is required for registration', 400)
      }

      user = await prisma.user.create({
        data: {
          name,
          phone,
          email: email || null,
          phoneVerified: true,
          role: 'CUSTOMER',
        },
      })
    } else {
      // Login - find existing user
      user = await prisma.user.findUnique({
        where: { phone },
      })

      if (!user) {
        return errorResponse('User not found', 404)
      }

      // Update phone verified status if not already
      if (!user.phoneVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { phoneVerified: true },
        })
      }
    }

    // Generate JWT tokens
    const accessToken = sign(
      { userId: user.id, role: user.role },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '1h' }
    )

    const refreshToken = sign(
      { userId: user.id, type: 'refresh' },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    return successResponse({
      message: type === 'register' ? 'Account created successfully' : 'Login successful',
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
      expiresIn: 3600, // 1 hour
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return errorResponse('Failed to verify OTP', 500)
  }
}
