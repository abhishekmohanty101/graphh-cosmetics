import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  return successResponse({ items: [], subtotal: 0, itemCount: 0 })
}

export async function POST(request: NextRequest) {
  return successResponse({ message: 'Item added to cart' })
}

export async function DELETE(request: NextRequest) {
  return successResponse({ message: 'Cart cleared' })
}
