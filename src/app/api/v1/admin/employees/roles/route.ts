import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/admin/employees/roles - Get available roles
export async function GET(request: NextRequest) {
  try {
    const roles = [
      {
        id: 'SUPER_ADMIN',
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: ['*'],
        level: 1,
      },
      {
        id: 'ADMIN',
        name: 'Admin',
        description: 'Administrative access to manage the store',
        permissions: [
          'dashboard.view', 'products.*', 'orders.*', 'customers.*',
          'categories.*', 'coupons.*', 'reviews.*', 'employees.view',
          'employees.create', 'employees.update', 'reports.*', 'settings.*',
        ],
        level: 2,
      },
      {
        id: 'MANAGER',
        name: 'Manager',
        description: 'Manage orders, products, and staff',
        permissions: [
          'dashboard.view', 'orders.*', 'products.view', 'products.update',
          'customers.view', 'reviews.*', 'support.*', 'inventory.*', 'returns.*',
        ],
        level: 3,
      },
      {
        id: 'ORDER_MANAGER',
        name: 'Order Manager',
        description: 'Manage orders and shipments',
        permissions: [
          'dashboard.view', 'orders.view', 'orders.update', 'orders.ship',
          'orders.refund', 'customers.view', 'returns.*',
        ],
        level: 4,
      },
      {
        id: 'PRODUCT_MANAGER',
        name: 'Product Manager',
        description: 'Manage products and inventory',
        permissions: [
          'dashboard.view', 'products.view', 'products.create', 'products.update',
          'inventory.*', 'categories.view',
        ],
        level: 4,
      },
      {
        id: 'SUPPORT_AGENT',
        name: 'Support Agent',
        description: 'Handle customer support and reviews',
        permissions: [
          'dashboard.view', 'orders.view', 'customers.view',
          'reviews.view', 'reviews.moderate', 'support.*',
        ],
        level: 5,
      },
      {
        id: 'STAFF',
        name: 'Staff',
        description: 'Basic view-only access',
        permissions: [
          'dashboard.view', 'orders.view', 'products.view', 'customers.view',
        ],
        level: 6,
      },
    ]

    const allPermissions = [
      { key: 'dashboard.view', description: 'View dashboard', category: 'Dashboard' },
      { key: 'products.view', description: 'View products', category: 'Products' },
      { key: 'products.create', description: 'Create products', category: 'Products' },
      { key: 'products.update', description: 'Update products', category: 'Products' },
      { key: 'products.delete', description: 'Delete products', category: 'Products' },
      { key: 'orders.view', description: 'View orders', category: 'Orders' },
      { key: 'orders.update', description: 'Update order status', category: 'Orders' },
      { key: 'orders.ship', description: 'Create shipments', category: 'Orders' },
      { key: 'orders.refund', description: 'Process refunds', category: 'Orders' },
      { key: 'customers.view', description: 'View customers', category: 'Customers' },
      { key: 'customers.update', description: 'Update customers', category: 'Customers' },
      { key: 'customers.block', description: 'Block customers', category: 'Customers' },
      { key: 'categories.view', description: 'View categories', category: 'Categories' },
      { key: 'categories.manage', description: 'Manage categories', category: 'Categories' },
      { key: 'coupons.view', description: 'View coupons', category: 'Coupons' },
      { key: 'coupons.manage', description: 'Manage coupons', category: 'Coupons' },
      { key: 'reviews.view', description: 'View reviews', category: 'Reviews' },
      { key: 'reviews.moderate', description: 'Moderate reviews', category: 'Reviews' },
      { key: 'support.view', description: 'View support tickets', category: 'Support' },
      { key: 'support.respond', description: 'Respond to tickets', category: 'Support' },
      { key: 'inventory.view', description: 'View inventory', category: 'Inventory' },
      { key: 'inventory.update', description: 'Update inventory', category: 'Inventory' },
      { key: 'returns.view', description: 'View returns', category: 'Returns' },
      { key: 'returns.process', description: 'Process returns', category: 'Returns' },
      { key: 'employees.view', description: 'View employees', category: 'Employees' },
      { key: 'employees.create', description: 'Create employees', category: 'Employees' },
      { key: 'employees.update', description: 'Update employees', category: 'Employees' },
      { key: 'reports.view', description: 'View reports', category: 'Reports' },
      { key: 'settings.view', description: 'View settings', category: 'Settings' },
      { key: 'settings.update', description: 'Update settings', category: 'Settings' },
    ]

    return successResponse({
      roles,
      allPermissions,
    })
  } catch (error) {
    console.error('Get roles error:', error)
    return errorResponse('Failed to fetch roles', 500)
  }
}
