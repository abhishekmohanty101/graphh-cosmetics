'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
}

interface Product {
  id: string
  slug: string
  name: string
  shortDesc: string
  price: number
  comparePrice: number | null
  images: string[]
  category: { name: string; slug: string }
  rating: number
  reviewCount: number
  inStock: boolean
}

export default function CollectionPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [collection, setCollection] = useState<Collection | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  useEffect(() => {
    fetchCollection()
  }, [slug, sort, pagination.page])

  const fetchCollection = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('sort', sort)
      params.set('page', pagination.page.toString())
      params.set('limit', '12')

      const res = await fetch(`/api/v1/collections/${slug}?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setCollection(data.data.collection)
        setProducts(data.data.products)
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination?.totalPages || 1,
          total: data.pagination?.total || 0,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch collection:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
          <Link href="/products" className="text-pink-600 hover:text-pink-700">
            Browse all products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-pink-500 to-purple-600">
        {collection.image && (
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{collection.name}</h1>
            {collection.description && (
              <p className="text-lg md:text-xl max-w-2xl mx-auto px-4">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/products" className="text-gray-500 hover:text-gray-700">
            Products
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900">{collection.name}</span>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">{pagination.total} products</p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No products in this collection yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition group"
              >
                <div className="relative aspect-square">
                  <Image
                    src={product.images[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                  {product.comparePrice && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      {Math.round(
                        ((product.comparePrice - product.price) / product.comparePrice) * 100
                      )}
                      % OFF
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-500">({product.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">₹{product.price}</span>
                    {product.comparePrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.comparePrice}
                      </span>
                    )}
                  </div>
                  {!product.inStock && (
                    <p className="text-red-500 text-sm mt-1">Out of Stock</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
