'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Phone,
  ShoppingBag,
  IndianRupee,
} from 'lucide-react'

// Mock customers data
const mockCustomers = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 9876543210',
    totalOrders: 12,
    totalSpent: 24999,
    lastOrder: '2024-01-15',
    status: 'active',
    createdAt: '2023-06-15',
  },
  {
    id: '2',
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    phone: '+91 9876543211',
    totalOrders: 8,
    totalSpent: 15899,
    lastOrder: '2024-01-12',
    status: 'active',
    createdAt: '2023-08-20',
  },
  {
    id: '3',
    name: 'Anjali Patel',
    email: 'anjali@example.com',
    phone: '+91 9876543212',
    totalOrders: 3,
    totalSpent: 5499,
    lastOrder: '2024-01-10',
    status: 'active',
    createdAt: '2023-11-05',
  },
  {
    id: '4',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '+91 9876543213',
    totalOrders: 1,
    totalSpent: 999,
    lastOrder: '2024-01-08',
    status: 'inactive',
    createdAt: '2024-01-08',
  },
  {
    id: '5',
    name: 'Neha Gupta',
    email: 'neha@example.com',
    phone: '+91 9876543214',
    totalOrders: 25,
    totalSpent: 58999,
    lastOrder: '2024-01-15',
    status: 'vip',
    createdAt: '2023-01-10',
  },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-700' },
  vip: { label: 'VIP', className: 'bg-purple-100 text-purple-700' },
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState(mockCustomers)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search)
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">{customers.length} customers total</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {customers.filter((c) => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">VIP Customers</p>
          <p className="text-2xl font-bold text-purple-600">
            {customers.filter((c) => c.status === 'vip').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="vip">VIP</option>
          </select>
        </div>
      </div>

      {/* Customers table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Orders
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Total Spent
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Member Since
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No customers found</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">ID: {customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-900">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        {customer.totalOrders}
                      </div>
                      <p className="text-xs text-gray-500">
                        Last: {formatDate(customer.lastOrder)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-medium text-gray-900">
                        <IndianRupee className="w-4 h-4" />
                        {customer.totalSpent.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusConfig[customer.status]?.className
                        }`}
                      >
                        {statusConfig[customer.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 inline-flex"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
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
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>
          <div className="flex items-center gap-2">
            <button disabled className="p-2 border border-gray-200 rounded-lg disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 bg-pink-600 text-white rounded-lg text-sm">1</button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
