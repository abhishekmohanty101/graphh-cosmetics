import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  return successResponse({ message: 'If an account exists, a reset link will be sent.' })
}
