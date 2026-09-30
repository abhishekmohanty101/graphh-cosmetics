'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react'
import { cn, formatPrice, calculateDiscount } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    comparePrice?: number | null
    images: string[]
    rating?: number
    reviewCount?: number
    inStock?: boolean
    isNew?: boolean
    isBestseller?: boolean
    variants?: {
      id: string
      name: string
      attributes: { color?: string }
    }[]
  }
  showQuickAdd?: boolean
}

export function ProductCard({ product, showQuickAdd = true }: ProductCardProps) {
  const router = useRouter()
  const discount = calculateDiscount(product.price, product.comparePrice)
  const inStock = product.inStock !== false
  
  const { addItem } = useCartStore()
  const { isInWishlist, toggleItem } = useWishlistStore()
  
  const isWishlisted = isInWishlist(product.id, null)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      variant: null,
      price: product.price,
      comparePrice: product.comparePrice || null,
      quantity: 1,
      image: product.images?.[0] || null,
      inventory: 99,
    })
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    toggleItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      variant: null,
      price: product.price,
      comparePrice: product.comparePrice || null,
      image: product.images?.[0] || null,
    })
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/products/${product.slug}`)
  }

  const handleCardClick = () => {
    router.push(`/products/${product.slug}`)
  }

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">💄</span>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <Badge className="bg-red-500 hover:bg-red-500 text-xs font-semibold px-2 py-1 rounded-md">
              -{discount}%
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-emerald-500 hover:bg-emerald-500 text-xs font-semibold px-2 py-1 rounded-md">
              NEW
            </Badge>
          )}
          {product.isBestseller && (
            <Badge className="bg-amber-500 hover:bg-amber-500 text-xs font-semibold px-2 py-1 rounded-md">
              BESTSELLER
            </Badge>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {showQuickAdd && inStock && (
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-pink-500 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          )}
          <button
            onClick={handleQuickView}
            className="w-10 h-10 bg-white hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-lg transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Wishlist Button */}
      <button
        className={cn(
          "absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-all z-10",
          "hover:scale-110",
          isWishlisted ? "text-pink-500" : "text-gray-400 hover:text-pink-500"
        )}
        onClick={handleToggleWishlist}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
      </button>

      {/* Product Info */}
      <div className="p-4">
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded">
              <span className="text-xs font-semibold text-green-700">{product.rating}</span>
              <Star className="w-3 h-3 text-green-600 fill-current" />
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount?.toLocaleString() || 0})
            </span>
          </div>
        )}

        {/* Name */}
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-pink-500 transition-colors mb-2 min-h-[40px]">
          {product.name}
        </h3>

        {/* Color Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex gap-1 mb-3">
            {product.variants.slice(0, 4).map((variant) => (
              <div
                key={variant.id}
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: variant.attributes.color }}
                title={variant.name}
              />
            ))}
            {product.variants.length > 4 && (
              <span className="text-xs text-gray-500 ml-1">
                +{product.variants.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
