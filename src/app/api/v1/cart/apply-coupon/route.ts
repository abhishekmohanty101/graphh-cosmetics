import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  return successResponse({ discount: 0, message: 'Coupon feature coming soon' })
}
