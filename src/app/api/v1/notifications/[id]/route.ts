import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function PATCH() { return successResponse({ message: 'Notification read' }) }
export async function DELETE() { return successResponse({ message: 'Notification deleted' }) }
