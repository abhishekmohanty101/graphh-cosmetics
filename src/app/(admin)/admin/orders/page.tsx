'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Download,
  Printer,
} from 'lucide-react'

// Mock orders data
const mockOrders = [
  {
    id: 'GCM8X9K2',
    customer: { name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543210' },
    items: 3,
    total: 2499,
    status: 'PROCESSING',
    paymentStatus: 'PAID',
    paymentMethod: 'Razorpay',
    date: '2024-01-15T10:30:00',
    shippingAddress: 'Mumbai, Maharashtra',
  },
  {
    id: 'GCL7Y3N1',
    customer: { name: 'Rahul Verma', email: 'rahul@example.com', phone: '9876543211' },
    items: 2,
    total: 1899,
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    paymentMethod: 'Razorpay',
    date: '2024-01-15T09:15:00',
    shippingAddress: 'Delhi, Delhi',
  },
  {
    id: 'GCK5T8M4',
    customer: { name: 'Anjali Patel', email: 'anjali@example.com', phone: '9876543212' },
    items: 5,
    total: 3299,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'COD',
    date: '2024-01-14T16:45:00',
    shippingAddress: 'Bangalore, Karnataka',
  },
  {
    id: 'GCJ2W6P9',
    customer: { name: 'Vikram Singh', email: 'vikram@example.com', phone: '9876543213' },
    items: 1,
    total: 999,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    paymentMethod: 'COD',
    date: '2024-01-15T11:00:00',
    shippingAddress: 'Chennai, Tamil Nadu',
  },
  {
    id: 'GCI9R4Q7',
    customer: { name: 'Neha Gupta', email: 'neha@example.com', phone: '9876543214' },
    items: 4,
    total: 4599,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: 'Razorpay',
    date: '2024-01-15T08:20:00',
    shippingAddress: 'Hyderabad, Telangana',
  },
  {
    id: 'GCH3P1R8',
    customer: { name: 'Amit Kumar', email: 'amit@example.com', phone: '9876543215' },
    items: 2,
    total: 1599,
    status: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    paymentMethod: 'Razorpay',
    date: '2024-01-13T14:30:00',
    shippingAddress: 'Pune, Maharashtra',
  },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'Processing', className: 'bg-indigo-100 text-indigo-800' },
  SHIPPED: { label: 'Shipped', className: 'bg-purple-100 text-purple-800' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', className: 'bg-cyan-100 text-cyan-800' },
  DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  RETURNED: { label: 'Returned', className: 'bg-gray-100 text-gray-800' },
}

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'text-yellow-600' },
  PAID: { label: 'Paid', className: 'text-green-600' },
  FAILED: { label: 'Failed', className: 'text-red-600' },
  REFUNDED: { label: 'Refunded', className: 'text-gray-600' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all')
  const [dateRange, setDateRange] = useState('all')

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    const matchesPayment = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus
    return matchesSearch && matchesStatus && matchesPayment
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500">{orders.length} orders total</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter((o) => o.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Processing</p>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter((o) => ['CONFIRMED', 'PROCESSING'].includes(o.status)).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Shipped</p>
          <p className="text-2xl font-bold text-purple-600">
            {orders.filter((o) => ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter((o) => o.status === 'DELIVERED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Payment status filter */}
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Payment Status</option>
            <option value="PENDING">Payment Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          {/* Date range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Orders table */}
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-pink-600 hover:text-pink-700"
                      >
                        #{order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.items} items</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">₹{order.total.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${
                          paymentStatusConfig[order.paymentStatus]?.className
                        }`}
                      >
                        {paymentStatusConfig[order.paymentStatus]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusConfig[order.status]?.className
                        }`}
                      >
                        {statusConfig[order.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing 1 to {filteredOrders.length} of {orders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 bg-pink-600 text-white rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
              2
            </button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
