import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/v1/auth/send-otp - Send OTP to phone number
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, type = 'login' } = body

    if (!phone) {
      return errorResponse('Phone number is required', 400)
    }

    // Validate Indian phone number
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return errorResponse('Invalid phone number format', 400)
    }

    // Check if user exists for login, or doesn't exist for registration
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (type === 'login' && !existingUser) {
      return errorResponse('No account found with this phone number', 404)
    }

    if (type === 'register' && existingUser) {
      return errorResponse('Phone number already registered', 400)
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store OTP in database (you might want a separate OTP table)
    // For now, we'll use a simple approach with user metadata or a cache
    
    // In production, use Redis or a dedicated OTP table
    // For demo, we'll store in a verification token approach
    const verificationData = {
      phone,
      otp,
      type,
      expiresAt: expiresAt.toISOString(),
      attempts: 0,
    }

    // Store OTP (in production, use Redis with TTL)
    // Here we'll use a simple approach - store hashed in DB or memory
    // For now, simulating storage
    
    // TODO: Integrate with MSG91 or similar SMS provider
    // await sendSMS(phone, `Your Graphh verification code is: ${otp}. Valid for 5 minutes.`)
    
    console.log(`[DEV] OTP for ${phone}: ${otp}`) // Remove in production!

    // In production with MSG91:
    // const msg91Response = await fetch('https://api.msg91.com/api/v5/otp', {
    //   method: 'POST',
    //   headers: {
    //     'authkey': process.env.MSG91_AUTH_KEY!,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     template_id: process.env.MSG91_TEMPLATE_ID,
    //     mobile: `91${phone}`,
    //     otp,
    //   }),
    // })

    return successResponse({
      message: 'OTP sent successfully',
      phone: phone.slice(0, 2) + '****' + phone.slice(-4),
      expiresAt: expiresAt.toISOString(),
      expiresIn: 300, // 5 minutes in seconds
      // In dev mode, include OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return errorResponse('Failed to send OTP', 500)
  }
}
