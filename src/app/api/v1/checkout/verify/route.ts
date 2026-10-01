import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  return errorResponse('Payment verification temporarily unavailable', 503)
}
