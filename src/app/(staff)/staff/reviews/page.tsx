'use client'

import { useState, useEffect } from 'react'
import { Star, Check, X, Loader2, MessageSquare } from 'lucide-react'

interface Review {
  id: string
  rating: number
  title: string | null
  content: string
  status: string
  createdAt: string
  user: { name: string | null; email: string }
  product: { id: string; name: string }
}

export default function StaffReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (filter !== 'all') params.append('status', filter.toUpperCase())
      if (search) params.append('search', search)

      const res = await fetch(`/api/v1/admin/reviews?${params}`)
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

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId)
    try {
      const res = await fetch(`/api/v1/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
      })
      if (res.ok) {
        fetchReviews()
      }
    } catch (err) {
      console.error('Failed to approve review')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (reviewId: string) => {
    setActionLoading(reviewId)
    try {
      const res = await fetch(`/api/v1/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId))
      }
    } catch (err) {
      console.error('Failed to reject review')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchReviews()
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
        <p className="text-gray-500">Approve or reject customer reviews</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition capitalize ${
                  filter === f
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {filter === 'pending' ? 'No pending reviews to moderate' : 'No reviews found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Product Info */}
                <div className="md:w-48 flex-shrink-0">
                  <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-2">
                    <span className="text-4xl">📦</span>
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

                  <p className="text-gray-600 mb-4">{review.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      By: <span className="font-medium">{review.user.name || 'Anonymous'}</span> ({review.user.email})
                    </div>

                    {review.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(review.id)}
                          disabled={actionLoading === review.id}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          {actionLoading === review.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(review.id)}
                          disabled={actionLoading === review.id}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {actionLoading === review.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
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
