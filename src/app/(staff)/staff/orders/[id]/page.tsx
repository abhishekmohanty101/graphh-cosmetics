'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Printer,
  Truck,
  CheckCircle,
  Clock,
  Box,
} from 'lucide-react'

// Mock order data
const mockOrder = {
  id: 'GCM8X9K2',
  status: 'PENDING',
  paymentStatus: 'PAID',
  paymentMethod: 'Razorpay',
  createdAt: '2024-01-15T10:30:00',
  customer: {
    name: 'Priya Sharma',
    phone: '+91 9876543210',
  },
  shippingAddress: {
    name: 'Priya Sharma',
    phone: '+91 9876543210',
    line1: '123, Rose Garden Apartments',
    line2: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
  },
  items: [
    {
      id: '1',
      name: 'Rose Glow Serum',
      variant: '30ml',
      sku: 'GC-SRM-001',
      price: 1299,
      quantity: 1,
      location: 'Rack A-12',
    },
    {
      id: '2',
      name: 'Vitamin C Moisturizer',
      variant: null,
      sku: 'GC-MST-002',
      price: 899,
      quantity: 1,
      location: 'Rack B-05',
    },
    {
      id: '3',
      name: 'Hyaluronic Acid Toner',
      variant: '100ml',
      sku: 'GC-TNR-003',
      price: 699,
      quantity: 1,
      location: 'Rack A-08',
    },
  ],
  subtotal: 2897,
  shippingCost: 0,
  total: 2499,
  notes: 'Please pack carefully',
}

const statusSteps = [
  { key: 'PENDING', label: 'Pending', icon: Clock },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

export default function StaffOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState(mockOrder)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('Shiprocket')
  const [showShipModal, setShowShipModal] = useState(false)
  const [pickedItems, setPickedItems] = useState<string[]>([])

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status)

  const togglePickedItem = (itemId: string) => {
    setPickedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const allItemsPicked = order.items.every((item) => pickedItems.includes(item.id))

  const handleConfirmOrder = () => {
    setOrder((prev) => ({ ...prev, status: 'PROCESSING' }))
    // TODO: API call
  }

  const handleMarkReadyToShip = () => {
    setShowShipModal(true)
  }

  const handleShipOrder = () => {
    if (!trackingNumber) return
    setOrder((prev) => ({ ...prev, status: 'SHIPPED' }))
    setShowShipModal(false)
    // TODO: API call
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/staff/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-gray-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Label
          </button>
          {order.status === 'PENDING' && (
            <button
              onClick={handleConfirmOrder}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
            >
              Confirm Order
            </button>
          )}
          {order.status === 'PROCESSING' && allItemsPicked && (
            <button
              onClick={handleMarkReadyToShip}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
            >
              Ready to Ship
            </button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => {
            const isActive = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive
                        ? isCurrent
                          ? 'bg-cyan-600 text-white'
                          : 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items - Pick List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Box className="w-5 h-5" />
                Pick List ({pickedItems.length}/{order.items.length} picked)
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => {
                const isPicked = pickedItems.includes(item.id)
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 ${isPicked ? 'bg-green-50' : ''}`}
                  >
                    <button
                      onClick={() => togglePickedItem(item.id)}
                      disabled={order.status !== 'PROCESSING'}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isPicked
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-cyan-500'
                      } ${order.status !== 'PROCESSING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isPicked && <CheckCircle className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-500">Variant: {item.variant}</p>
                      )}
                      <p className="text-sm text-gray-400">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-cyan-600">📍 {item.location}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Shipping</span>
                <span>{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
              <p className="font-medium text-yellow-800">Customer Note:</p>
              <p className="text-yellow-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.pincode}
              </p>
              <div className="flex items-center gap-2 pt-2 text-cyan-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${order.shippingAddress.phone}`}>{order.shippingAddress.phone}</a>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-medium ${
                    order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg border border-gray-200">
                📞 Call Customer
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg border border-gray-200">
                📧 Send Email Update
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg border border-gray-200">
                🎫 Create Support Ticket
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ship Modal */}
      {showShipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Ship Order
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  <option>Shiprocket</option>
                  <option>Delhivery</option>
                  <option>BlueDart</option>
                  <option>DTDC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number *
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowShipModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleShipOrder}
                disabled={!trackingNumber}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
              >
                Confirm Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
