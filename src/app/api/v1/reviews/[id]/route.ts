import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET() { return successResponse({ review: null }) }
export async function PATCH() { return successResponse({ message: 'Review updated' }) }
export async function DELETE() { return successResponse({ message: 'Review deleted' }) }
