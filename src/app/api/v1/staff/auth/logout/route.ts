import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'

// POST /api/v1/staff/auth/logout - Staff logout
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    // In a JWT-based system, client should discard the token
    // For additional security, you could maintain a token blacklist in Redis

    return successResponse({
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Staff logout error:', error)
    return errorResponse('Logout failed', 500)
  }
}
