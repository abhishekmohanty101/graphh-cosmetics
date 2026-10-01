import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  return errorResponse('Token refresh not implemented', 501)
}
