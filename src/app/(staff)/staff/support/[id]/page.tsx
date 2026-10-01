'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  User,
  Clock,
  Tag,
  ShoppingBag,
  CheckCircle,
  Loader2,
  MessageSquare,
} from 'lucide-react'

interface TicketMessage {
  id: string
  message: string
  isStaff: boolean
  staffName: string | null
  createdAt: string
}

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  message: string
  status: string
  priority: string
  name: string
  email: string
  orderId: string | null
  user: { name: string | null; email: string; phone: string | null } | null
  messages: TicketMessage[]
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
}

const statusOptions = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED']
const priorityOptions = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']

const statusColors: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  WAITING_CUSTOMER: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
}

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-gray-100 text-gray-700',
}

export default function StaffTicketDetailPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchTicket()
  }, [params.id])

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/v1/admin/support/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setTicket(data.data.ticket)
        setOrder(data.data.order)
      }
    } catch (err) {
      console.error('Failed to fetch ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!ticket || !newMessage.trim()) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/v1/admin/support/${ticket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setTicket((prev) => prev ? {
          ...prev,
          messages: [...prev.messages, data.data.message],
        } : null)
        setNewMessage('')
      }
    } catch (err) {
      console.error('Failed to send')
    } finally {
      setIsSending(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/v1/admin/support/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setTicket((prev) => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (err) {
      console.error('Failed to update')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    if (!ticket) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/v1/admin/support/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      })
      const data = await res.json()
      if (data.success) {
        setTicket((prev) => prev ? { ...prev, priority: newPriority } : null)
      }
    } catch (err) {
      console.error('Failed to update')
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Ticket not found</p>
        <Link href="/staff/support" className="text-cyan-600 hover:underline mt-2 inline-block">
          Back to tickets
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/staff/support"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-500">{ticket.ticketNumber}</span>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                statusColors[ticket.status] || 'bg-gray-100'
              }`}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <select
              value={ticket.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              disabled={isUpdating}
              className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                priorityColors[ticket.priority] || 'bg-gray-100'
              }`}
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
        </div>
        {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
          <button
            onClick={() => handleStatusChange('RESOLVED')}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Resolve
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="h-[500px] overflow-y-auto p-4 space-y-4">
              {/* Initial message */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-600">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{ticket.user?.name || ticket.name}</span>
                    <span className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-100 text-gray-800">
                    {ticket.message}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.isStaff ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.isStaff ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div
                    className={`flex-1 max-w-[80%] ${msg.isStaff ? 'text-right' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {msg.isStaff ? (msg.staffName || 'Support Team') : (ticket.user?.name || ticket.name)}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(msg.createdAt)}</span>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        msg.isStaff
                          ? 'bg-cyan-50 text-gray-800 text-left'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply box */}
            <div className="border-t border-gray-100 p-4">
              <div className="flex gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="self-end px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium">{ticket.user?.name || ticket.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <a href={`mailto:${ticket.user?.email || ticket.email}`} className="text-cyan-600 hover:underline">
                  {ticket.user?.email || ticket.email}
                </a>
              </div>
              {ticket.user?.phone && (
                <div>
                  <p className="text-gray-500">Phone</p>
                  <a href={`tel:${ticket.user.phone}`} className="text-cyan-600 hover:underline">
                    {ticket.user.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Order Info */}
          {order && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Related Order
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <Link
                    href={`/staff/orders/${order.id}`}
                    className="font-medium text-cyan-600 hover:underline"
                  >
                    #{order.orderNumber || order.id.slice(0, 8)}
                  </Link>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium">{order.status}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium">₹{order.total.toLocaleString()}</p>
                </div>
              </div>
              <Link
                href={`/staff/orders/${order.id}`}
                className="mt-4 block w-full text-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
              >
                View Order Details
              </Link>
            </div>
          )}

          {/* Ticket Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Ticket Info
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium">{formatDate(ticket.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Messages</p>
                <p className="font-medium">{ticket.messages.length + 1}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {ticket.user?.phone && (
                <a href={`tel:${ticket.user.phone}`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg border border-gray-200 block">
                  📞 Call Customer
                </a>
              )}
              <a href={`mailto:${ticket.user?.email || ticket.email}`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg border border-gray-200 block">
                📧 Email Customer
              </a>
              {order && (
                <Link href={`/staff/orders/${order.id}`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg border border-gray-200 block">
                  📦 View Order
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
