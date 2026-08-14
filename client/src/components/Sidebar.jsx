import { Link, useLocation } from 'react-router-dom'
import { GraduationCap, LayoutDashboard, FileText, User, Users, Shield, AlertTriangle, BarChart3 } from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()
  const userJson = localStorage.getItem('user')
  const user = userJson ? JSON.parse(userJson) : null
  const role = user?.role

  const getLinkClass = (path) => {
    const isDashboard = path.split('/').filter(Boolean).length === 2
    const isActive = isDashboard
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(path + '/')
    return isActive
      ? 'flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium'
      : 'flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors'
  }

  const studentLinks = [
    { to: '/dashboard/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/student/certificates', icon: FileText, label: 'Certificates' },
    { to: '/dashboard/student/upload', icon: FileText, label: 'Upload' },
    { to: '/dashboard/student/profile', icon: User, label: 'Profile' },
  ]

  const verifierLinks = [
    { to: '/dashboard/verifier', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/verifier/requests', icon: FileText, label: 'Pending Certificates' },
    { to: '/dashboard/verifier/verified', icon: FileText, label: 'Verified Certificates' },
    { to: '/dashboard/verifier/rejected', icon: FileText, label: 'Rejected Certificates' },
    { to: '/dashboard/verifier/profile', icon: User, label: 'Profile' },
  ]

  const adminLinks = [
    { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/dashboard/admin/students', icon: Users, label: 'Students' },
    { to: '/dashboard/admin/verifiers', icon: Shield, label: 'Verifiers' },
    { to: '/dashboard/admin/certificates', icon: FileText, label: 'Certificates' },
    { to: '/dashboard/admin/reports', icon: AlertTriangle, label: 'Reports' },
    { to: '/dashboard/admin/profile', icon: User, label: 'Profile' },
  ]

  const links = role === 'student' ? studentLinks : role === 'verifier' ? verifierLinks : adminLinks

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="flex items-center gap-2 px-4 mb-8">
        <GraduationCap className="text-blue-600" size={24} />
        <span className="text-lg font-semibold text-gray-900">CredCheck</span>
      </div>

      <nav className="space-y-1">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className={getLinkClass(link.to)}>
            <link.icon size={20} />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}