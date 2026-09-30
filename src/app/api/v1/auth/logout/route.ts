import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/v1/auth/logout - Customer logout
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // In JWT-based auth, client should discard tokens
    // For additional security, could maintain a blacklist in Redis

    return successResponse({
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return errorResponse('Logout failed', 500)
  }
}
