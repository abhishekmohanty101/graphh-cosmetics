'use client'

import { useState, useEffect } from 'react'
import { Star, Check, X, Eye, Filter, Search } from 'lucide-react'

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  user: { name: string; email: string }
  product: { id: string; name: string; images: { url: string }[] }
}

export default function StaffReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [filter, search])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter.toUpperCase())
      if (search) params.set('search', search)

      const res = await fetch(`/api/v1/staff/reviews?${params}`)
      const data = await res.json()
      if (data.success) {
        setReviews(data.data.reviews)
      }
    } catch (err) {
      console.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (reviewId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/v1/staff/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'approve' ? 'APPROVED' : 'REJECTED' }),
      })

      if (res.ok) {
        fetchReviews()
      }
    } catch (err) {
      console.error('Failed to update review')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Approved</span>
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Rejected</span>
      default:
        return null
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Review Moderation</h1>
          <p className="text-gray-600">Approve or reject customer reviews</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition capitalize ${
                  filter === f
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No reviews found</h2>
          <p className="text-gray-600">
            {filter === 'pending' ? 'No pending reviews to moderate' : 'Try a different filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Product Info */}
                <div className="md:w-48 flex-shrink-0">
                  <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden relative mb-2">
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  </div>
                  <p className="font-medium text-sm line-clamp-2">{review.product.name}</p>
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(review.rating)}
                        {getStatusBadge(review.status)}
                      </div>
                      {review.title && (
                        <h3 className="font-semibold">{review.title}</h3>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <p className="text-gray-600 mb-4">{review.comment}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      By: <span className="font-medium">{review.user.name}</span> ({review.user.email})
                    </div>

                    {review.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(review.id, 'approve')}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(review.id, 'reject')}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
