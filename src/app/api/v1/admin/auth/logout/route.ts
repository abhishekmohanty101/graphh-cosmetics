import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'

// POST /api/v1/admin/auth/logout - Admin logout
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    // Log admin logout for audit
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'ADMIN_LOGOUT',
          entity: 'USER',
          entityId: session.user.id,
        },
      })
    } catch {
      console.error('Failed to create audit log')
    }

    // In a JWT-based system, client should discard the token
    // For additional security, you could maintain a token blacklist in Redis

    return successResponse({
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Admin logout error:', error)
    return errorResponse('Logout failed', 500)
  }
}
