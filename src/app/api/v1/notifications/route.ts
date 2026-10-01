import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET() { return successResponse({ notifications: [], unreadCount: 0 }) }
export async function PATCH() { return successResponse({ message: 'Notifications updated' }) }
