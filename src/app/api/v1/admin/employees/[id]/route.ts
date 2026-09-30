import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api/response'

async function checkSuperAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user, role: user.role }
}

// GET /api/v1/admin/employees/[id] - Get employee details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkSuperAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const employee = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    })

    if (!employee) {
      return notFoundResponse('Employee')
    }

    // Check if user is actually staff
    const staffRoles = ['ADMIN', 'MANAGER', 'STAFF', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'SUPPORT_AGENT']
    if (!staffRoles.includes(employee.role)) {
      return notFoundResponse('Employee')
    }

    return successResponse({ employee })
  } catch (error) {
    console.error('Get employee error:', error)
    return errorResponse('Failed to fetch employee', 500)
  }
}

// PUT /api/v1/admin/employees/[id] - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkSuperAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const body = await request.json()
    const { firstName, lastName, phone, role, password, isActive } = body

    const employee = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!employee) {
      return notFoundResponse('Employee')
    }

    // Check if user is actually staff
    const staffRoles = ['ADMIN', 'MANAGER', 'STAFF', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'SUPPORT_AGENT']
    if (!staffRoles.includes(employee.role)) {
      return notFoundResponse('Employee')
    }

    // Only SUPER_ADMIN can modify ADMIN
    if (employee.role === 'ADMIN' && access.role !== 'SUPER_ADMIN') {
      return errorResponse('Only Super Admin can modify Admin users', 403)
    }

    // Validate role change
    if (role && !staffRoles.includes(role)) {
      return errorResponse('Invalid role', 400)
    }

    // Only SUPER_ADMIN can promote to ADMIN
    if (role === 'ADMIN' && access.role !== 'SUPER_ADMIN') {
      return errorResponse('Only Super Admin can assign Admin role', 403)
    }

    const updateData: any = {
      firstName: firstName !== undefined ? firstName : employee.firstName,
      lastName: lastName !== undefined ? lastName : employee.lastName,
      phone: phone !== undefined ? phone : employee.phone,
    }

    if (role) {
      updateData.role = role
    }

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12)
    }

    if (isActive !== undefined) {
      updateData.isVerified = isActive
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isVerified: true,
      },
    })

    return successResponse({
      message: 'Employee updated successfully',
      employee: updated,
    })
  } catch (error) {
    console.error('Update employee error:', error)
    return errorResponse('Failed to update employee', 500)
  }
}

// DELETE /api/v1/admin/employees/[id] - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkSuperAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const employee = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!employee) {
      return notFoundResponse('Employee')
    }

    // Can't delete yourself
    if (params.id === access.user.id) {
      return errorResponse("You cannot delete your own account", 400)
    }

    // Only SUPER_ADMIN can delete ADMIN
    if (employee.role === 'ADMIN' && access.role !== 'SUPER_ADMIN') {
      return errorResponse('Only Super Admin can delete Admin users', 403)
    }

    // Soft delete - deactivate instead of deleting
    await prisma.user.update({
      where: { id: params.id },
      data: {
        isVerified: false,
        email: `deleted_${Date.now()}_${employee.email}`, // Prevent email reuse
      },
    })

    return successResponse({
      message: 'Employee deactivated successfully',
    })
  } catch (error) {
    console.error('Delete employee error:', error)
    return errorResponse('Failed to delete employee', 500)
  }
}
