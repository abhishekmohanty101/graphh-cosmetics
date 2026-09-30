'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  TruckIcon,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

// Mock data
const stats = {
  pendingOrders: 12,
  processingOrders: 8,
  shippedToday: 15,
  lowStockItems: 5,
}

const recentOrders = [
  {
    id: 'GCM8X9K2',
    customer: 'Priya Sharma',
    items: 3,
    total: 2499,
    status: 'PENDING',
    date: '5 min ago',
  },
  {
    id: 'GCL7Y3N1',
    customer: 'Rahul Verma',
    items: 2,
    total: 1899,
    status: 'PROCESSING',
    date: '15 min ago',
  },
  {
    id: 'GCK5T8M4',
    customer: 'Anjali Patel',
    items: 5,
    total: 3299,
    status: 'PROCESSING',
    date: '30 min ago',
  },
  {
    id: 'GCJ2W6P9',
    customer: 'Vikram Singh',
    items: 1,
    total: 999,
    status: 'PENDING',
    date: '1 hour ago',
  },
]

const lowStockProducts = [
  { name: 'Rose Glow Serum', sku: 'GC-SRM-001', stock: 5, threshold: 10 },
  { name: 'Niacinamide Toner', sku: 'GC-TNR-003', stock: 8, threshold: 15 },
  { name: 'Vitamin C Moisturizer', sku: 'GC-MST-002', stock: 3, threshold: 10 },
]

const pendingSupport = [
  { id: 'TKT-001', subject: 'Order not received', customer: 'Amit Kumar', priority: 'HIGH' },
  { id: 'TKT-002', subject: 'Wrong product delivered', customer: 'Sneha Roy', priority: 'MEDIUM' },
]

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  PENDING: { color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  PROCESSING: { color: 'text-blue-600 bg-blue-100', icon: Package },
}

export default function StaffDashboard() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what needs your attention.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              <p className="text-sm text-gray-500">Pending Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.processingOrders}</p>
              <p className="text-sm text-gray-500">Processing</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TruckIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.shippedToday}</p>
              <p className="text-sm text-gray-500">Shipped Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
              <p className="text-sm text-gray-500">Low Stock Items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Orders to Process</h2>
            <Link
              href="/staff/orders"
              className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock
              return (
                <Link
                  key={order.id}
                  href={`/staff/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">#{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer} • {order.items} items</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusConfig[order.status]?.color
                      }`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {order.status}
                    </span>
                    <span className="text-sm text-gray-500">{order.date}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            <Link
              href="/staff/inventory"
              className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStockProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{product.stock}</p>
                  <p className="text-xs text-gray-500">Min: {product.threshold}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support Tickets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Pending Support Tickets</h2>
          <Link
            href="/staff/support"
            className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {pendingSupport.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/staff/support/${ticket.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{ticket.subject}</p>
                <p className="text-sm text-gray-500">{ticket.customer} • {ticket.id}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  ticket.priority === 'HIGH'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {ticket.priority}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
