import { NextRequest } from 'next/server'
import { verify, sign } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/v1/auth/refresh-token - Refresh access token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return errorResponse('Refresh token is required', 400)
    }

    const secret = process.env.NEXTAUTH_SECRET || 'secret'

    // Verify refresh token
    let decoded: any
    try {
      decoded = verify(refreshToken, secret)
    } catch (err) {
      return errorResponse('Invalid or expired refresh token', 401)
    }

    if (decoded.type !== 'refresh' && decoded.type !== 'admin_refresh' && decoded.type !== 'staff_refresh') {
      return errorResponse('Invalid token type', 401)
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || !user.isActive) {
      return errorResponse('User not found or inactive', 401)
    }

    // Determine token type and expiry based on role
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
    const isStaff = ['STAFF', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'SUPPORT_AGENT', 'MANAGER'].includes(user.role)
    
    const expiresIn = isAdmin ? '4h' : isStaff ? '8h' : '1h'
    const expiresInSeconds = isAdmin ? 14400 : isStaff ? 28800 : 3600

    // Generate new access token
    const accessToken = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        type: isAdmin ? 'admin' : isStaff ? 'staff' : 'customer',
      },
      secret,
      { expiresIn }
    )

    // Optionally generate new refresh token (token rotation)
    const newRefreshToken = sign(
      {
        userId: user.id,
        type: isAdmin ? 'admin_refresh' : isStaff ? 'staff_refresh' : 'refresh',
      },
      secret,
      { expiresIn: isAdmin ? '1d' : '7d' }
    )

    return successResponse({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: expiresInSeconds,
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return errorResponse('Token refresh failed', 500)
  }
}
