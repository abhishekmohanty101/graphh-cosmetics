'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Printer,
  Mail,
  Phone,
  ChevronDown,
} from 'lucide-react'

// Mock order data
const mockOrder = {
  id: 'GCM8X9K2',
  status: 'PROCESSING',
  paymentStatus: 'PAID',
  paymentMethod: 'Razorpay',
  transactionId: 'pay_NxYZ1234567890',
  createdAt: '2024-01-15T10:30:00',
  updatedAt: '2024-01-15T11:45:00',
  customer: {
    id: 'cust_1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 9876543210',
    totalOrders: 5,
  },
  shippingAddress: {
    name: 'Priya Sharma',
    phone: '+91 9876543210',
    line1: '123, Rose Garden Apartments',
    line2: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    country: 'India',
  },
  billingAddress: {
    name: 'Priya Sharma',
    phone: '+91 9876543210',
    line1: '123, Rose Garden Apartments',
    line2: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    country: 'India',
  },
  items: [
    {
      id: '1',
      name: 'Rose Glow Serum',
      variant: '30ml',
      sku: 'GC-SRM-001',
      price: 1299,
      quantity: 1,
      image: '/images/products/serum-1.jpg',
    },
    {
      id: '2',
      name: 'Vitamin C Moisturizer',
      variant: null,
      sku: 'GC-MST-002',
      price: 899,
      quantity: 1,
      image: '/images/products/moisturizer-1.jpg',
    },
    {
      id: '3',
      name: 'Hyaluronic Acid Toner',
      variant: '100ml',
      sku: 'GC-TNR-003',
      price: 699,
      quantity: 1,
      image: '/images/products/toner-1.jpg',
    },
  ],
  subtotal: 2897,
  discount: 0,
  shippingCost: 0,
  tax: 398,
  total: 2499,
  notes: 'Please pack carefully',
  timeline: [
    { status: 'Order Placed', date: '2024-01-15T10:30:00', note: 'Order placed successfully' },
    { status: 'Payment Confirmed', date: '2024-01-15T10:31:00', note: 'Payment received via Razorpay' },
    { status: 'Processing', date: '2024-01-15T11:45:00', note: 'Order is being prepared' },
  ],
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'Processing', className: 'bg-indigo-100 text-indigo-800' },
  SHIPPED: { label: 'Shipped', className: 'bg-purple-100 text-purple-800' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', className: 'bg-cyan-100 text-cyan-800' },
  DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState(mockOrder)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [newStatus, setNewStatus] = useState(order.status)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [showShippingModal, setShowShippingModal] = useState(false)

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

  const handleStatusChange = async (status: string) => {
    if (status === 'SHIPPED' && !trackingNumber) {
      setShowShippingModal(true)
      setNewStatus(status)
      return
    }

    // TODO: API call to update status
    setOrder((prev) => ({ ...prev, status }))
    setShowStatusDropdown(false)
  }

  const confirmShipping = () => {
    // TODO: API call with tracking number
    setOrder((prev) => ({ ...prev, status: newStatus }))
    setShowShippingModal(false)
    setTrackingNumber('')
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusConfig[order.status]?.className
                }`}
              >
                {statusConfig[order.status]?.label}
              </span>
            </div>
            <p className="text-gray-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2"
            >
              Update Status
              <ChevronDown className="w-4 h-4" />
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      order.status === status.value ? 'text-pink-600 font-medium' : ''
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.variant && (
                      <p className="text-sm text-gray-500">Variant: {item.variant}</p>
                    )}
                    <p className="text-sm text-gray-400">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{item.price}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax (GST)</span>
                  <span>₹{order.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-pink-500' : 'bg-gray-300'
                      }`}
                    />
                    {index < order.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-gray-900">{event.status}</p>
                    <p className="text-sm text-gray-500">{event.note}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(event.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{order.customer.name}</p>
                <p className="text-sm text-gray-500">{order.customer.totalOrders} orders</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${order.customer.email}`} className="hover:text-pink-600">
                  {order.customer.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${order.customer.phone}`} className="hover:text-pink-600">
                  {order.customer.phone}
                </a>
              </div>
              <Link
                href={`/admin/customers/${order.customer.id}`}
                className="text-sm text-pink-600 hover:text-pink-700"
              >
                View customer profile →
              </Link>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
              <p>{order.shippingAddress.country}</p>
              <p className="pt-2">{order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment
            </h2>
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
              {order.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono text-xs">{order.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Shipping modal */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Add Shipping Details
            </h3>
            <p className="text-gray-500 mb-4">
              Enter the tracking number for this shipment.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number *
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g., SHIP123456789"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrier
                </label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option>Shiprocket</option>
                  <option>Delhivery</option>
                  <option>BlueDart</option>
                  <option>DTDC</option>
                  <option>India Post</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowShippingModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmShipping}
                disabled={!trackingNumber}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                Confirm & Ship
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
