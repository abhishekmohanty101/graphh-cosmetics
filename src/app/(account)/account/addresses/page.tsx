'use client'

import { useState } from 'react'
import { MapPin, Plus, Edit2, Trash2, Check, Home, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Mock addresses data
const initialAddresses = [
  {
    id: '1',
    name: 'Priya Sharma',
    phone: '+91 9876543210',
    line1: '123, Rose Garden Apartments',
    line2: 'MG Road, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    type: 'home',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    phone: '+91 9876543210',
    line1: 'Office #405, Tech Park',
    line2: 'Outer Ring Road, Marathahalli',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560037',
    type: 'work',
    isDefault: false,
  },
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(initialAddresses)
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
    type: 'home',
  })

  const handleEdit = (address: typeof initialAddresses[0]) => {
    setFormData(address)
    setEditingId(address.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(addresses.filter(a => a.id !== id))
    }
  }

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isDefault: a.id === id,
    })))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setAddresses(addresses.map(a => 
        a.id === editingId ? { ...formData, id: editingId, isDefault: a.isDefault } : a
      ))
    } else {
      setAddresses([
        ...addresses,
        { ...formData, id: Date.now().toString(), isDefault: addresses.length === 0 },
      ])
    }
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      type: 'home',
    })
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

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <Input
                value={formData.line1}
                onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                placeholder="House/Flat No., Building Name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
              <Input
                value={formData.line2}
                onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                placeholder="Street, Area, Landmark"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
              <div className="flex gap-3">
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer ${
                  formData.type === 'home' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="home"
                    checked={formData.type === 'home'}
                    onChange={() => setFormData({ ...formData, type: 'home' })}
                    className="sr-only"
                  />
                  <Home className="w-4 h-4" />
                  Home
                </label>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer ${
                  formData.type === 'work' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="work"
                    checked={formData.type === 'work'}
                    onChange={() => setFormData({ ...formData, type: 'work' })}
                    className="sr-only"
                  />
                  <Building className="w-4 h-4" />
                  Work
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? 'Update Address' : 'Save Address'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 && !showForm ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No addresses saved</h2>
          <p className="text-gray-500 mb-6">
            Add your first delivery address to make checkout faster.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`bg-white rounded-lg p-4 border-2 ${
                address.isDefault ? 'border-pink-500' : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {address.type === 'home' ? (
                    <Home className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Building className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-medium text-gray-900 capitalize">{address.type}</span>
                  {address.isDefault && (
                    <Badge className="bg-pink-100 text-pink-600">Default</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(address)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm">
                <p className="font-medium text-gray-900">{address.name}</p>
                <p className="text-gray-600 mt-1">{address.line1}</p>
                {address.line2 && <p className="text-gray-600">{address.line2}</p>}
                <p className="text-gray-600">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="text-gray-500 mt-1">{address.phone}</p>
              </div>

              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="mt-3 text-sm text-pink-500 hover:text-pink-600 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
