import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getPaginationParams, createPagination } from '@/lib/api/response'

// GET /api/v1/admin/audit-logs - Get audit logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const entityType = searchParams.get('entityType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (action) {
      where.action = action
    }

    if (entityType) {
      where.entityType = entityType
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    // Get action types for filtering
    const actionTypes = await prisma.auditLog.groupBy({
      by: ['action'],
      _count: true,
    })

    // Get entity types for filtering
    const entityTypes = await prisma.auditLog.groupBy({
      by: ['entity'],
      _count: true,
    })

    return successResponse({
      logs,
      filters: {
        actions: actionTypes.map((a) => ({ action: a.action, count: a._count })),
        entityTypes: entityTypes.map((e) => ({ type: e.entity, count: e._count })),
      },
      pagination: createPagination(page, limit, total),
    })
  } catch (error) {
    console.error('Get audit logs error:', error)
    return errorResponse('Failed to fetch audit logs', 500)
  }
}
