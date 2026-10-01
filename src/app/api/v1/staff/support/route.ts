import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET() { return successResponse({ message: 'Coming soon' }) }
export async function POST() { return successResponse({ message: 'Coming soon' }) }
export async function PATCH() { return successResponse({ message: 'Coming soon' }) }
export async function PUT() { return successResponse({ message: 'Coming soon' }) }
export async function DELETE() { return successResponse({ message: 'Coming soon' }) }
