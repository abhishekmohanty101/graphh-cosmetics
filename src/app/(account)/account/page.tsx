'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { User, Mail, Phone, Calendar, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Mock user data
const currentUser = {
  firstName: 'Priya',
  lastName: 'Sharma',
  email: 'priya.sharma@example.com',
  phone: '+91 9876543210',
  dateOfBirth: '1995-06-15',
  gender: 'female',
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState(currentUser)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">Manage your personal information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          Profile updated successfully!
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg p-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {formData.firstName[0]}{formData.lastName[0]}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="text-gray-500">{formData.email}</p>
            {isEditing && (
              <Button variant="outline" size="sm" className="mt-2">
                Change Photo
              </Button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            {isEditing ? (
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-900 py-2">
                <User className="w-4 h-4 text-gray-400" />
                {formData.firstName}
              </div>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            {isEditing ? (
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            ) : (
              <div className="text-gray-900 py-2">{formData.lastName}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-2 text-gray-900 py-2">
              <Mail className="w-4 h-4 text-gray-400" />
              {formData.email}
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded ml-2">
                Verified
              </span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            {isEditing ? (
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-900 py-2">
                <Phone className="w-4 h-4 text-gray-400" />
                {formData.phone}
              </div>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            {isEditing ? (
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-900 py-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {new Date(formData.dateOfBirth).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            {isEditing ? (
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-pink-500 focus:ring-pink-500"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            ) : (
              <div className="text-gray-900 py-2 capitalize">{formData.gender}</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setFormData(currentUser)
                setIsEditing(false)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Security</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700">Password</p>
            <p className="text-sm text-gray-500">Last changed 30 days ago</p>
          </div>
          <Button variant="outline">Change Password</Button>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-white rounded-lg p-6 border border-red-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
        </p>
        <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
          Delete Account
        </Button>
      </div>
    </div>
  )
}
