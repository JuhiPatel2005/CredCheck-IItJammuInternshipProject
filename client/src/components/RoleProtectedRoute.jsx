import { Navigate } from 'react-router-dom'

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token')
  const userJson = localStorage.getItem('user')
  const user = userJson ? JSON.parse(userJson) : null

  if (!token || !user) {
    return <Navigate to="/" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'student') {
      return <Navigate to="/dashboard/student" replace />
    } else if (user.role === 'verifier') {
      return <Navigate to="/dashboard/verifier" replace />
    } else if (user.role === 'admin') {
      return <Navigate to="/dashboard/admin" replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}