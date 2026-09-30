'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils'

export function MiniCart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore()
  const cartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeCart])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        closeCart()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, closeCart])

  if (!isOpen) return null

  const subtotal = getSubtotal()
  const shipping = subtotal >= 499 ? 0 : 49
  const freeShippingRemaining = Math.max(0, 499 - subtotal)

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Cart Drawer */}
      <div
        ref={cartRef}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Bag
            </h2>
            <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="flex-grow flex flex-col items-center justify-center p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your bag is empty</h3>
            <p className="text-gray-500 text-center mb-6">
              Looks like you haven't added anything yet. Let's fix that!
            </p>
            <Link href="/category/all" onClick={closeCart}>
              <Button className="rounded-full px-8">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress */}
            {freeShippingRemaining > 0 ? (
              <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <p className="text-sm text-gray-700">
                    Add <span className="font-bold text-pink-600">{formatPrice(freeShippingRemaining)}</span> for FREE shipping!
                  </p>
                </div>
                <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / 499) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border-b">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <span className="text-lg">🎉</span>
                  You've unlocked <span className="font-bold">FREE shipping!</span>
                </p>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto">
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                    {/* Product Image */}
                    <Link
                      href={`/products/${item.productId}`}
                      onClick={closeCart}
                      className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                    >
                      <span className="text-3xl">💄</span>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/products/${item.productId}`}
                          onClick={closeCart}
                          className="font-medium text-gray-900 hover:text-pink-500 text-sm line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {item.variant && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity */}
                        <div className="flex items-center bg-white border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-50 rounded-l-lg"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-50 rounded-r-lg"
                            disabled={item.quantity >= item.inventory}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-white p-4 space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-pink-600">{formatPrice(subtotal + shipping)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Link href="/checkout" onClick={closeCart}>
                  <Button className="w-full rounded-xl h-12 text-base">
                    Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/cart" onClick={closeCart}>
                  <Button variant="outline" className="w-full rounded-xl">
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
