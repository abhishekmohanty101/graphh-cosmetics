import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET() {
  return successResponse({ tracking: null, message: 'Tracking coming soon' })
}
