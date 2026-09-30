'use client'

import { useState } from 'react'
import {
  Search,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Save,
  Filter,
} from 'lucide-react'

// Mock inventory data
const mockProducts = [
  {
    id: '1',
    name: 'Rose Glow Serum',
    sku: 'GC-SRM-001',
    category: 'Serums',
    stock: 45,
    lowStockThreshold: 20,
    location: 'Rack A-12',
    lastUpdated: '2024-01-15T10:30:00',
  },
  {
    id: '2',
    name: 'Vitamin C Moisturizer',
    sku: 'GC-MST-002',
    category: 'Moisturizers',
    stock: 8,
    lowStockThreshold: 15,
    location: 'Rack B-05',
    lastUpdated: '2024-01-14T14:20:00',
  },
  {
    id: '3',
    name: 'Niacinamide Toner',
    sku: 'GC-TNR-003',
    category: 'Toners',
    stock: 5,
    lowStockThreshold: 10,
    location: 'Rack A-08',
    lastUpdated: '2024-01-15T09:15:00',
  },
  {
    id: '4',
    name: 'Hyaluronic Acid Cream',
    sku: 'GC-CRM-004',
    category: 'Creams',
    stock: 32,
    lowStockThreshold: 15,
    location: 'Rack C-03',
    lastUpdated: '2024-01-13T16:45:00',
  },
  {
    id: '5',
    name: 'Retinol Night Cream',
    sku: 'GC-NTC-005',
    category: 'Night Care',
    stock: 0,
    lowStockThreshold: 10,
    location: 'Rack D-01',
    lastUpdated: '2024-01-12T11:00:00',
  },
  {
    id: '6',
    name: 'Sunscreen SPF 50',
    sku: 'GC-SUN-006',
    category: 'Sunscreen',
    stock: 67,
    lowStockThreshold: 25,
    location: 'Rack B-10',
    lastUpdated: '2024-01-15T08:00:00',
  },
]

type FilterType = 'all' | 'low_stock' | 'out_of_stock'

export default function StaffInventoryPage() {
  const [products, setProducts] = useState(mockProducts)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [adjustments, setAdjustments] = useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = useState(false)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase())

    if (filter === 'low_stock') {
      return matchesSearch && product.stock > 0 && product.stock <= product.lowStockThreshold
    }
    if (filter === 'out_of_stock') {
      return matchesSearch && product.stock === 0
    }
    return matchesSearch
  })

  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length

  const handleAdjustment = (productId: string, delta: number) => {
    setAdjustments((prev) => {
      const current = prev[productId] || 0
      const product = products.find((p) => p.id === productId)
      const newValue = current + delta
      
      // Don't allow negative stock
      if (product && product.stock + newValue < 0) {
        return prev
      }
      
      return { ...prev, [productId]: newValue }
    })
  }

  const handleSaveAdjustments = async () => {
    setIsSaving(true)
    
    // TODO: API call to save adjustments
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Apply adjustments locally
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        stock: p.stock + (adjustments[p.id] || 0),
        lastUpdated: adjustments[p.id] ? new Date().toISOString() : p.lastUpdated,
      }))
    )
    
    setAdjustments({})
    setIsSaving(false)
  }

  const hasAdjustments = Object.values(adjustments).some((v) => v !== 0)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500">Manage stock levels and track inventory</p>
        </div>
        {hasAdjustments && (
          <button
            onClick={handleSaveAdjustments}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border text-left transition-colors ${
            filter === 'all'
              ? 'bg-cyan-50 border-cyan-200'
              : 'bg-white border-gray-100 hover:bg-gray-50'
          }`}
        >
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </button>
        <button
          onClick={() => setFilter('low_stock')}
          className={`p-4 rounded-xl border text-left transition-colors ${
            filter === 'low_stock'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-white border-gray-100 hover:bg-gray-50'
          }`}
        >
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
        </button>
        <button
          onClick={() => setFilter('out_of_stock')}
          className={`p-4 rounded-xl border text-left transition-colors ${
            filter === 'out_of_stock'
              ? 'bg-red-50 border-red-200'
              : 'bg-white border-gray-100 hover:bg-gray-50'
          }`}
        >
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Current Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Adjust
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  New Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No products found</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const adjustment = adjustments[product.id] || 0
                  const newStock = product.stock + adjustment
                  const isLowStock = newStock > 0 && newStock <= product.lowStockThreshold
                  const isOutOfStock = newStock === 0

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {(isLowStock || isOutOfStock) && (
                            <AlertTriangle
                              className={`w-4 h-4 ${
                                isOutOfStock ? 'text-red-500' : 'text-yellow-500'
                              }`}
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-600">{product.sku}</td>
                      <td className="px-4 py-3 text-sm text-cyan-600">{product.location}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-medium ${
                            product.stock === 0
                              ? 'text-red-600'
                              : product.stock <= product.lowStockThreshold
                              ? 'text-yellow-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {product.stock}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">
                          (min: {product.lowStockThreshold})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAdjustment(product.id, -1)}
                            className="p-1 rounded border border-gray-200 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={adjustment}
                            onChange={(e) =>
                              setAdjustments((prev) => ({
                                ...prev,
                                [product.id]: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-16 text-center border border-gray-200 rounded px-2 py-1 text-sm"
                          />
                          <button
                            onClick={() => handleAdjustment(product.id, 1)}
                            className="p-1 rounded border border-gray-200 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold ${
                            newStock === 0
                              ? 'text-red-600'
                              : newStock <= product.lowStockThreshold
                              ? 'text-yellow-600'
                              : adjustment !== 0
                              ? 'text-green-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {newStock}
                        </span>
                        {adjustment !== 0 && (
                          <span
                            className={`text-xs ml-1 ${
                              adjustment > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            ({adjustment > 0 ? '+' : ''}
                            {adjustment})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(product.lastUpdated)}
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
            Showing {filteredProducts.length} of {products.length} products
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
