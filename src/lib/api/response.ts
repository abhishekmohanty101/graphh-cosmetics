import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function successResponse<T>(data: T, pagination?: ApiResponse['pagination']): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(pagination && { pagination }),
  })
}

export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}

export function validationErrorResponse(error: ZodError): NextResponse {
  const errors: Record<string, string[]> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(err.message)
  })

  return NextResponse.json(
    { success: false, error: 'Validation failed', errors },
    { status: 400 }
  )
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  )
}

export function forbiddenResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Forbidden' },
    { status: 403 }
  )
}

export function notFoundResponse(resource: string = 'Resource'): NextResponse {
  return NextResponse.json(
    { success: false, error: `${resource} not found` },
    { status: 404 }
  )
}

export function serverErrorResponse(error: unknown): NextResponse {
  console.error('Server error:', error)
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}

// Pagination helper
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export function createPagination(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}
