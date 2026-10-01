import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function DELETE() { return successResponse({ message: 'Item removed from wishlist' }) }
