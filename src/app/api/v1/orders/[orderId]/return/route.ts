import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET() { return successResponse({ returnRequest: null }) }
export async function POST() { return successResponse({ message: 'Return requests coming soon' }) }
