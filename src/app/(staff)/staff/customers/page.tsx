'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Eye, Mail, Phone, ShoppingBag, Calendar } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  ordersCount: number
  totalSpent: number
  createdAt: string
  lastOrderAt: string | null
}

export default function StaffCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchCustomers()
  }, [search, page])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      })
      if (search) params.set('search', search)

      const res = await fetch(`/api/v1/staff/customers?${params}`)
      const data = await res.json()
      if (data.success) {
        setCustomers(data.data.customers)
      }
    } catch (err) {
      console.error('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customer Lookup</h1>
          <p className="text-gray-600">Search and view customer information</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No customers found</h2>
          <p className="text-gray-600">Try a different search term</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold">Customer</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold">Contact</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold">Orders</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold">Total Spent</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold">Last Order</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-pink-600">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-500">
                            Since {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        <ShoppingBag className="w-4 h-4" />
                        {customer.ordersCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4">
                      {customer.lastOrderAt ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(customer.lastOrderAt).toLocaleDateString('en-IN')}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/staff/customers/${customer.id}`}
                        className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
