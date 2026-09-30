'use client'

import { useEffect, useState } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Trash2, Minus, Plus, ShoppingBag, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading cart...</div>
      </div>
    )
  }

  const subtotal = getSubtotal()
  const discount = 0 // Would come from coupon
  const shipping = subtotal >= 499 ? 0 : subtotal > 0 ? 49 : 0
  const total = subtotal - discount + shipping

  const hasOutOfStock = false // Would check actual inventory

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-pink-500">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16 bg-white rounded-lg">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild>
              <Link href="/category/all">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free Shipping Banner */}
              {subtotal < 499 && subtotal > 0 && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 flex items-center gap-3">
                  <div className="flex-grow">
                    <p className="text-sm text-pink-800">
                      Add <span className="font-semibold">{formatPrice(499 - subtotal)}</span> more to get <span className="font-semibold">FREE shipping!</span>
                    </p>
                    <div className="mt-2 h-2 bg-pink-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-500 rounded-full transition-all"
                        style={{ width: `${Math.min((subtotal / 499) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {subtotal >= 499 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    🎉 You've unlocked <span className="font-semibold">FREE shipping!</span>
                  </p>
                </div>
              )}

              {/* Items List */}
              <div className="bg-white rounded-lg divide-y">
                {items.map((item) => (
                  <div key={item.id} className="p-4 md:p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link href={`/products/${item.productId}`} className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-4xl">💄</span>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between">
                          <div>
                            <Link 
                              href={`/products/${item.productId}`}
                              className="font-medium text-gray-900 hover:text-pink-500 line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            {item.variant && (
                              <p className="text-sm text-gray-500 mt-1">Shade: {item.variant}</p>
                            )}
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Price & Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
                            {item.comparePrice && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(item.comparePrice)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center border rounded-lg">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-50 disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-50 disabled:opacity-50"
                              disabled={item.quantity >= item.inventory}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right mt-2">
                          <span className="text-sm text-gray-500">Total: </span>
                          <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="text-sm text-gray-600 mb-2 block">Have a coupon?</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        placeholder="Enter coupon code" 
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">Apply</Button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Tax Note */}
                <p className="text-xs text-gray-500 mt-3">
                  Inclusive of all taxes
                </p>

                {/* Checkout Button */}
                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  disabled={hasOutOfStock}
                  asChild
                >
                  <Link href="/checkout">
                    {hasOutOfStock ? 'Remove out of stock items' : 'Proceed to Checkout'}
                  </Link>
                </Button>

                {/* Continue Shopping */}
                <Link 
                  href="/category/all"
                  className="block text-center text-sm text-pink-500 hover:text-pink-600 mt-4"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-center gap-4 text-gray-400">
                    <div className="text-center">
                      <div className="text-2xl">🔒</div>
                      <span className="text-xs">Secure Checkout</span>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">🚚</div>
                      <span className="text-xs">Fast Delivery</span>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">↩️</div>
                      <span className="text-xs">Easy Returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
