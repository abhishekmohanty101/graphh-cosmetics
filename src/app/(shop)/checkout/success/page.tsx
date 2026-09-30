'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, Truck, CreditCard, ChevronRight } from 'lucide-react'
import confetti from 'canvas-confetti'

interface OrderDetails {
  id: string
  orderNumber: string
  status: string
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number
    image: string
  }>
  shippingAddress: {
    name: string
    line1: string
    city: string
    state: string
    pincode: string
  }
  payment: {
    method: string
    status: string
  }
  estimatedDelivery: string
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Trigger confetti on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#f472b6', '#fbcfe8'],
    })

    if (orderId) {
      fetchOrder()
    } else {
      setLoading(false)
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`)
      const data = await res.json()
      if (data.success) {
        setOrder(data.data.order)
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you for shopping with Graphh Cosmetics
          </p>
          {order && (
            <p className="mt-2 text-lg">
              Order Number: <span className="font-semibold">{order.orderNumber}</span>
            </p>
          )}
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">What's Next?</h2>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-green-600 font-medium">Order Placed</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-1 bg-green-500 w-0"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500">Processing</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <Truck className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500">Shipped</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500">Delivered</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-pink-50 rounded-lg">
            <p className="text-pink-800">
              <strong>Estimated Delivery:</strong>{' '}
              {order?.estimatedDelivery || '3-5 business days'}
            </p>
            <p className="text-sm text-pink-600 mt-1">
              You will receive an email with tracking details once your order ships.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        {order && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            
            <div className="divide-y">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 py-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Payment: {order.payment.method === 'cod' ? 'Cash on Delivery' : order.payment.method?.toUpperCase()}
              </p>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {order?.shippingAddress && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>
            <div className="text-gray-700">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.line1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.pincode}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={order ? `/account/orders/${order.id}` : '/account/orders'}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            Track Order
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            Have questions?{' '}
            <Link href="/contact" className="text-pink-600 hover:text-pink-700">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
