'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Star, Heart, ShoppingBag, Truck, RotateCcw, Shield, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'

interface Variant {
  id: string
  name: string
  sku: string
  price: number
  inventory: number
  attributes: { color: string; colorName: string }
}

interface Product {
  id: string
  slug: string
  name: string
  shortDesc: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  category: { name: string; slug: string }
  rating: number
  reviewCount: number
  inStock: boolean
  inventory: number
  sku: string
  hasVariants: boolean
  variants: Variant[]
  ingredients: string
  howToUse: string
  benefits: string[]
  isBestseller?: boolean
  isNew?: boolean
}

interface Review {
  id: string
  user: { name: string; avatar: string | null }
  rating: number
  title: string
  comment: string
  images: string[]
  isVerified: boolean
  helpful: number
  createdAt: string
}

interface ProductDetailProps {
  product: Product
  reviews: Review[]
}

export function ProductDetail({ product, reviews }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.hasVariants ? product.variants[0] : null
  )
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  const { addItem } = useCartStore()
  const { isInWishlist, toggleItem } = useWishlistStore()

  const currentPrice = selectedVariant?.price || product.price
  const currentInventory = selectedVariant?.inventory || product.inventory
  const currentSku = selectedVariant?.sku || product.sku
  const isOutOfStock = currentInventory === 0

  const discount = calculateDiscount(currentPrice, product.comparePrice)

  const isWishlisted = isInWishlist(product.id, selectedVariant?.id || null)

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      name: product.name,
      variant: selectedVariant?.attributes.colorName || null,
      price: currentPrice,
      comparePrice: product.comparePrice || null,
      quantity: quantity,
      image: product.images[0] || null,
      inventory: currentInventory,
    })
  }

  const handleToggleWishlist = () => {
    toggleItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      name: product.name,
      variant: selectedVariant?.attributes.colorName || null,
      price: currentPrice,
      comparePrice: product.comparePrice || null,
      image: product.images[0] || null,
    })
  }

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1)
  }

  const incrementQuantity = () => {
    if (quantity < currentInventory) setQuantity(q => q + 1)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-pink-500">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href={`/category/${product.category.slug}`} className="hover:text-pink-500">
              {product.category.name}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-8xl">💄</span>
            </div>
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-transparent hover:border-pink-500 transition-colors"
                >
                  <span className="text-2xl">💄</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-3">
              {product.isBestseller && <Badge className="bg-amber-500">Bestseller</Badge>}
              {product.isNew && <Badge className="bg-pink-500">New</Badge>}
              {discount > 0 && <Badge variant="destructive">-{discount}% Off</Badge>}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Short Description */}
            <p className="text-gray-600 mb-6">{product.shortDesc}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(currentPrice)}
              </span>
              {product.comparePrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className="text-green-600 font-medium">
                    Save {formatPrice(product.comparePrice - currentPrice)}
                  </span>
                </>
              )}
            </div>

            {/* Variants */}
            {product.hasVariants && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Shade: <span className="text-pink-500">{selectedVariant?.attributes.colorName}</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant)
                        setQuantity(1)
                      }}
                      disabled={variant.inventory === 0}
                      className={cn(
                        "relative w-10 h-10 rounded-full border-2 transition-all",
                        selectedVariant?.id === variant.id
                          ? 'border-pink-500 ring-2 ring-pink-200'
                          : 'border-gray-200 hover:border-gray-400',
                        variant.inventory === 0 && 'opacity-50 cursor-not-allowed'
                      )}
                      style={{ backgroundColor: variant.attributes.color }}
                      title={`${variant.name}${variant.inventory === 0 ? ' (Out of Stock)' : ''}`}
                    >
                      {variant.inventory === 0 && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-0.5 bg-gray-400 rotate-45 absolute" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <button 
                    onClick={decrementQuantity}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button 
                    onClick={incrementQuantity}
                    disabled={quantity >= currentInventory || isOutOfStock}
                    className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {currentInventory < 20 && currentInventory > 0 && (
                  <span className="text-sm text-orange-600">
                    Only {currentInventory} left in stock
                  </span>
                )}
                {isOutOfStock && (
                  <span className="text-sm text-red-600">
                    Out of stock
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <Button 
                size="lg" 
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingBag className="w-5 h-5" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className={cn("px-4", isWishlisted && "text-pink-500 border-pink-500")}
                onClick={handleToggleWishlist}
              >
                <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto text-pink-500 mb-2" />
                <p className="text-xs text-gray-600">Free Shipping<br />above ₹499</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto text-pink-500 mb-2" />
                <p className="text-xs text-gray-600">7 Day Easy<br />Returns</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto text-pink-500 mb-2" />
                <p className="text-xs text-gray-600">100%<br />Authentic</p>
              </div>
            </div>

            {/* SKU */}
            <p className="text-sm text-gray-500 mt-4">
              SKU: {currentSku}
            </p>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="bg-gray-50 py-12">
        <div className="container">
          <div className="bg-white rounded-lg p-6 md:p-8">
            {/* Tab Headers */}
            <div className="flex border-b mb-6 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('description')}
                className={cn(
                  "px-6 py-3 font-medium whitespace-nowrap",
                  activeTab === 'description' 
                    ? "text-pink-500 border-b-2 border-pink-500" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab('ingredients')}
                className={cn(
                  "px-6 py-3 font-medium whitespace-nowrap",
                  activeTab === 'ingredients' 
                    ? "text-pink-500 border-b-2 border-pink-500" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Ingredients
              </button>
              <button 
                onClick={() => setActiveTab('howToUse')}
                className={cn(
                  "px-6 py-3 font-medium whitespace-nowrap",
                  activeTab === 'howToUse' 
                    ? "text-pink-500 border-b-2 border-pink-500" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                How to Use
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={cn(
                  "px-6 py-3 font-medium whitespace-nowrap",
                  activeTab === 'reviews' 
                    ? "text-pink-500 border-b-2 border-pink-500" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Reviews ({product.reviewCount})
              </button>
            </div>

            {/* Tab Content */}
            <div className="prose max-w-none">
              {activeTab === 'description' && (
                <>
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  <h3 className="text-lg font-semibold mt-6 mb-3">Key Benefits</h3>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-500 rounded-full" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {activeTab === 'ingredients' && (
                <p className="text-gray-600">{product.ingredients}</p>
              )}

              {activeTab === 'howToUse' && (
                <p className="text-gray-600">{product.howToUse}</p>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{review.user.name}</span>
                            {review.isVerified && (
                              <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                      <div className="mt-3">
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
