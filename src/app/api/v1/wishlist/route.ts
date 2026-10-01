import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET() { return successResponse({ items: [] }) }
export async function POST() { return successResponse({ message: 'Item added to wishlist' }) }
export async function DELETE() { return successResponse({ message: 'Wishlist cleared' }) }
