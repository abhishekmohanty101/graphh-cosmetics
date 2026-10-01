import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET() { return successResponse({ preferences: {} }) }
export async function PATCH() { return successResponse({ message: 'Preferences updated' }) }
