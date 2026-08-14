import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import PublicLayout from './layouts/PublicLayout'

import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'

import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import StudentProfile from './pages/StudentProfile'
import VerifierDashboard from './pages/VerifierDashboard'
import VerifierProfile from './pages/VerifierProfile'
import AdminDashboard from './pages/AdminDashboard'
import AdminProfile from './pages/AdminProfile'
import PublicCertificate from './pages/PublicCertificate'
import VerifyRequest from './pages/VerifyRequest'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Login />} />
        </Route>

        <Route path="/login" element={<AuthLayout />}>
          <Route index element={<Login />} />
        </Route>

        <Route path="/cert/:id" element={<PublicLayout />}>
          <Route index element={<PublicCertificate />} />
        </Route>

        <Route path="/verify-request" element={<PublicLayout />}>
          <Route index element={<VerifyRequest />} />
        </Route>

        <Route path="/dashboard/student" element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['student']}>
              <DashboardLayout />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="certificates" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="upload" element={<StudentDashboard />} />
        </Route>

        <Route path="/dashboard/verifier" element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['verifier']}>
              <DashboardLayout />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }>
          <Route index element={<VerifierDashboard />} />
          <Route path="requests" element={<VerifierDashboard />} />
          <Route path="verified" element={<VerifierDashboard />} />
          <Route path="rejected" element={<VerifierDashboard />} />
          <Route path="profile" element={<VerifierProfile />} />
        </Route>

        <Route path="/dashboard/admin" element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminDashboard />} />
          <Route path="students" element={<AdminDashboard />} />
          <Route path="verifiers" element={<AdminDashboard />} />
          <Route path="certificates" element={<AdminDashboard />} />
          <Route path="reports" element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App