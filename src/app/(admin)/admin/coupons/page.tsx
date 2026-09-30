'use client'

import { useState } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Ticket,
  Copy,
  X,
  Calendar,
  Percent,
  IndianRupee,
  Truck,
} from 'lucide-react'

// Mock coupons data
const mockCoupons = [
  {
    id: '1',
    code: 'WELCOME10',
    type: 'PERCENTAGE',
    value: 10,
    minPurchase: 499,
    maxDiscount: 200,
    usageLimit: 1000,
    usedCount: 234,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    isActive: true,
  },
  {
    id: '2',
    code: 'FLAT200',
    type: 'FIXED',
    value: 200,
    minPurchase: 999,
    maxDiscount: null,
    usageLimit: 500,
    usedCount: 89,
    validFrom: '2024-01-15',
    validUntil: '2024-02-15',
    isActive: true,
  },
  {
    id: '3',
    code: 'FREESHIP',
    type: 'FREE_SHIPPING',
    value: 0,
    minPurchase: 599,
    maxDiscount: null,
    usageLimit: null,
    usedCount: 456,
    validFrom: '2024-01-01',
    validUntil: '2024-06-30',
    isActive: true,
  },
  {
    id: '4',
    code: 'SUMMER25',
    type: 'PERCENTAGE',
    value: 25,
    minPurchase: 1499,
    maxDiscount: 500,
    usageLimit: 200,
    usedCount: 200,
    validFrom: '2023-04-01',
    validUntil: '2023-06-30',
    isActive: false,
  },
]

interface CouponFormData {
  code: string
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'
  value: string
  minPurchase: string
  maxDiscount: string
  usageLimit: string
  validFrom: string
  validUntil: string
  isActive: boolean
}

const typeConfig = {
  PERCENTAGE: { label: 'Percentage', icon: Percent, color: 'text-blue-600 bg-blue-100' },
  FIXED: { label: 'Fixed Amount', icon: IndianRupee, color: 'text-green-600 bg-green-100' },
  FREE_SHIPPING: { label: 'Free Shipping', icon: Truck, color: 'text-purple-600 bg-purple-100' },
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState(mockCoupons)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<typeof mockCoupons[0] | null>(null)
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
  })

  const openAddModal = () => {
    setEditingCoupon(null)
    setFormData({
      code: '',
      type: 'PERCENTAGE',
      value: '',
      minPurchase: '',
      maxDiscount: '',
      usageLimit: '',
      validFrom: '',
      validUntil: '',
      isActive: true,
    })
    setShowModal(true)
  }

  const openEditModal = (coupon: typeof mockCoupons[0]) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      type: coupon.type as CouponFormData['type'],
      value: String(coupon.value),
      minPurchase: String(coupon.minPurchase || ''),
      maxDiscount: String(coupon.maxDiscount || ''),
      usageLimit: String(coupon.usageLimit || ''),
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isActive: coupon.isActive,
    })
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const couponData = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: parseFloat(formData.value) || 0,
      minPurchase: parseFloat(formData.minPurchase) || null,
      maxDiscount: parseFloat(formData.maxDiscount) || null,
      usageLimit: parseInt(formData.usageLimit) || null,
      validFrom: formData.validFrom,
      validUntil: formData.validUntil,
      isActive: formData.isActive,
    }

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id ? { ...c, ...couponData } : c
        )
      )
    } else {
      setCoupons((prev) => [
        ...prev,
        { id: String(Date.now()), ...couponData, usedCount: 0 },
      ])
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const toggleActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    )
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    // TODO: Show toast
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500">{coupons.length} coupons total</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Active Coupons</p>
          <p className="text-2xl font-bold text-green-600">
            {coupons.filter((c) => c.isActive && !isExpired(c.validUntil)).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-2xl font-bold text-gray-600">
            {coupons.filter((c) => isExpired(c.validUntil)).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Usage</p>
          <p className="text-2xl font-bold text-blue-600">
            {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Disabled</p>
          <p className="text-2xl font-bold text-red-600">
            {coupons.filter((c) => !c.isActive).length}
          </p>
        </div>
      </div>

      {/* Coupons list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Min Purchase
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Usage
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Validity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No coupons yet</p>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const TypeIcon = typeConfig[coupon.type].icon
                  const expired = isExpired(coupon.validUntil)
                  return (
                    <tr key={coupon.id} className={`hover:bg-gray-50 ${expired ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gray-900">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Copy code"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeConfig[coupon.type].color}`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          {typeConfig[coupon.type].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {coupon.type === 'PERCENTAGE' && `${coupon.value}%`}
                        {coupon.type === 'FIXED' && `₹${coupon.value}`}
                        {coupon.type === 'FREE_SHIPPING' && '—'}
                        {coupon.maxDiscount && (
                          <span className="text-xs text-gray-500 block">
                            Max ₹{coupon.maxDiscount}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {coupon.minPurchase ? `₹${coupon.minPurchase}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium">{coupon.usedCount}</span>
                          {coupon.usageLimit && (
                            <span className="text-gray-500">/{coupon.usageLimit}</span>
                          )}
                        </div>
                        {coupon.usageLimit && coupon.usedCount >= coupon.usageLimit && (
                          <span className="text-xs text-red-600">Exhausted</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(coupon.validFrom)}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          to {formatDate(coupon.validUntil)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(coupon.id)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            expired
                              ? 'bg-gray-100 text-gray-600'
                              : coupon.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {expired ? 'Expired' : coupon.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                  placeholder="e.g., WELCOME10"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as CouponFormData['type'] })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="PERCENTAGE">Percentage Discount</option>
                  <option value="FIXED">Fixed Amount</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>
              {formData.type !== 'FREE_SHIPPING' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                    placeholder={formData.type === 'PERCENTAGE' ? 'e.g., 10' : 'e.g., 200'}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Purchase (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="e.g., 499"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                {formData.type === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Discount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="e.g., 200"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid From *
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-600">Active</span>
              </label>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
