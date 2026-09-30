'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react'

// Mock data - will be replaced with API calls
const stats = [
  {
    name: 'Total Revenue',
    value: '₹12,45,890',
    change: '+12.5%',
    trend: 'up',
    icon: IndianRupee,
    color: 'bg-green-500',
  },
  {
    name: 'Orders',
    value: '1,234',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'bg-blue-500',
  },
  {
    name: 'Customers',
    value: '8,567',
    change: '+5.3%',
    trend: 'up',
    icon: Users,
    color: 'bg-purple-500',
  },
  {
    name: 'Products',
    value: '456',
    change: '-2.1%',
    trend: 'down',
    icon: Package,
    color: 'bg-orange-500',
  },
]

const recentOrders = [
  {
    id: 'GCM8X9K2',
    customer: 'Priya Sharma',
    email: 'priya@example.com',
    amount: '₹2,499',
    status: 'Processing',
    date: '2 min ago',
  },
  {
    id: 'GCL7Y3N1',
    customer: 'Rahul Verma',
    email: 'rahul@example.com',
    amount: '₹1,899',
    status: 'Shipped',
    date: '15 min ago',
  },
  {
    id: 'GCK5T8M4',
    customer: 'Anjali Patel',
    email: 'anjali@example.com',
    amount: '₹3,299',
    status: 'Delivered',
    date: '1 hour ago',
  },
  {
    id: 'GCJ2W6P9',
    customer: 'Vikram Singh',
    email: 'vikram@example.com',
    amount: '₹999',
    status: 'Pending',
    date: '2 hours ago',
  },
  {
    id: 'GCI9R4Q7',
    customer: 'Neha Gupta',
    email: 'neha@example.com',
    amount: '₹4,599',
    status: 'Processing',
    date: '3 hours ago',
  },
]

const topProducts = [
  { name: 'Rose Glow Serum', sold: 234, revenue: '₹2,34,000', stock: 45 },
  { name: 'Vitamin C Moisturizer', sold: 189, revenue: '₹1,89,000', stock: 32 },
  { name: 'Hyaluronic Acid Cream', sold: 156, revenue: '₹1,56,000', stock: 67 },
  { name: 'Niacinamide Toner', sold: 134, revenue: '₹1,34,000', stock: 12 },
  { name: 'Retinol Night Cream', sold: 98, revenue: '₹98,000', stock: 89 },
]

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.customer}</p>
                    <p className="text-sm text-gray-500">{order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{order.amount}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Sold</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.map((product, idx) => (
                  <tr key={idx} className="text-sm">
                    <td className="py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="py-3 text-gray-600">{product.sold}</td>
                    <td className="py-3 text-gray-600">{product.revenue}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          product.stock < 20
                            ? 'bg-red-100 text-red-700'
                            : product.stock < 50
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products/new"
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors"
          >
            <Package className="w-8 h-8 text-pink-600" />
            <span className="text-sm font-medium">Add Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors"
          >
            <ShoppingCart className="w-8 h-8 text-pink-600" />
            <span className="text-sm font-medium">View Orders</span>
          </Link>
          <Link
            href="/admin/customers"
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors"
          >
            <Users className="w-8 h-8 text-pink-600" />
            <span className="text-sm font-medium">Customers</span>
          </Link>
          <Link
            href="/admin/reviews"
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors"
          >
            <Star className="w-8 h-8 text-pink-600" />
            <span className="text-sm font-medium">Reviews</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
