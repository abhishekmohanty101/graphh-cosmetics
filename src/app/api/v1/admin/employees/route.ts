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
  getPaginationParams,
  createPagination,
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

// GET /api/v1/admin/employees - List all employees
export async function GET(request: NextRequest) {
  try {
    const access = await checkSuperAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const search = searchParams.get('search')
    const role = searchParams.get('role')

    const staffRoles = ['ADMIN', 'MANAGER', 'STAFF', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'SUPPORT_AGENT']
    
    const where: any = {
      role: { in: staffRoles },
    }

    if (role && staffRoles.includes(role)) {
      where.role = role
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [employees, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          lastLogin: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    const transformedEmployees = employees.map((emp) => ({
      id: emp.id,
      email: emp.email,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email,
      firstName: emp.firstName,
      lastName: emp.lastName,
      phone: emp.phone,
      avatar: emp.avatar,
      role: emp.role,
      isActive: emp.isVerified,
      createdAt: emp.createdAt,
      lastLogin: emp.lastLogin,
    }))

    return successResponse(
      { employees: transformedEmployees },
      createPagination(page, limit, total)
    )
  } catch (error) {
    console.error('Get employees error:', error)
    return errorResponse('Failed to fetch employees', 500)
  }
}

// POST /api/v1/admin/employees - Create employee
export async function POST(request: NextRequest) {
  try {
    const access = await checkSuperAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const body = await request.json()
    const { email, firstName, lastName, phone, role, password } = body

    if (!email || !role) {
      return errorResponse('Email and role are required', 400)
    }

    // Validate role
    const validRoles = ['ADMIN', 'MANAGER', 'STAFF', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'SUPPORT_AGENT']
    if (!validRoles.includes(role)) {
      return errorResponse('Invalid role', 400)
    }

    // Only SUPER_ADMIN can create ADMIN
    if (role === 'ADMIN' && access.role !== 'SUPER_ADMIN') {
      return errorResponse('Only Super Admin can create Admin users', 403)
    }

    // Check if email exists
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return errorResponse('Email already registered', 400)
    }

    // Generate temporary password if not provided
    const tempPassword = password || Math.random().toString(36).slice(-8) + 'A1!'
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    const employee = await prisma.user.create({
      data: {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        role,
        passwordHash: hashedPassword,
        isVerified: true, // Employees are pre-verified
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    // TODO: Send email with temporary password

    return successResponse({
      message: 'Employee created successfully',
      employee,
      temporaryPassword: password ? undefined : tempPassword, // Only return if auto-generated
    })
  } catch (error) {
    console.error('Create employee error:', error)
    return errorResponse('Failed to create employee', 500)
  }
}
