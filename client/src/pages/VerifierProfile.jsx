import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { User, Mail, Shield, CheckCircle, Clock, Building, Phone, Globe, MapPin } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import { authService } from '../services/authService'

export default function VerifierProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await authService.getMe()
      setProfile(data.user)
      setFormData({
        name: data.user.name || '',
        contactNumber: data.user.contactNumber || '',
        address: data.user.address || '',
        website: data.user.website || '',
      })
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const data = await authService.updateProfile(formData)
      setProfile(data.user)
      setEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (loading) return <Loader />

  return (
    <div>
      <PageHeader title="Verifier Profile" subtitle="View and edit your profile information" />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <Building className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{profile?.name || 'Verifier'}</h3>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Verifier
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">OTP Verified</p>
                <p className="font-medium text-gray-900">{profile?.verified ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Admin Approved</p>
                <p className="font-medium text-gray-900">{profile?.approved ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Trusted Organization</p>
                <p className="font-medium text-gray-900">{profile?.trusted ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Contact Number</p>
                <p className="font-medium text-gray-900">{profile?.contactNumber || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{profile?.address || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Website</p>
                <p className="font-medium text-gray-900">{profile?.website || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Registration Date</p>
                <p className="font-medium text-gray-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}