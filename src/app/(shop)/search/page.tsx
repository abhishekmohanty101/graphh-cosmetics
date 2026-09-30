'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'
import { ProductCard } from '@/components/product'
import { Button } from '@/components/ui/button'

// Sample products for search (same as in search-bar)
const allProducts = [
  { id: '1', slug: 'matte-lipstick-ruby-red', name: 'Matte Lipstick - Ruby Red', price: 599, comparePrice: 799, images: [], rating: 4.5, reviewCount: 234, inStock: true, isBestseller: true, category: 'lips' },
  { id: '2', slug: 'matte-lipstick-nude-pink', name: 'Matte Lipstick - Nude Pink', price: 599, comparePrice: 799, images: [], rating: 4.3, reviewCount: 156, inStock: true, isNew: true, category: 'lips' },
  { id: '3', slug: 'velvet-lip-gloss-berry', name: 'Velvet Lip Gloss - Berry Bliss', price: 449, comparePrice: 599, images: [], rating: 4.7, reviewCount: 89, inStock: true, category: 'lips' },
  { id: '4', slug: 'lip-liner-deep-rose', name: 'Precision Lip Liner - Deep Rose', price: 349, images: [], rating: 4.2, reviewCount: 67, inStock: true, category: 'lips' },
  { id: '5', slug: 'liquid-lipstick-maroon', name: 'Liquid Matte Lipstick - Maroon Magic', price: 649, comparePrice: 899, images: [], rating: 4.6, reviewCount: 198, inStock: false, category: 'lips' },
  { id: '6', slug: 'tinted-lip-balm-pink', name: 'Tinted Lip Balm - Rosy Pink', price: 299, images: [], rating: 4.4, reviewCount: 312, inStock: true, isNew: true, category: 'lips' },
  { id: '7', slug: 'lip-oil-cherry', name: 'Hydrating Lip Oil - Cherry Bomb', price: 399, comparePrice: 499, images: [], rating: 4.8, reviewCount: 145, inStock: true, isBestseller: true, category: 'lips' },
  { id: '10', slug: 'eyeshadow-palette-nude', name: 'Eyeshadow Palette - Nude Essentials', price: 1299, comparePrice: 1599, images: [], rating: 4.7, reviewCount: 324, inStock: true, isBestseller: true, category: 'eyes' },
  { id: '11', slug: 'mascara-volume-max', name: 'Volume Max Mascara - Black', price: 449, comparePrice: 599, images: [], rating: 4.5, reviewCount: 456, inStock: true, isBestseller: true, category: 'eyes' },
  { id: '12', slug: 'eyeliner-gel-black', name: 'Gel Eyeliner - Intense Black', price: 399, images: [], rating: 4.3, reviewCount: 189, inStock: true, category: 'eyes' },
  { id: '13', slug: 'eyeshadow-palette-smoky', name: 'Eyeshadow Palette - Smoky Nights', price: 1499, comparePrice: 1899, images: [], rating: 4.6, reviewCount: 267, inStock: true, isNew: true, category: 'eyes' },
  { id: '14', slug: 'kajal-waterproof', name: 'Waterproof Kajal - Deep Black', price: 249, images: [], rating: 4.4, reviewCount: 534, inStock: true, category: 'eyes' },
  { id: '15', slug: 'eyebrow-pencil-brown', name: 'Eyebrow Pencil - Natural Brown', price: 349, comparePrice: 449, images: [], rating: 4.2, reviewCount: 178, inStock: true, category: 'eyes' },
  { id: '20', slug: 'foundation-natural-beige', name: 'Foundation - Natural Beige', price: 999, comparePrice: 1299, images: [], rating: 4.5, reviewCount: 412, inStock: true, isBestseller: true, category: 'face' },
  { id: '21', slug: 'concealer-light', name: 'Full Coverage Concealer - Light', price: 549, comparePrice: 699, images: [], rating: 4.4, reviewCount: 287, inStock: true, category: 'face' },
  { id: '22', slug: 'blush-coral-pink', name: 'Powder Blush - Coral Pink', price: 599, images: [], rating: 4.6, reviewCount: 198, inStock: true, isNew: true, category: 'face' },
  { id: '23', slug: 'highlighter-golden', name: 'Highlighter - Golden Glow', price: 699, comparePrice: 899, images: [], rating: 4.7, reviewCount: 234, inStock: true, isBestseller: true, category: 'face' },
  { id: '30', slug: 'vitamin-c-serum', name: 'Vitamin C Brightening Serum', price: 899, comparePrice: 1199, images: [], rating: 4.8, reviewCount: 567, inStock: true, isBestseller: true, category: 'skincare' },
  { id: '31', slug: 'moisturizer-hydrating', name: 'Deep Hydrating Moisturizer', price: 699, images: [], rating: 4.5, reviewCount: 423, inStock: true, category: 'skincare' },
  { id: '32', slug: 'face-wash-gentle', name: 'Gentle Foaming Face Wash', price: 399, comparePrice: 499, images: [], rating: 4.4, reviewCount: 356, inStock: true, category: 'skincare' },
  { id: '33', slug: 'sunscreen-spf50', name: 'Sunscreen SPF 50+ PA+++', price: 549, images: [], rating: 4.6, reviewCount: 478, inStock: true, isBestseller: true, category: 'skincare' },
  { id: '34', slug: 'niacinamide-serum', name: 'Niacinamide 10% Serum', price: 799, comparePrice: 999, images: [], rating: 4.7, reviewCount: 312, inStock: true, isNew: true, category: 'skincare' },
  { id: '40', slug: 'nail-polish-red', name: 'Nail Polish - Classic Red', price: 199, images: [], rating: 4.4, reviewCount: 234, inStock: true, isBestseller: true, category: 'nails' },
  { id: '41', slug: 'nail-polish-nude', name: 'Nail Polish - Nude Pink', price: 199, images: [], rating: 4.3, reviewCount: 189, inStock: true, category: 'nails' },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  // Search logic
  const results = query.trim().length > 0
    ? allProducts.filter(
        product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-pink-500">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900">Search Results</span>
          </nav>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {query ? (
              <>Search results for "<span className="text-pink-500">{query}</span>"</>
            ) : (
              'Search Products'
            )}
          </h1>
          <p className="text-gray-500 mt-2">
            {results.length} {results.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
      </div>

      <div className="container py-8">
        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : query ? (
          /* No Results */
          <div className="text-center py-16 bg-white rounded-lg">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-500 mb-6">
              We couldn't find any products matching "{query}". Try a different search term.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/category/all">Browse All Products</Link>
              </Button>
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        ) : (
          /* No Query */
          <div className="text-center py-16 bg-white rounded-lg">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Start searching</h2>
            <p className="text-gray-500 mb-6">
              Enter a search term to find products.
            </p>
            <Button asChild>
              <Link href="/category/all">Browse All Products</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
