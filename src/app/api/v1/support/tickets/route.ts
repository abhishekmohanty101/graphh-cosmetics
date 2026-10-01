import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET() { return successResponse({ tickets: [] }) }
export async function POST() { return successResponse({ message: 'Ticket created' }) }
