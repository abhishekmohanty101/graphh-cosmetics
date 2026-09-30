'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

// Sample products for search
const allProducts = [
  { id: '1', name: 'Matte Lipstick - Ruby Red', slug: 'matte-lipstick-ruby-red', price: 599, category: 'Lips' },
  { id: '2', name: 'Matte Lipstick - Nude Pink', slug: 'matte-lipstick-nude-pink', price: 599, category: 'Lips' },
  { id: '3', name: 'Velvet Lip Gloss - Berry Bliss', slug: 'velvet-lip-gloss-berry', price: 449, category: 'Lips' },
  { id: '4', name: 'Precision Lip Liner - Deep Rose', slug: 'lip-liner-deep-rose', price: 349, category: 'Lips' },
  { id: '5', name: 'Liquid Matte Lipstick - Maroon Magic', slug: 'liquid-lipstick-maroon', price: 649, category: 'Lips' },
  { id: '6', name: 'Tinted Lip Balm - Rosy Pink', slug: 'tinted-lip-balm-pink', price: 299, category: 'Lips' },
  { id: '7', name: 'Hydrating Lip Oil - Cherry Bomb', slug: 'lip-oil-cherry', price: 399, category: 'Lips' },
  { id: '10', name: 'Eyeshadow Palette - Nude Essentials', slug: 'eyeshadow-palette-nude', price: 1299, category: 'Eyes' },
  { id: '11', name: 'Volume Max Mascara - Black', slug: 'mascara-volume-max', price: 449, category: 'Eyes' },
  { id: '12', name: 'Gel Eyeliner - Intense Black', slug: 'eyeliner-gel-black', price: 399, category: 'Eyes' },
  { id: '13', name: 'Eyeshadow Palette - Smoky Nights', slug: 'eyeshadow-palette-smoky', price: 1499, category: 'Eyes' },
  { id: '14', name: 'Waterproof Kajal - Deep Black', slug: 'kajal-waterproof', price: 249, category: 'Eyes' },
  { id: '20', name: 'Foundation - Natural Beige', slug: 'foundation-natural-beige', price: 999, category: 'Face' },
  { id: '21', name: 'Full Coverage Concealer - Light', slug: 'concealer-light', price: 549, category: 'Face' },
  { id: '22', name: 'Powder Blush - Coral Pink', slug: 'blush-coral-pink', price: 599, category: 'Face' },
  { id: '23', name: 'Highlighter - Golden Glow', slug: 'highlighter-golden', price: 699, category: 'Face' },
  { id: '30', name: 'Vitamin C Brightening Serum', slug: 'vitamin-c-serum', price: 899, category: 'Skincare' },
  { id: '31', name: 'Deep Hydrating Moisturizer', slug: 'moisturizer-hydrating', price: 699, category: 'Skincare' },
  { id: '32', name: 'Gentle Foaming Face Wash', slug: 'face-wash-gentle', price: 399, category: 'Skincare' },
  { id: '33', name: 'Sunscreen SPF 50+ PA+++', slug: 'sunscreen-spf50', price: 549, category: 'Skincare' },
  { id: '40', name: 'Nail Polish - Classic Red', slug: 'nail-polish-red', price: 199, category: 'Nails' },
  { id: '41', name: 'Nail Polish - Nude Pink', slug: 'nail-polish-nude', price: 199, category: 'Nails' },
]

const trendingSearches = ['Lipstick', 'Mascara', 'Foundation', 'Serum', 'Sunscreen']

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [results, setResults] = useState<typeof allProducts>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const searchTerm = query.toLowerCase()
    const filtered = allProducts.filter(
      product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    )
    setResults(filtered.slice(0, 6))
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsFocused(false)
      setQuery('')
    }
  }

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`)
    setIsFocused(false)
    setQuery('')
  }

  const handleTrendingClick = (term: string) => {
    setQuery(term)
    inputRef.current?.focus()
  }

  const showDropdown = isFocused && (query.length > 0 || true)

  return (
    <div ref={containerRef} className="relative flex-grow max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search for products, brands and more..."
            className="w-full h-11 pl-4 pr-12 text-sm bg-gray-50 border border-gray-200 rounded-l-lg focus:bg-white focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all"
          />
          <button
            type="submit"
            className="px-5 h-11 bg-pink-500 hover:bg-pink-600 text-white rounded-r-lg transition-colors flex items-center justify-center"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
        
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-16 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {query.trim().length < 2 ? (
            /* Trending & Recent */
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                <TrendingUp className="w-4 h-4" />
                Trending Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleTrendingClick(term)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-pink-50 hover:text-pink-600 rounded-full text-sm transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            /* Search Results */
            <div>
              {results.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.slug)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                    index !== results.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">💄</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">in {product.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-pink-600">{formatPrice(product.price)}</p>
                  </div>
                </button>
              ))}
              
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-3 text-sm text-pink-600 hover:bg-pink-50 font-medium flex items-center justify-center gap-2 border-t"
              >
                See all results for "{query}"
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* No Results */
            <div className="p-6 text-center">
              <p className="text-gray-500 text-sm">No products found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
