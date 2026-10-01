'use client'

import { useState, useEffect } from 'react'
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
  Loader2,
} from 'lucide-react'

interface OrderItem {
  id: string
  productId: string
  product: { name: string; sku: string | null }
  variantId: string | null
  variant: { name: string } | null
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  notes: string | null
  trackingNumber: string | null
  carrier: string | null
  createdAt: string
  user: { name: string | null; email: string; phone: string | null }
  address: {
    name: string
    phone: string
    line1: string
    line2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  } | null
  items: OrderItem[]
}

const statusSteps = [
  { key: 'PENDING', label: 'Pending', icon: Clock },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

export default function StaffOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('Shiprocket')
  const [showShipModal, setShowShipModal] = useState(false)
  const [pickedItems, setPickedItems] = useState<string[]>([])
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/v1/admin/orders/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setOrder(data.data.order)
      }
    } catch (err) {
      console.error('Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = order ? statusSteps.findIndex((s) => s.key === order.status) : 0

  const togglePickedItem = (itemId: string) => {
    setPickedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const allItemsPicked = order ? order.items.every((item) => pickedItems.includes(item.id)) : false

  const handleConfirmOrder = async () => {
    if (!order) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/v1/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PROCESSING' }),
      })
      const data = await res.json()
      if (data.success) {
        setOrder({ ...order, status: 'PROCESSING' })
      }
    } catch (err) {
      console.error('Failed to update')
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkReadyToShip = () => {
    setShowShipModal(true)
  }

  const handleShipOrder = async () => {
    if (!order || !trackingNumber) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/v1/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SHIPPED', trackingNumber, carrier }),
      })
      const data = await res.json()
      if (data.success) {
        setOrder({ ...order, status: 'SHIPPED', trackingNumber, carrier })
        setShowShipModal(false)
      }
    } catch (err) {
      console.error('Failed to ship')
    } finally {
      setUpdating(false)
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Order not found</p>
        <Link href="/staff/orders" className="text-cyan-600 hover:underline mt-2 inline-block">
          Back to orders
        </Link>
      </div>
    )
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
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber || order.id.slice(0, 8)}</h1>
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
              disabled={updating}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              {updating ? 'Confirming...' : 'Confirm Order'}
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
                      <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-500">Variant: {item.variant.name}</p>
                      )}
                      <p className="text-sm text-gray-400">SKU: {item.product?.sku || 'N/A'}</p>
                    </div>
                    <div className="text-right">
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
              {order.discount > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
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
            {order.address ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.address.name}</p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.city}, {order.address.state}{' '}
                  {order.address.postalCode}
                </p>
                <div className="flex items-center gap-2 pt-2 text-cyan-600">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${order.address.phone}`}>{order.address.phone}</a>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No address provided</p>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium">{order.paymentMethod || 'N/A'}</span>
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

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tracking</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Carrier</span>
                  <span className="font-medium">{order.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking #</span>
                  <span className="font-medium font-mono">{order.trackingNumber}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a href={`tel:${order.address?.phone || order.user.phone}`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg border border-gray-200 block">
                📞 Call Customer
              </a>
              <a href={`mailto:${order.user.email}`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg border border-gray-200 block">
                📧 Send Email Update
              </a>
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
                disabled={!trackingNumber || updating}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
              >
                {updating ? 'Shipping...' : 'Confirm Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
