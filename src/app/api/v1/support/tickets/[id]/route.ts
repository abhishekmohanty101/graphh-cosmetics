import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET() { return successResponse({ ticket: null }) }
export async function PATCH() { return successResponse({ message: 'Ticket updated' }) }
export async function POST() { return successResponse({ message: 'Message added' }) }
