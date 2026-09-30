import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/v1/staff/auth/login - Staff login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return errorResponse('Email and password are required', 400)
    }

    // Find staff user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return errorResponse('Invalid credentials', 401)
    }

    // Check if user has staff role
    const staffRoles = ['STAFF', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'SUPPORT_AGENT', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']
    if (!staffRoles.includes(user.role)) {
      return errorResponse('Access denied. Staff privileges required.', 403)
    }

    // Check if account is active
    if (!user.isActive) {
      return errorResponse('Account is disabled. Contact your manager.', 403)
    }

    // Verify password
    if (!user.password) {
      return errorResponse('Password not set. Contact admin for password reset.', 400)
    }

    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401)
    }

    // Generate staff access token
    const accessToken = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'staff',
      },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '8h' } // 8 hours for staff (full shift)
    )

    const refreshToken = sign(
      {
        userId: user.id,
        type: 'staff_refresh',
      },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '1d' }
    )

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Get staff permissions based on role
    const permissions = getStaffPermissions(user.role)

    return successResponse({
      message: 'Login successful',
      employee: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        permissions,
      },
      accessToken,
      refreshToken,
      expiresIn: 28800, // 8 hours in seconds
    })
  } catch (error) {
    console.error('Staff login error:', error)
    return errorResponse('Login failed', 500)
  }
}

function getStaffPermissions(role: string): string[] {
  const permissions: Record<string, string[]> = {
    SUPER_ADMIN: ['*'],
    ADMIN: ['*'],
    MANAGER: [
      'dashboard.view',
      'orders.view', 'orders.update',
      'products.view', 'products.update',
      'customers.view',
      'reviews.view', 'reviews.moderate',
      'support.view', 'support.respond',
      'inventory.view', 'inventory.update',
      'returns.view', 'returns.process',
    ],
    ORDER_MANAGER: [
      'dashboard.view',
      'orders.view', 'orders.update', 'orders.ship',
      'customers.view',
      'returns.view', 'returns.process',
    ],
    PRODUCT_MANAGER: [
      'dashboard.view',
      'products.view', 'products.update',
      'inventory.view', 'inventory.update',
      'categories.view',
    ],
    SUPPORT_AGENT: [
      'dashboard.view',
      'orders.view',
      'customers.view',
      'reviews.view', 'reviews.moderate',
      'support.view', 'support.respond',
      'returns.view',
    ],
    STAFF: [
      'dashboard.view',
      'orders.view',
      'products.view',
      'customers.view',
    ],
  }

  return permissions[role] || []
}
