'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutGrid } from 'lucide-react'
import { ProductCard } from '@/components/product'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  comparePrice?: number | null
  images: string[]
  rating?: number
  reviewCount?: number
  inStock: boolean
  isBestseller?: boolean
  isNew?: boolean
  variants?: any[]
  productType?: string
}

interface CategoryContentProps {
  category: { name: string; description: string }
  products: Product[]
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating'

interface Filters {
  priceRanges: string[]
  productTypes: string[]
  ratings: string[]
  inStockOnly: boolean
}

export function CategoryContent({ category, products }: CategoryContentProps) {
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [filters, setFilters] = useState<Filters>({
    priceRanges: [],
    productTypes: [],
    ratings: [],
    inStockOnly: false,
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [gridCols, setGridCols] = useState<3 | 4>(3)

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (filters.priceRanges.length > 0) {
      result = result.filter(product => {
        return filters.priceRanges.some(range => {
          if (range === 'under-500') return product.price < 500
          if (range === '500-1000') return product.price >= 500 && product.price <= 1000
          if (range === '1000-2000') return product.price >= 1000 && product.price <= 2000
          if (range === 'above-2000') return product.price > 2000
          return true
        })
      })
    }

    if (filters.productTypes.length > 0) {
      result = result.filter(product => {
        const name = product.name.toLowerCase()
        return filters.productTypes.some(type => {
          if (type === 'lipstick') return name.includes('lipstick')
          if (type === 'lip-gloss') return name.includes('gloss')
          if (type === 'lip-liner') return name.includes('liner')
          if (type === 'lip-balm') return name.includes('balm') || name.includes('oil')
          return true
        })
      })
    }

    if (filters.ratings.length > 0) {
      result = result.filter(product => {
        if (!product.rating) return false
        return filters.ratings.some(rating => {
          if (rating === '4-above') return product.rating! >= 4
          if (rating === '3-above') return product.rating! >= 3
          return true
        })
      })
    }

    if (filters.inStockOnly) {
      result = result.filter(product => product.inStock)
    }

    return result
  }, [products, filters])

  // Sort products
  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts]

    switch (sortBy) {
      case 'price-asc':
        return result.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return result.sort((a, b) => b.price - a.price)
      case 'newest':
        return result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
      case 'rating':
        return result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'featured':
      default:
        return result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0))
    }
  }, [filteredProducts, sortBy])

  const toggleFilter = (category: keyof Omit<Filters, 'inStockOnly'>, value: string) => {
    setFilters(prev => {
      const current = prev[category]
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [category]: updated }
    })
  }

  const clearAllFilters = () => {
    setFilters({
      priceRanges: [],
      productTypes: [],
      ratings: [],
      inStockOnly: false,
    })
  }

  const activeFilterCount = 
    filters.priceRanges.length + 
    filters.productTypes.length + 
    filters.ratings.length + 
    (filters.inStockOnly ? 1 : 0)

  const FilterCheckbox = ({ 
    label, 
    checked, 
    onChange,
    count 
  }: { 
    label: string
    checked: boolean
    onChange: () => void
    count?: number 
  }) => (
    <label className="flex items-center justify-between cursor-pointer group py-1.5">
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked ? 'bg-pink-500 border-pink-500' : 'border-gray-300 group-hover:border-gray-400'
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className={`text-sm ${checked ? 'text-pink-600 font-medium' : 'text-gray-700'}`}>
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
    </label>
  )

  const FiltersPanel = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={isMobile ? '' : 'bg-white rounded-2xl p-6 shadow-sm sticky top-24'}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
        {activeFilterCount > 0 && (
          <button 
            onClick={clearAllFilters}
            className="text-sm text-pink-500 hover:text-pink-600 font-medium"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* In Stock Only */}
      <div className="mb-6 pb-6 border-b">
        <FilterCheckbox
          label="In Stock Only"
          checked={filters.inStockOnly}
          onChange={() => setFilters(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
        />
      </div>

      {/* Price Range */}
      <div className="mb-6 pb-6 border-b">
        <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-1">
          <FilterCheckbox
            label="Under ₹500"
            checked={filters.priceRanges.includes('under-500')}
            onChange={() => toggleFilter('priceRanges', 'under-500')}
          />
          <FilterCheckbox
            label="₹500 - ₹1000"
            checked={filters.priceRanges.includes('500-1000')}
            onChange={() => toggleFilter('priceRanges', '500-1000')}
          />
          <FilterCheckbox
            label="₹1000 - ₹2000"
            checked={filters.priceRanges.includes('1000-2000')}
            onChange={() => toggleFilter('priceRanges', '1000-2000')}
          />
          <FilterCheckbox
            label="Above ₹2000"
            checked={filters.priceRanges.includes('above-2000')}
            onChange={() => toggleFilter('priceRanges', 'above-2000')}
          />
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Customer Rating</h4>
        <div className="space-y-1">
          <FilterCheckbox
            label="4★ & above"
            checked={filters.ratings.includes('4-above')}
            onChange={() => toggleFilter('ratings', '4-above')}
          />
          <FilterCheckbox
            label="3★ & above"
            checked={filters.ratings.includes('3-above')}
            onChange={() => toggleFilter('ratings', '3-above')}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-pink-500 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-12">
        <div className="container text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {category.name}
          </h1>
          <p className="text-pink-100 max-w-2xl mx-auto">
            {category.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FiltersPanel />
          </aside>

          {/* Products */}
          <div className="flex-grow">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600">
                Showing <span className="font-bold text-gray-900">{sortedProducts.length}</span> products
              </p>
              
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button 
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium hover:border-pink-500 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Grid Toggle */}
                <div className="hidden md:flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setGridCols(3)}
                    className={`p-2 ${gridCols === 3 ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setGridCols(4)}
                    className={`p-2 ${gridCols === 4 ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Sort */}
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white cursor-pointer hover:border-pink-500 focus:outline-none focus:border-pink-500 font-medium"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Active Filters Tags */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-700 text-sm font-medium rounded-full">
                    In Stock
                    <button onClick={() => setFilters(prev => ({ ...prev, inStockOnly: false }))} className="hover:text-pink-900">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {filters.priceRanges.map(range => (
                  <span key={range} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-700 text-sm font-medium rounded-full">
                    {range === 'under-500' && 'Under ₹500'}
                    {range === '500-1000' && '₹500-₹1000'}
                    {range === '1000-2000' && '₹1000-₹2000'}
                    {range === 'above-2000' && 'Above ₹2000'}
                    <button onClick={() => toggleFilter('priceRanges', range)} className="hover:text-pink-900">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {filters.ratings.map(rating => (
                  <span key={rating} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-700 text-sm font-medium rounded-full">
                    {rating === '4-above' && '4★ & above'}
                    {rating === '3-above' && '3★ & above'}
                    <button onClick={() => toggleFilter('ratings', rating)} className="hover:text-pink-900">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Product Grid */}
            {sortedProducts.length > 0 ? (
              <div className={`grid grid-cols-2 ${gridCols === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 md:gap-6`}>
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters</p>
                <Button onClick={clearAllFilters} variant="outline" className="rounded-full">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <FiltersPanel isMobile />
            </div>
            <div className="sticky bottom-0 p-4 bg-white border-t shadow-lg">
              <Button onClick={() => setMobileFiltersOpen(false)} className="w-full rounded-xl">
                Show {sortedProducts.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
