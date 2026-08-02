import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { User, Mail, BookOpen, Calendar, GraduationCap, CheckCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import { authService } from '../services/authService'

export default function StudentProfile() {
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
        college: data.user.college || '',
        degree: data.user.degree || '',
        batch: data.user.batch || '',
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
      <PageHeader title="Student Profile" subtitle="View and edit your profile information" />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{profile?.name || 'Student'}</h3>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Student
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
              <BookOpen className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">College</p>
                <p className="font-medium text-gray-900">{profile?.college || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <GraduationCap className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Degree</p>
                <p className="font-medium text-gray-900">{profile?.degree || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Batch</p>
                <p className="font-medium text-gray-900">{profile?.batch || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Google Verified</p>
                <p className="font-medium text-gray-900">{profile?.googleId ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Account Created</p>
                <p className="font-medium text-gray-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
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