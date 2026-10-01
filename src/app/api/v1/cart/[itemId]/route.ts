import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function PATCH(request: NextRequest) {
  return successResponse({ message: 'Item updated' })
}

export async function DELETE(request: NextRequest) {
  return successResponse({ message: 'Item removed' })
}
