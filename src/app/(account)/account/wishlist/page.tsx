'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useCartStore } from '@/stores/cart-store'

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false)
  const { items: wishlist, removeItem, clearWishlist } = useWishlistStore()
  const { addItem: addToCart } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse text-gray-400">Loading wishlist...</div>
      </div>
    )
  }

  const handleMoveToCart = (item: typeof wishlist[0]) => {
    addToCart({
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      variant: item.variant,
      price: item.price,
      comparePrice: item.comparePrice,
      quantity: 1,
      image: item.image,
      inventory: 99,
    })
    removeItem(item.productId, item.variantId)
  }

  const handleAddAllToCart = () => {
    wishlist.forEach(item => {
      addToCart({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        variant: item.variant,
        price: item.price,
        comparePrice: item.comparePrice,
        quantity: 1,
        image: item.image,
        inventory: 99,
      })
    })
    clearWishlist()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-500">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">
            Save items you love for later. Click the heart icon on any product!
          </p>
          <Button asChild>
            <Link href="/category/all">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Wishlist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((item) => {
              const discount = calculateDiscount(item.price, item.comparePrice)
              
              return (
                <div key={item.id} className="bg-white rounded-lg overflow-hidden group">
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100">
                    <Link href={`/products/${item.productId}`} className="flex items-center justify-center h-full">
                      <span className="text-6xl">💄</span>
                    </Link>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                    </button>

                    {/* Badges */}
                    {discount > 0 && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="destructive" className="text-xs">
                          -{discount}%
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="font-medium text-gray-900 hover:text-pink-500 line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-gray-500 mt-1">{item.variant}</p>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                      {item.comparePrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(item.comparePrice)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button 
                        className="flex-1" 
                        size="sm"
                        onClick={() => handleMoveToCart(item)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        Add to Bag
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeItem(item.productId, item.variantId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add All to Cart */}
          <div className="bg-white rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Add all items to cart</p>
              <p className="text-sm text-gray-500">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
              </p>
            </div>
            <Button onClick={handleAddAllToCart}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add All to Bag
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
