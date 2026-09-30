import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/v1/admin/auth/login - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, otp } = body

    if (!email || !password) {
      return errorResponse('Email and password are required', 400)
    }

    // Find admin user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return errorResponse('Invalid credentials', 401)
    }

    // Check if user has admin role
    const adminRoles = ['ADMIN', 'SUPER_ADMIN']
    if (!adminRoles.includes(user.role)) {
      return errorResponse('Access denied. Admin privileges required.', 403)
    }

    // Check if account is active
    if (!user.isActive) {
      return errorResponse('Account is disabled. Contact support.', 403)
    }

    // Verify password
    if (!user.password) {
      return errorResponse('Password not set. Use password reset.', 400)
    }

    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401)
    }

    // For SUPER_ADMIN, require 2FA OTP (optional enhancement)
    // if (user.role === 'SUPER_ADMIN' && !otp) {
    //   return errorResponse('OTP required for super admin login', 400)
    // }

    // Generate admin access token (shorter expiry for security)
    const accessToken = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'admin',
      },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '4h' } // 4 hours for admin
    )

    const refreshToken = sign(
      {
        userId: user.id,
        type: 'admin_refresh',
      },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '1d' } // 1 day for refresh
    )

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Log admin login for audit
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'ADMIN_LOGIN',
          entityType: 'USER',
          entityId: user.id,
          metadata: {
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        },
      })
    } catch {
      // Audit log failure shouldn't block login
      console.error('Failed to create audit log')
    }

    // Get admin permissions based on role
    const permissions = getAdminPermissions(user.role)

    return successResponse({
      message: 'Login successful',
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        permissions,
      },
      accessToken,
      refreshToken,
      expiresIn: 14400, // 4 hours in seconds
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return errorResponse('Login failed', 500)
  }
}

function getAdminPermissions(role: string): string[] {
  const permissions: Record<string, string[]> = {
    SUPER_ADMIN: ['*'], // Full access
    ADMIN: [
      'dashboard.view',
      'products.view', 'products.create', 'products.update', 'products.delete',
      'orders.view', 'orders.update', 'orders.refund',
      'customers.view', 'customers.update',
      'categories.manage',
      'coupons.manage',
      'reviews.moderate',
      'employees.view', 'employees.create', 'employees.update',
      'reports.view',
      'settings.view', 'settings.update',
      'inventory.manage',
    ],
  }

  return permissions[role] || []
}
