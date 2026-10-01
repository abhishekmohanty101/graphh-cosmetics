'use client'

import { useState, useEffect } from 'react'
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
  Loader2,
} from 'lucide-react'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  name: string
  email: string
  user: { name: string | null; email: string } | null
  status: string
  priority: string
  orderId: string | null
  messageCount: number
  lastReply: string
  createdAt: string
}

const statusConfig: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  OPEN: { label: 'Open', className: 'bg-red-100 text-red-700', icon: AlertCircle },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  WAITING_CUSTOMER: { label: 'Waiting', className: 'bg-blue-100 text-blue-700', icon: Clock },
  RESOLVED: { label: 'Resolved', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  CLOSED: { label: 'Closed', className: 'bg-gray-100 text-gray-700', icon: CheckCircle },
}

const priorityConfig: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-gray-100 text-gray-700',
}

export default function StaffSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchTickets()
  }, [page, statusFilter, priorityFilter])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' })
      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)

      const res = await fetch(`/api/v1/admin/support?${params}`)
      const data = await res.json()
      if (data.success) {
        setTickets(data.data.tickets)
        setTotalPages(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.total || 0)
      }
    } catch (err) {
      console.error('Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTickets()
  }

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
            {total} tickets • {openCount} open, {inProgressCount} in progress
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
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
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_CUSTOMER">Waiting</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            Search
          </button>
        </form>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tickets found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map((ticket) => {
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
                        : ticket.status === 'WAITING_CUSTOMER'
                        ? 'bg-blue-100'
                        : 'bg-green-100'
                    }`}
                  >
                    <StatusIcon
                      className={`w-5 h-5 ${
                        ticket.status === 'OPEN'
                          ? 'text-red-600'
                          : ticket.status === 'IN_PROGRESS'
                          ? 'text-yellow-600'
                          : ticket.status === 'WAITING_CUSTOMER'
                          ? 'text-blue-600'
                          : 'text-green-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-gray-500">{ticket.ticketNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          priorityConfig[ticket.priority] || 'bg-gray-100'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
                    <p className="text-sm text-gray-500">
                      {ticket.user?.name || ticket.name}
                      {ticket.orderId && (
                        <span className="text-cyan-600 ml-2">Order #{ticket.orderId.slice(0, 8)}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        statusConfig[ticket.status]?.className || 'bg-gray-100'
                      } px-2 py-0.5 rounded inline-block`}
                    >
                      {statusConfig[ticket.status]?.label || ticket.status}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <MessageSquare className="w-4 h-4" />
                      {ticket.messageCount}
                      <span>•</span>
                      {formatDate(ticket.lastReply)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {tickets.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
