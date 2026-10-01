'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  GripVertical,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  shortDesc: string | null
  price: number
  comparePrice: number | null
  costPrice: number | null
  sku: string | null
  barcode: string | null
  inventory: number
  lowStockAlert: number
  categoryId: string
  category: { id: string; name: string } | null
  images: string[]
  tags: string[]
  ingredients: string | null
  howToUse: string | null
  benefits: string[]
  metaTitle: string | null
  metaDesc: string | null
  isActive: boolean
  isFeatured: boolean
  isNewArrival: boolean
  hasVariants: boolean
  variants: any[]
}

interface Category {
  id: string
  name: string
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newBenefit, setNewBenefit] = useState('')

  useEffect(() => {
    fetchProduct()
    fetchCategories()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/v1/admin/products/${productId}`)
      const data = await res.json()
      if (data.success) {
        setProduct({
          ...data.data.product,
          price: Number(data.data.product.price),
          comparePrice: data.data.product.comparePrice ? Number(data.data.product.comparePrice) : null,
          costPrice: data.data.product.costPrice ? Number(data.data.product.costPrice) : null,
        })
      } else {
        setError('Product not found')
      }
    } catch (err) {
      setError('Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/v1/admin/categories')
      const data = await res.json()
      if (data.success) setCategories(data.data.categories)
    } catch (err) {
      console.error('Failed to fetch categories')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setProduct(prev => prev ? { ...prev, [name]: type === 'checkbox' ? checked : value } : null)
  }

  const addTag = () => {
    if (newTag.trim() && product && !product.tags.includes(newTag.trim())) {
      setProduct({ ...product, tags: [...product.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    if (product) setProduct({ ...product, tags: product.tags.filter(t => t !== tag) })
  }

  const addBenefit = () => {
    if (newBenefit.trim() && product && !product.benefits.includes(newBenefit.trim())) {
      setProduct({ ...product, benefits: [...product.benefits, newBenefit.trim()] })
      setNewBenefit('')
    }
  }

  const removeBenefit = (benefit: string) => {
    if (product) setProduct({ ...product, benefits: product.benefits.filter(b => b !== benefit) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/v1/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDesc: product.shortDesc,
          price: product.price,
          comparePrice: product.comparePrice,
          costPrice: product.costPrice,
          sku: product.sku,
          barcode: product.barcode,
          inventory: product.inventory,
          lowStockAlert: product.lowStockAlert,
          categoryId: product.categoryId,
          images: product.images,
          tags: product.tags,
          ingredients: product.ingredients,
          howToUse: product.howToUse,
          benefits: product.benefits,
          metaTitle: product.metaTitle,
          metaDesc: product.metaDesc,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Product updated successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update product')
      }
    } catch (err) {
      setError('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const res = await fetch(`/api/v1/admin/products/${productId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        router.push('/admin/products')
      } else {
        setError(data.error || 'Failed to delete product')
      }
    } catch (err) {
      setError('Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Product not found</p>
        <Link href="/admin/products" className="text-pink-600 hover:underline mt-2 inline-block">
          Back to Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-500">{product.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={deleteProduct}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={product.slug}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Short Description</label>
                  <input
                    type="text"
                    name="shortDesc"
                    value={product.shortDesc || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Description</label>
                  <textarea
                    name="description"
                    value={product.description || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Pricing</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Compare Price (₹)</label>
                  <input
                    type="number"
                    name="comparePrice"
                    value={product.comparePrice || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    name="costPrice"
                    value={product.costPrice || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Inventory</h2>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={product.sku || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Barcode</label>
                  <input
                    type="text"
                    name="barcode"
                    value={product.barcode || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    name="inventory"
                    value={product.inventory}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    name="lowStockAlert"
                    value={product.lowStockAlert}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Product Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ingredients</label>
                  <textarea
                    name="ingredients"
                    value={product.ingredients || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">How to Use</label>
                  <textarea
                    name="howToUse"
                    value={product.howToUse || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Benefits</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {product.benefits.map((benefit) => (
                      <span key={benefit} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {benefit}
                        <button type="button" onClick={() => removeBenefit(benefit)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                      placeholder="Add a benefit"
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button type="button" onClick={addBenefit} className="px-4 py-2 bg-gray-100 rounded-lg">Add</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Status</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="isActive" checked={product.isActive} onChange={handleChange} className="w-4 h-4 rounded" />
                  <span className="text-sm">Active (visible on store)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="isFeatured" checked={product.isFeatured} onChange={handleChange} className="w-4 h-4 rounded" />
                  <span className="text-sm">Featured product</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="isNewArrival" checked={product.isNewArrival} onChange={handleChange} className="w-4 h-4 rounded" />
                  <span className="text-sm">Mark as new arrival</span>
                </label>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Category</h2>
              <select
                name="categoryId"
                value={product.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Add</button>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">SEO</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={product.metaTitle || ''}
                    onChange={handleChange}
                    maxLength={60}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Description</label>
                  <textarea
                    name="metaDesc"
                    value={product.metaDesc || ''}
                    onChange={handleChange}
                    maxLength={160}
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
