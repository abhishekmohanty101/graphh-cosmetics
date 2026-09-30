'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  RotateCcw,
  HelpCircle,
} from 'lucide-react'

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  total: number
  subtotal: number
  discount: number
  shipping: number
  tax: number
  createdAt: string
  items: Array<{
    id: string
    name: string
    sku: string
    quantity: number
    price: number
    total: number
    image: string
    attributes: any
  }>
  shippingAddress: {
    name: string
    phone: string
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
  }
  payment: {
    method: string
    status: string
    paidAt: string
  } | null
  shipment: {
    status: string
    carrier: string
    trackingNumber: string
    trackingUrl: string
    estimatedDelivery: string
    shippedAt: string
    deliveredAt: string
  } | null
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: 'yellow', icon: Clock, label: 'Pending' },
  CONFIRMED: { color: 'blue', icon: CheckCircle, label: 'Confirmed' },
  PROCESSING: { color: 'blue', icon: Package, label: 'Processing' },
  SHIPPED: { color: 'purple', icon: Truck, label: 'Shipped' },
  OUT_FOR_DELIVERY: { color: 'purple', icon: Truck, label: 'Out for Delivery' },
  DELIVERED: { color: 'green', icon: CheckCircle, label: 'Delivered' },
  CANCELLED: { color: 'red', icon: Clock, label: 'Cancelled' },
  RETURN_REQUESTED: { color: 'orange', icon: RotateCcw, label: 'Return Requested' },
  RETURNED: { color: 'gray', icon: RotateCcw, label: 'Returned' },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tracking, setTracking] = useState<any>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`)
      const data = await res.json()
      if (data.success) {
        setOrder(data.data.order)
        // Fetch tracking if shipped
        if (['SHIPPED', 'OUT_FOR_DELIVERY'].includes(data.data.order.status)) {
          fetchTracking()
        }
      } else {
        router.push('/account/orders')
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTracking = async () => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/track`)
      const data = await res.json()
      if (data.success) {
        setTracking(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch tracking:', error)
    }
  }

  const handleCancel = async () => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/cancel`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        setShowCancelModal(false)
        fetchOrder()
      }
    } catch (error) {
      console.error('Failed to cancel order:', error)
    }
  }

  const handleReturn = async (reason: string) => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (data.success) {
        setShowReturnModal(false)
        fetchOrder()
      }
    } catch (error) {
      console.error('Failed to request return:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link href="/account/orders" className="text-pink-600">
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig.PENDING
  const StatusIcon = status.icon

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status)
  const canReturn = order.status === 'DELIVERED'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/account/orders" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`bg-${status.color}-50 border border-${status.color}-200 rounded-lg p-4 mb-6 flex items-center gap-4`}>
          <div className={`w-12 h-12 bg-${status.color}-100 rounded-full flex items-center justify-center`}>
            <StatusIcon className={`w-6 h-6 text-${status.color}-600`} />
          </div>
          <div>
            <h2 className={`font-semibold text-${status.color}-800`}>{status.label}</h2>
            {order.shipment?.estimatedDelivery && order.status !== 'DELIVERED' && (
              <p className={`text-${status.color}-600`}>
                Expected by {new Date(order.shipment.estimatedDelivery).toLocaleDateString('en-IN')}
              </p>
            )}
            {order.status === 'DELIVERED' && order.shipment?.deliveredAt && (
              <p className="text-green-600">
                Delivered on {new Date(order.shipment.deliveredAt).toLocaleDateString('en-IN')}
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Order Items ({order.items.length})</h2>
              </div>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.sku && (
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      )}
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.total}</p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500">₹{item.price} each</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Timeline */}
            {tracking?.timeline && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold mb-4">Tracking</h2>
                <div className="space-y-4">
                  {tracking.timeline.map((step: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-green-100' : 'bg-gray-100'
                          }`}
                        >
                          <CheckCircle
                            className={`w-5 h-5 ${
                              step.completed ? 'text-green-600' : 'text-gray-400'
                            }`}
                          />
                        </div>
                        {index < tracking.timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-8 ${
                              step.completed ? 'bg-green-200' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${step.completed ? '' : 'text-gray-400'}`}>
                          {step.title}
                        </p>
                        <p className="text-sm text-gray-500">{step.description}</p>
                        {step.timestamp && (
                          <p className="text-xs text-gray-400">
                            {new Date(step.timestamp).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {order.shipment?.trackingUrl && (
                  <a
                    href={order.shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-center text-pink-600 hover:text-pink-700"
                  >
                    Track on {order.shipment.carrier || 'Carrier'} →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>₹{order.tax}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </h2>
              <div className="text-sm text-gray-700">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.pincode}
                </p>
                <p className="mt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            {order.payment && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment
                </h2>
                <div className="text-sm text-gray-700">
                  <p>
                    <span className="text-gray-500">Method:</span>{' '}
                    {order.payment.method === 'cod' ? 'Cash on Delivery' : order.payment.method?.toUpperCase()}
                  </p>
                  <p>
                    <span className="text-gray-500">Status:</span>{' '}
                    <span className={order.payment.status === 'CAPTURED' ? 'text-green-600' : ''}>
                      {order.payment.status}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}
              {canReturn && (
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="w-full px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50"
                >
                  Request Return
                </button>
              )}
              <Link
                href="/contact"
                className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Need Help?
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Cancel Order?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <ReturnModal
          onClose={() => setShowReturnModal(false)}
          onSubmit={handleReturn}
        />
      )}
    </div>
  )
}

function ReturnModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (reason: string) => void
}) {
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Request Return</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Reason for Return</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select a reason</option>
            <option value="damaged">Product damaged</option>
            <option value="wrong_item">Wrong item received</option>
            <option value="not_as_described">Not as described</option>
            <option value="quality_issue">Quality issue</option>
            <option value="changed_mind">Changed my mind</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={!reason}
            className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg disabled:opacity-50"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  )
}
