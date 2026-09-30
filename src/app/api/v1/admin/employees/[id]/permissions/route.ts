import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

// PATCH /api/v1/admin/employees/[id]/permissions - Update employee permissions
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { permissions } = body

    if (!permissions || !Array.isArray(permissions)) {
      return errorResponse('Permissions array is required', 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return notFoundResponse('Employee')
    }

    const staffRoles = ['STAFF', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'SUPPORT_AGENT', 'MANAGER', 'ADMIN']
    if (!staffRoles.includes(user.role)) {
      return errorResponse('Not an employee account', 400)
    }

    // Store custom permissions in metadata
    await prisma.user.update({
      where: { id: params.id },
      data: {
        metadata: {
          ...(user.metadata as any || {}),
          customPermissions: permissions,
          permissionsUpdatedAt: new Date().toISOString(),
        },
      },
    })

    return successResponse({
      message: 'Permissions updated',
      employeeId: user.id,
      permissions,
    })
  } catch (error) {
    console.error('Update permissions error:', error)
    return errorResponse('Failed to update permissions', 500)
  }
}

// GET /api/v1/admin/employees/[id]/permissions - Get employee permissions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return notFoundResponse('Employee')
    }

    const rolePermissions = getRolePermissions(user.role)
    const customPermissions = (user.metadata as any)?.customPermissions || []

    return successResponse({
      employeeId: user.id,
      role: user.role,
      rolePermissions,
      customPermissions,
      effectivePermissions: [...new Set([...rolePermissions, ...customPermissions])],
    })
  } catch (error) {
    console.error('Get permissions error:', error)
    return errorResponse('Failed to fetch permissions', 500)
  }
}

function getRolePermissions(role: string): string[] {
  const permissions: Record<string, string[]> = {
    SUPER_ADMIN: ['*'],
    ADMIN: [
      'dashboard.view', 'products.*', 'orders.*', 'customers.*',
      'categories.*', 'coupons.*', 'reviews.*', 'employees.*',
      'reports.*', 'settings.*', 'inventory.*',
    ],
    MANAGER: [
      'dashboard.view', 'orders.*', 'products.view', 'products.update',
      'customers.view', 'reviews.*', 'support.*', 'inventory.*', 'returns.*',
    ],
    ORDER_MANAGER: [
      'dashboard.view', 'orders.*', 'customers.view', 'returns.*',
    ],
    PRODUCT_MANAGER: [
      'dashboard.view', 'products.*', 'inventory.*', 'categories.view',
    ],
    SUPPORT_AGENT: [
      'dashboard.view', 'orders.view', 'customers.view', 'reviews.*', 'support.*',
    ],
    STAFF: [
      'dashboard.view', 'orders.view', 'products.view', 'customers.view',
    ],
  }

  return permissions[role] || []
}
