import { UserRole } from '@prisma/client'

// Permission definitions
export const PERMISSIONS = {
  // Orders
  'orders.view': 'View orders',
  'orders.update': 'Update order status',
  'orders.cancel': 'Cancel orders',
  'orders.refund': 'Process refunds',
  'orders.export': 'Export orders',

  // Products
  'products.view': 'View products',
  'products.create': 'Create products',
  'products.update': 'Update products',
  'products.delete': 'Delete products',
  'products.inventory': 'Manage inventory',

  // Categories
  'categories.view': 'View categories',
  'categories.manage': 'Manage categories',

  // Customers
  'customers.view': 'View customers',
  'customers.update': 'Update customers',
  'customers.block': 'Block customers',

  // Reviews
  'reviews.view': 'View reviews',
  'reviews.moderate': 'Moderate reviews',

  // Coupons
  'coupons.view': 'View coupons',
  'coupons.manage': 'Manage coupons',

  // Employees
  'employees.view': 'View employees',
  'employees.manage': 'Manage employees',

  // Settings
  'settings.view': 'View settings',
  'settings.update': 'Update settings',

  // Reports
  'reports.view': 'View reports',
  'reports.export': 'Export reports',

  // Support
  'support.view': 'View support tickets',
  'support.respond': 'Respond to tickets',

  // Banners
  'banners.view': 'View banners',
  'banners.manage': 'Manage banners',

  // Audit
  'audit.view': 'View audit logs',
} as const

export type Permission = keyof typeof PERMISSIONS

// Role -> Permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  CUSTOMER: [],

  EMPLOYEE: [
    'orders.view',
    'products.view',
    'customers.view',
  ],

  ORDER_MANAGER: [
    'orders.view',
    'orders.update',
    'orders.cancel',
    'orders.refund',
    'orders.export',
    'products.view',
    'customers.view',
    'support.view',
    'support.respond',
  ],

  PRODUCT_MANAGER: [
    'products.view',
    'products.create',
    'products.update',
    'products.delete',
    'products.inventory',
    'categories.view',
    'categories.manage',
    'orders.view',
    'banners.view',
    'banners.manage',
  ],

  SUPPORT_AGENT: [
    'orders.view',
    'customers.view',
    'reviews.view',
    'reviews.moderate',
    'support.view',
    'support.respond',
  ],

  ADMIN: [
    'orders.view',
    'orders.update',
    'orders.cancel',
    'orders.refund',
    'orders.export',
    'products.view',
    'products.create',
    'products.update',
    'products.delete',
    'products.inventory',
    'categories.view',
    'categories.manage',
    'customers.view',
    'customers.update',
    'reviews.view',
    'reviews.moderate',
    'coupons.view',
    'coupons.manage',
    'settings.view',
    'reports.view',
    'reports.export',
    'support.view',
    'support.respond',
    'banners.view',
    'banners.manage',
  ],

  SUPER_ADMIN: Object.keys(PERMISSIONS) as Permission[],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  if (role === 'SUPER_ADMIN') return true
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Check if a role has any of the given permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

/**
 * Check if a role has all of the given permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p))
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  if (role === 'SUPER_ADMIN') return Object.keys(PERMISSIONS) as Permission[]
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if role is staff (employee, admin, etc.)
 */
export function isStaffRole(role: UserRole): boolean {
  return role !== 'CUSTOMER'
}

/**
 * Check if role is admin level
 */
export function isAdminRole(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}
