'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

// Mock tickets data
const mockTickets = [
  {
    id: 'TKT-001',
    subject: 'Order not received',
    customer: { name: 'Amit Kumar', email: 'amit@example.com' },
    orderId: 'GCH3P1R8',
    status: 'OPEN',
    priority: 'HIGH',
    category: 'Delivery',
    createdAt: '2024-01-15T10:30:00',
    lastReply: '2024-01-15T11:45:00',
    messages: 3,
  },
  {
    id: 'TKT-002',
    subject: 'Wrong product delivered',
    customer: { name: 'Sneha Roy', email: 'sneha@example.com' },
    orderId: 'GCI9R4Q7',
    status: 'OPEN',
    priority: 'MEDIUM',
    category: 'Order Issue',
    createdAt: '2024-01-14T14:20:00',
    lastReply: '2024-01-15T09:00:00',
    messages: 5,
  },
  {
    id: 'TKT-003',
    subject: 'Request for refund',
    customer: { name: 'Rahul Verma', email: 'rahul@example.com' },
    orderId: 'GCL7Y3N1',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    category: 'Refund',
    createdAt: '2024-01-13T09:15:00',
    lastReply: '2024-01-14T16:30:00',
    messages: 4,
  },
  {
    id: 'TKT-004',
    subject: 'Product quality issue',
    customer: { name: 'Priya Sharma', email: 'priya@example.com' },
    orderId: 'GCM8X9K2',
    status: 'RESOLVED',
    priority: 'LOW',
    category: 'Product',
    createdAt: '2024-01-12T16:45:00',
    lastReply: '2024-01-13T10:00:00',
    messages: 6,
  },
  {
    id: 'TKT-005',
    subject: 'Unable to apply coupon',
    customer: { name: 'Vikram Singh', email: 'vikram@example.com' },
    orderId: null,
    status: 'RESOLVED',
    priority: 'LOW',
    category: 'Technical',
    createdAt: '2024-01-11T11:00:00',
    lastReply: '2024-01-11T14:30:00',
    messages: 2,
  },
]

const statusConfig: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  OPEN: { label: 'Open', className: 'bg-red-100 text-red-700', icon: AlertCircle },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  RESOLVED: { label: 'Resolved', className: 'bg-green-100 text-green-700', icon: CheckCircle },
}

const priorityConfig: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-gray-100 text-gray-700',
}

export default function StaffSupportPage() {
  const [tickets] = useState(mockTickets)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const openCount = tickets.filter((t) => t.status === 'OPEN').length
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500">
            {openCount} open, {inProgressCount} in progress
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket ID, subject, or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredTickets.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tickets found</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const StatusIcon = statusConfig[ticket.status]?.icon || Clock
              return (
                <Link
                  key={ticket.id}
                  href={`/staff/support/${ticket.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      ticket.status === 'OPEN'
                        ? 'bg-red-100'
                        : ticket.status === 'IN_PROGRESS'
                        ? 'bg-yellow-100'
                        : 'bg-green-100'
                    }`}
                  >
                    <StatusIcon
                      className={`w-5 h-5 ${
                        ticket.status === 'OPEN'
                          ? 'text-red-600'
                          : ticket.status === 'IN_PROGRESS'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-gray-500">{ticket.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          priorityConfig[ticket.priority]
                        }`}
                      >
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
                        {ticket.category}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
                    <p className="text-sm text-gray-500">
                      {ticket.customer.name}
                      {ticket.orderId && (
                        <span className="text-cyan-600 ml-2">Order #{ticket.orderId}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        statusConfig[ticket.status]?.className
                      } px-2 py-0.5 rounded inline-block`}
                    >
                      {statusConfig[ticket.status]?.label}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <MessageSquare className="w-4 h-4" />
                      {ticket.messages}
                      <span>•</span>
                      {formatDate(ticket.lastReply)}
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </p>
          <div className="flex items-center gap-2">
            <button disabled className="p-2 border border-gray-200 rounded-lg disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 bg-cyan-600 text-white rounded-lg text-sm">1</button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
