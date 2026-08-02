import { GraduationCap, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getUser } from '../services/authService'

export default function Navbar() {
  const user = getUser()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const getProfilePath = () => {
    if (!user) return '/'
    if (user.role === 'student') return '/dashboard/student/profile'
    if (user.role === 'verifier') return '/dashboard/verifier/profile'
    if (user.role === 'admin') return '/dashboard/admin/profile'
    return '/'
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <GraduationCap className="text-blue-600" size={28} />
        <span className="text-xl font-semibold text-gray-900">CredCheck</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(getProfilePath())}
          className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          title="Profile"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-gray-700 hidden sm:block">{user?.name || 'User'}</span>
        </button>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  )
}