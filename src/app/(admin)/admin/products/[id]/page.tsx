'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  Plus,
  X,
  Tag,
  Package,
  DollarSign,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  sku: string
  inventory: number
  categoryId: string
  images: { url: string; alt: string }[]
  isActive: boolean
  isFeatured: boolean
  tags: string[]
  variants: {
    id: string
    name: string
    sku: string
    price: number
    inventory: number
  }[]
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [newTag, setNewTag] = useState('')
  const [newVariant, setNewVariant] = useState({
    name: '',
    sku: '',
    price: '',
    inventory: '',
  })

  useEffect(() => {
    fetchProduct()
    fetchCategories()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/v1/admin/products/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setProduct(data.data.product)
      } else {
        setError('Product not found')
      }
    } catch (err) {
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/v1/admin/categories?limit=100')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data.categories)
      }
    } catch (err) {
      console.error('Failed to fetch categories')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/v1/admin/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })

      const data = await res.json()
      if (data.success) {
        router.push('/admin/products')
      } else {
        setError(data.error || 'Failed to update product')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (newTag && product && !product.tags.includes(newTag)) {
      setProduct({ ...product, tags: [...product.tags, newTag] })
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    if (product) {
      setProduct({ ...product, tags: product.tags.filter((t) => t !== tag) })
    }
  }

  const addVariant = () => {
    if (newVariant.name && newVariant.sku && product) {
      setProduct({
        ...product,
        variants: [
          ...product.variants,
          {
            id: `temp-${Date.now()}`,
            name: newVariant.name,
            sku: newVariant.sku,
            price: parseFloat(newVariant.price) || product.price,
            inventory: parseInt(newVariant.inventory) || 0,
          },
        ],
      })
      setNewVariant({ name: '', sku: '', price: '', inventory: '' })
    }
  }

  const removeVariant = (id: string) => {
    if (product) {
      setProduct({
        ...product,
        variants: product.variants.filter((v) => v.id !== id),
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <Link href="/admin/products" className="text-pink-600 hover:text-pink-700">
          Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-gray-600">{product.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Product Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Slug</label>
                  <input
                    type="text"
                    required
                    value={product.slug}
                    onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={product.categoryId}
                    onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Compare at Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={product.compareAtPrice || ''}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        compareAtPrice: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
                    placeholder="Original price for discount"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Inventory
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input
                    type="text"
                    required
                    value={product.sku}
                    onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={product.inventory}
                    onChange={(e) =>
                      setProduct({ ...product, inventory: parseInt(e.target.value) })
                    }
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Variants</h2>
              
              {/* Existing Variants */}
              {product.variants.length > 0 && (
                <div className="mb-4 space-y-3">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <span className="text-xs text-gray-500">Name</span>
                          <p className="font-medium">{variant.name}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">SKU</span>
                          <p className="font-medium">{variant.sku}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Price</span>
                          <p className="font-medium">₹{variant.price}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Stock</span>
                          <p className="font-medium">{variant.inventory}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Variant */}
              <div className="flex items-end gap-2">
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Variant name"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="SKU"
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={newVariant.inventory}
                    onChange={(e) => setNewVariant({ ...newVariant, inventory: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Status</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={product.isActive}
                    onChange={(e) =>
                      setProduct({ ...product, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span>Active (visible on store)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={product.isFeatured}
                    onChange={(e) =>
                      setProduct({ ...product, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span>Featured product</span>
                </label>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Images
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {product.images.map((image, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg">
                    <Image
                      src={image.url || '/images/placeholder.jpg'}
                      alt={image.alt || product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 hover:border-pink-500 hover:text-pink-500 transition"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Click + to upload images. Drag to reorder.
              </p>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
