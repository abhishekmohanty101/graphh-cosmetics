'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, Edit2, Trash2, Check, Home, Building, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Address {
  id: string
  name: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  type: string
  isDefault: boolean
}

export default function AddressesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'HOME',
    isDefault: false,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/addresses')
    } else if (status === 'authenticated') {
      fetchAddresses()
    }
  }, [status, router])

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/v1/user/addresses')
      const data = await res.json()
      if (data.success) {
        setAddresses(data.data.addresses)
      } else {
        setError('Failed to load addresses')
      }
    } catch (err) {
      setError('Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      type: 'HOME',
      isDefault: false,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (address: Address) => {
    setFormData({
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      type: address.type,
      isDefault: address.isDefault,
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const res = await fetch(`/api/v1/user/addresses/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setAddresses(addresses.filter(a => a.id !== id))
        setSuccess('Address deleted')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to delete address')
      }
    } catch (err) {
      setError('Failed to delete address')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/user/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })
      const data = await res.json()
      if (data.success) {
        setAddresses(addresses.map(a => ({
          ...a,
          isDefault: a.id === id,
        })))
        setSuccess('Default address updated')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Failed to update default address')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url = editingId 
        ? `/api/v1/user/addresses/${editingId}`
        : '/api/v1/user/addresses'
      
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        if (editingId) {
          setAddresses(addresses.map(a => 
            a.id === editingId ? data.data.address : a
          ))
        } else {
          // If new address is default, update others
          if (formData.isDefault) {
            setAddresses([data.data.address, ...addresses.map(a => ({ ...a, isDefault: false }))])
          } else {
            setAddresses([...addresses, data.data.address])
          }
        }
        setSuccess(editingId ? 'Address updated' : 'Address added')
        setTimeout(() => setSuccess(''), 3000)
        resetForm()
      } else {
        setError(data.error || 'Failed to save address')
      }
    } catch (err) {
      setError('Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
          <p className="text-gray-500">Manage your delivery addresses</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <Input
              placeholder="Address Line 1"
              value={formData.line1}
              onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
              required
            />
            <Input
              placeholder="Address Line 2 (Optional)"
              value={formData.line2}
              onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <Input
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
              <Input
                placeholder="PIN Code"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Address Type:</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'HOME' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, type: 'HOME' })}
                >
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'WORK' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, type: 'WORK' })}
                >
                  <Building className="w-4 h-4 mr-1" />
                  Work
                </Button>
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Set as default address</span>
            </label>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingId ? 'Update Address' : 'Save Address'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 && !showForm ? (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No addresses saved</h2>
          <p className="text-gray-500 mb-6">
            Add your delivery address for faster checkout
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-lg p-6 shadow-sm border-2 ${
                address.isDefault ? 'border-pink-500' : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {address.type === 'WORK' ? (
                    <Building className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Home className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm font-medium text-gray-500 uppercase">
                    {address.type}
                  </span>
                  {address.isDefault && (
                    <Badge className="bg-pink-100 text-pink-700">Default</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(address)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-semibold">{address.name}</p>
                <p className="text-gray-600">{address.line1}</p>
                {address.line2 && <p className="text-gray-600">{address.line2}</p>}
                <p className="text-gray-600">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="text-gray-600">{address.phone}</p>
              </div>

              {!address.isDefault && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-3 p-0 h-auto text-pink-600"
                  onClick={() => handleSetDefault(address.id)}
                >
                  Set as Default
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
