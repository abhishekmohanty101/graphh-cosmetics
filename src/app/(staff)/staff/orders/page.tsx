'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  Package,
  Truck,
  CheckCircle,
  Filter,
} from 'lucide-react'

// Mock orders data
const mockOrders = [
  {
    id: 'GCM8X9K2',
    customer: { name: 'Priya Sharma', phone: '9876543210' },
    items: 3,
    total: 2499,
    status: 'PENDING',
    paymentMethod: 'Razorpay',
    paymentStatus: 'PAID',
    date: '2024-01-15T10:30:00',
    address: 'Mumbai, Maharashtra',
  },
  {
    id: 'GCL7Y3N1',
    customer: { name: 'Rahul Verma', phone: '9876543211' },
    items: 2,
    total: 1899,
    status: 'PROCESSING',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    date: '2024-01-15T09:15:00',
    address: 'Delhi, Delhi',
  },
  {
    id: 'GCK5T8M4',
    customer: { name: 'Anjali Patel', phone: '9876543212' },
    items: 5,
    total: 3299,
    status: 'PROCESSING',
    paymentMethod: 'Razorpay',
    paymentStatus: 'PAID',
    date: '2024-01-14T16:45:00',
    address: 'Bangalore, Karnataka',
  },
  {
    id: 'GCJ2W6P9',
    customer: { name: 'Vikram Singh', phone: '9876543213' },
    items: 1,
    total: 999,
    status: 'SHIPPED',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    date: '2024-01-15T11:00:00',
    address: 'Chennai, Tamil Nadu',
  },
  {
    id: 'GCI9R4Q7',
    customer: { name: 'Neha Gupta', phone: '9876543214' },
    items: 4,
    total: 4599,
    status: 'DELIVERED',
    paymentMethod: 'Razorpay',
    paymentStatus: 'PAID',
    date: '2024-01-13T08:20:00',
    address: 'Hyderabad, Telangana',
  },
]

const statusConfig: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { label: 'Processing', className: 'bg-blue-100 text-blue-800', icon: Package },
  SHIPPED: { label: 'Shipped', className: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-800', icon: CheckCircle },
}

const statusTabs = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export default function StaffOrdersPage() {
  const [orders] = useState(mockOrders)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('ALL')

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.phone.includes(search)
    const matchesStatus = activeTab === 'ALL' || order.status === activeTab
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getTabCount = (status: string) => {
    if (status === 'ALL') return orders.length
    return orders.filter((o) => o.status === status).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500">Manage and process customer orders</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === status
                ? 'bg-cyan-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {status === 'ALL' ? 'All' : statusConfig[status]?.label}
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
              {getTabCount(status)}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status]?.icon || Clock
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/staff/orders/${order.id}`}
                          className="font-medium text-cyan-600 hover:text-cyan-700"
                        >
                          #{order.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{order.customer.name}</p>
                          <p className="text-sm text-gray-500">{order.address}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.items}</td>
                      <td className="px-4 py-3 font-medium">₹{order.total.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm">{order.paymentMethod}</p>
                          <p
                            className={`text-xs ${
                              order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                            }`}
                          >
                            {order.paymentStatus}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            statusConfig[order.status]?.className
                          }`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[order.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.date)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/staff/orders/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700"
                        >
                          <Eye className="w-4 h-4" />
                          Process
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <button disabled className="p-2 border border-gray-200 rounded-lg disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 bg-cyan-600 text-white rounded-lg text-sm">1</button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
