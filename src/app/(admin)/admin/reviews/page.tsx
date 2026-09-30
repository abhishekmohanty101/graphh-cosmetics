'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Star,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'

// Mock reviews data
const mockReviews = [
  {
    id: '1',
    product: { id: '1', name: 'Rose Glow Serum', slug: 'rose-glow-serum' },
    customer: { name: 'Priya Sharma', email: 'priya@example.com' },
    rating: 5,
    title: 'Amazing product!',
    comment: 'This serum has transformed my skin. My complexion looks brighter and more even. Highly recommend!',
    isVerifiedPurchase: true,
    isApproved: true,
    helpfulCount: 12,
    createdAt: '2024-01-15T10:30:00',
  },
  {
    id: '2',
    product: { id: '2', name: 'Vitamin C Moisturizer', slug: 'vitamin-c-moisturizer' },
    customer: { name: 'Rahul Verma', email: 'rahul@example.com' },
    rating: 4,
    title: 'Good but pricey',
    comment: 'Great moisturizer, absorbs quickly and doesn\'t feel greasy. A bit expensive though.',
    isVerifiedPurchase: true,
    isApproved: false,
    helpfulCount: 5,
    createdAt: '2024-01-14T14:20:00',
  },
  {
    id: '3',
    product: { id: '3', name: 'Niacinamide Toner', slug: 'niacinamide-toner' },
    customer: { name: 'Anjali Patel', email: 'anjali@example.com' },
    rating: 3,
    title: 'Average',
    comment: 'It\'s okay, nothing special. Didn\'t see much difference in my skin.',
    isVerifiedPurchase: false,
    isApproved: false,
    helpfulCount: 2,
    createdAt: '2024-01-13T09:15:00',
  },
  {
    id: '4',
    product: { id: '1', name: 'Rose Glow Serum', slug: 'rose-glow-serum' },
    customer: { name: 'Neha Gupta', email: 'neha@example.com' },
    rating: 5,
    title: 'Best serum ever!',
    comment: 'I\'ve tried many serums but this one is by far the best. My skin has never looked better.',
    isVerifiedPurchase: true,
    isApproved: true,
    helpfulCount: 8,
    createdAt: '2024-01-12T16:45:00',
  },
]

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(mockReviews)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedRating, setSelectedRating] = useState('all')

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.product.name.toLowerCase().includes(search.toLowerCase()) ||
      review.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      review.comment.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'pending' && !review.isApproved) ||
      (selectedStatus === 'approved' && review.isApproved)
    const matchesRating = selectedRating === 'all' || review.rating === parseInt(selectedRating)
    return matchesSearch && matchesStatus && matchesRating
  })

  const pendingCount = reviews.filter((r) => !r.isApproved).length

  const handleApprove = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
    )
  }

  const handleReject = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500">
            {reviews.length} reviews total • {pendingCount} pending approval
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {reviews.filter((r) => r.isApproved).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Avg Rating</p>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-2xl font-bold text-gray-900">
              {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Verified Purchases</p>
          <p className="text-2xl font-bold text-blue-600">
            {reviews.filter((r) => r.isVerifiedPurchase).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, customer, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-xl shadow-sm border p-6 ${
                review.isApproved ? 'border-gray-100' : 'border-yellow-200 bg-yellow-50/30'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <RatingStars rating={review.rating} />
                    {review.isVerifiedPurchase && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                    {!review.isApproved && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                        Pending Approval
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{review.title}</h3>
                  <p className="text-gray-600 mb-3">{review.comment}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span>{review.customer.name}</span>
                    <span>•</span>
                    <Link
                      href={`/products/${review.product.slug}`}
                      target="_blank"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      {review.product.name}
                    </Link>
                    <span>•</span>
                    <span>{formatDate(review.createdAt)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {review.helpfulCount} helpful
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!review.isApproved && (
                    <>
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Approve"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Reject"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <Link
                    href={`/products/${review.product.slug}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="View Product"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleReject(review.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </p>
        <div className="flex items-center gap-2">
          <button disabled className="p-2 border border-gray-200 rounded-lg disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="px-3 py-1 bg-pink-600 text-white rounded-lg text-sm">1</button>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
