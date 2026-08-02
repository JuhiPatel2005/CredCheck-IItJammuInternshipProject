import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { adminService } from '../services/adminService'

export default function TrustedToggle({ user, onToggle }) {
  const [loading, setLoading] = useState(false)
  const isTrusted = user?.trusted || false

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)
    try {
      await adminService.toggleTrustedVerifier(user._id)
      onToggle?.()
      toast.success(isTrusted ? 'Trusted status removed' : 'Verifier marked as trusted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          isTrusted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}
      >
        {isTrusted ? 'Trusted' : 'Not Trusted'}
      </span>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          isTrusted
            ? 'bg-red-50 text-red-700 hover:bg-red-100'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        } disabled:opacity-50`}
      >
        {isTrusted ? 'Remove Trusted' : 'Mark Trusted'}
      </button>
    </div>
  )
}