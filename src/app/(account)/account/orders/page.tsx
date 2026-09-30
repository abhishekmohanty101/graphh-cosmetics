import Link from 'next/link'
import { Package, ChevronRight, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

// Mock orders data
const orders = [
  {
    id: 'GRP-2024-001234',
    date: '2024-01-15',
    total: 1647,
    status: 'delivered',
    items: [
      { name: 'Matte Lipstick - Ruby Red', quantity: 2, price: 599 },
      { name: 'Velvet Lip Gloss', quantity: 1, price: 449 },
    ],
    trackingNumber: 'SHIP123456789',
    deliveredAt: '2024-01-18',
  },
  {
    id: 'GRP-2024-001189',
    date: '2024-01-10',
    total: 999,
    status: 'shipped',
    items: [
      { name: 'Foundation - Natural Beige', quantity: 1, price: 999 },
    ],
    trackingNumber: 'SHIP987654321',
    estimatedDelivery: '2024-01-20',
  },
  {
    id: 'GRP-2024-001156',
    date: '2024-01-05',
    total: 449,
    status: 'processing',
    items: [
      { name: 'Mascara - Volume Max', quantity: 1, price: 449 },
    ],
  },
  {
    id: 'GRP-2024-001098',
    date: '2023-12-28',
    total: 1199,
    status: 'cancelled',
    items: [
      { name: 'Eyeshadow Palette - Nude', quantity: 1, price: 1199 },
    ],
    cancelledAt: '2023-12-29',
    cancelReason: 'Customer requested cancellation',
  },
]

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'delivered':
      return { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle }
    case 'shipped':
      return { label: 'Shipped', color: 'bg-blue-100 text-blue-700', icon: Truck }
    case 'processing':
      return { label: 'Processing', color: 'bg-yellow-100 text-yellow-700', icon: Clock }
    case 'cancelled':
      return { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle }
    default:
      return { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: Clock }
  }
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't placed any orders yet. Start shopping!
          </p>
          <Button asChild>
            <Link href="/category/all">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status)
            const StatusIcon = statusConfig.icon

            return (
              <div key={order.id} className="bg-white rounded-lg overflow-hidden">
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 border-b">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Order ID: </span>
                      <span className="font-mono font-medium text-gray-900">{order.id}</span>
                    </div>
                    <div className="hidden sm:block text-gray-300">|</div>
                    <div>
                      <span className="text-gray-500">Placed on: </span>
                      <span className="text-gray-900">
                        {new Date(order.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">💄</span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Info */}
                  {order.status === 'shipped' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="text-blue-700">
                        <Truck className="w-4 h-4 inline mr-1" />
                        Tracking: <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                      <p className="text-blue-600 mt-1">
                        Expected delivery: {new Date(order.estimatedDelivery!).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Delivered on {new Date(order.deliveredAt!).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  )}

                  {order.status === 'cancelled' && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                      <XCircle className="w-4 h-4 inline mr-1" />
                      {order.cancelReason}
                    </div>
                  )}
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                  <div>
                    <span className="text-gray-500">Total: </span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</span>
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/account/orders/${order.id}`}>
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
