'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  Package,
  AlertTriangle,
  Filter,
  Eye,
  Edit,
  ChevronDown,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  inventory: number
  images: { url: string }[]
  category: { name: string }
  isActive: boolean
  lowStock: boolean
  outOfStock: boolean
}

export default function StaffProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [search, filter, page])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      })
      if (search) params.set('search', search)
      if (filter === 'low') params.set('lowStock', 'true')
      if (filter === 'out') params.set('outOfStock', 'true')

      const res = await fetch(`/api/v1/staff/inventory?${params}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data.products)
      }
    } catch (err) {
      console.error('Failed to fetch products')
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

  const getStockStatus = (product: Product) => {
    if (product.inventory === 0) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Out of Stock</span>
    }
    if (product.inventory <= 10) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Low Stock</span>
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">In Stock</span>
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600">View product information and inventory</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                filter === 'low'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Low Stock
            </button>
            <button
              onClick={() => setFilter('out')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'out'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No products found</h2>
          <p className="text-gray-600">Try a different search or filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold">Product</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold">SKU</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold">Category</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold">Price</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold">Stock</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold">Status</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0].url || '/images/placeholder.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{product.name}</p>
                          <p className={`text-sm ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-semibold ${
                        product.inventory === 0 ? 'text-red-600' :
                        product.inventory <= 10 ? 'text-yellow-600' : 'text-gray-900'
                      }`}>
                        {product.inventory}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStockStatus(product)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/staff/inventory/${product.id}`}
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
