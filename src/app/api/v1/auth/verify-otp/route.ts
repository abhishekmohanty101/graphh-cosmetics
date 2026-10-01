import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  return successResponse({ message: 'OTP verification coming soon' })
}
