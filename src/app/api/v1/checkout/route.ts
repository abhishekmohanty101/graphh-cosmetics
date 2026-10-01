import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  return errorResponse('Checkout temporarily unavailable', 503)
}
