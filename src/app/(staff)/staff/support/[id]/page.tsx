'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  User,
  Clock,
  Tag,
  ShoppingBag,
  CheckCircle,
  MoreVertical,
} from 'lucide-react'

// Mock ticket data
const mockTicket = {
  id: 'TKT-001',
  subject: 'Order not received',
  status: 'OPEN',
  priority: 'HIGH',
  category: 'Delivery',
  customer: {
    name: 'Amit Kumar',
    email: 'amit@example.com',
    phone: '+91 9876543210',
  },
  orderId: 'GCH3P1R8',
  orderAmount: 2499,
  createdAt: '2024-01-15T10:30:00',
  messages: [
    {
      id: '1',
      sender: 'customer',
      name: 'Amit Kumar',
      message:
        'Hi, I placed an order 5 days ago but haven\'t received it yet. The tracking shows it\'s been shipped but no updates since then. Order ID: GCH3P1R8. Please help!',
      timestamp: '2024-01-15T10:30:00',
    },
    {
      id: '2',
      sender: 'staff',
      name: 'Support Team',
      message:
        'Hello Amit, Thank you for reaching out. I apologize for the inconvenience. Let me check the status of your order with our shipping partner. I\'ll get back to you shortly.',
      timestamp: '2024-01-15T11:00:00',
    },
    {
      id: '3',
      sender: 'customer',
      name: 'Amit Kumar',
      message: 'Thank you. Please update me as soon as possible. I needed this for a gift.',
      timestamp: '2024-01-15T11:45:00',
    },
  ],
}

const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED']
const priorityOptions = ['HIGH', 'MEDIUM', 'LOW']

export default function StaffTicketDetailPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState(mockTicket)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    // TODO: API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const message = {
      id: String(Date.now()),
      sender: 'staff',
      name: 'Support Team',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    }

    setTicket((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }))
    setNewMessage('')
    setIsSending(false)
  }

  const handleStatusChange = (newStatus: string) => {
    setTicket((prev) => ({ ...prev, status: newStatus }))
    // TODO: API call
  }

  const handlePriorityChange = (newPriority: string) => {
    setTicket((prev) => ({ ...prev, priority: newPriority }))
    // TODO: API call
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusColors: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    RESOLVED: 'bg-green-100 text-green-700',
  }

  const priorityColors: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-gray-100 text-gray-700',
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
            <span className="font-mono text-sm text-gray-500">{ticket.id}</span>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                statusColors[ticket.status]
              }`}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
            <select
              value={ticket.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                priorityColors[ticket.priority]
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
        {ticket.status !== 'RESOLVED' && (
          <button
            onClick={() => handleStatusChange('RESOLVED')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
              {ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'staff' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === 'staff' ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div
                    className={`flex-1 max-w-[80%] ${msg.sender === 'staff' ? 'text-right' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{msg.name}</span>
                      <span className="text-xs text-gray-500">{formatDate(msg.timestamp)}</span>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        msg.sender === 'staff'
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
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">
                  Use Template
                </button>
                <button className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">
                  Request Info
                </button>
                <button className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">
                  Escalate
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
                <p className="font-medium">{ticket.customer.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <a href={`mailto:${ticket.customer.email}`} className="text-cyan-600 hover:underline">
                  {ticket.customer.email}
                </a>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <a href={`tel:${ticket.customer.phone}`} className="text-cyan-600 hover:underline">
                  {ticket.customer.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Order Info */}
          {ticket.orderId && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Related Order
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <Link
                    href={`/staff/orders/${ticket.orderId}`}
                    className="font-medium text-cyan-600 hover:underline"
                  >
                    #{ticket.orderId}
                  </Link>
                </div>
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium">₹{ticket.orderAmount.toLocaleString()}</p>
                </div>
              </div>
              <Link
                href={`/staff/orders/${ticket.orderId}`}
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
                <p className="text-gray-500">Category</p>
                <p className="font-medium">{ticket.category}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium">{formatDate(ticket.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Messages</p>
                <p className="font-medium">{ticket.messages.length}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg border border-gray-200">
                📞 Call Customer
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg border border-gray-200">
                💰 Process Refund
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg border border-gray-200">
                📦 Resend Order
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg border border-gray-200">
                🎟️ Create Coupon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
