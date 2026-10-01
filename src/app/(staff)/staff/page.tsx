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
  Loader2,
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  customer: { name: string; email: string }
  itemCount: number
  total: number
  status: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
}

export default function StaffDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    totalOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/v1/admin/orders?limit=10')
      const data = await res.json()
      if (data.success) {
        const orders = data.data.orders
        setRecentOrders(orders.slice(0, 5))
        setStats({
          pendingOrders: orders.filter((o: Order) => o.status === 'PENDING').length,
          processingOrders: orders.filter((o: Order) => ['CONFIRMED', 'PROCESSING'].includes(o.status)).length,
          shippedOrders: orders.filter((o: Order) => o.status === 'SHIPPED').length,
          totalOrders: data.pagination?.total || orders.length,
        })
      }
    } catch (err) {
      console.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins} min ago`
    const diffHours = Math.floor(diffMs / 3600000)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-500">Overview of today's activities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.processingOrders}</p>
              <p className="text-sm text-gray-500">Processing</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TruckIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.shippedOrders}</p>
              <p className="text-sm text-gray-500">Shipped</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/staff/orders" className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders yet</div>
        ) : (
          <div className="divide-y">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/staff/orders/${order.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">#{order.orderNumber || order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">{order.customer.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{order.total.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/staff/orders" className="bg-white p-4 rounded-xl shadow-sm border hover:border-pink-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <p className="font-semibold">Manage Orders</p>
            <p className="text-sm text-gray-500">Process and ship orders</p>
          </div>
        </Link>
        <Link href="/staff/inventory" className="bg-white p-4 rounded-xl shadow-sm border hover:border-pink-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold">Check Inventory</p>
            <p className="text-sm text-gray-500">View stock levels</p>
          </div>
        </Link>
        <Link href="/staff/support" className="bg-white p-4 rounded-xl shadow-sm border hover:border-pink-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold">Support Tickets</p>
            <p className="text-sm text-gray-500">Handle customer queries</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
