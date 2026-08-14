import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Users,
  UserCheck,
  FileText,
  Clock,
  Trash2,
  Check,
  X,
  Filter,
  ChevronDown,
  AlertTriangle,
  Shield,
  Download,
  Eye,
  BarChart3,
  TrendingUp,
  Award,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import TrustedToggle from '../components/TrustedToggle'
import { adminService } from '../services/adminService'
import { authService } from '../services/authService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AdminDashboard() {
  const location = useLocation()

  const [view, setView] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [verifierRequests, setVerifierRequests] = useState([])
  const [certificates, setCertificates] = useState([])
  const [reports, setReports] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [certFilter, setCertFilter] = useState('all')
  const [showCertMenu, setShowCertMenu] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  const [adminProfile, setAdminProfile] = useState(null)

  useEffect(() => {
    const path = location.pathname
    if (path.includes('/analytics')) {
      setView('analytics')
    } else if (path.includes('/students')) {
      setView('students')
    } else if (path.includes('/verifiers')) {
      setView('verifiers')
    } else if (path.includes('/certificates')) {
      setView('certificates')
    } else if (path.includes('/reports')) {
      setView('reports')
    } else {
      setView('dashboard')
    }
  }, [location.pathname])

  useEffect(() => {
    loadAdminProfile()
  }, [])

  useEffect(() => {
    if (view === 'dashboard') {
      loadDashboardData()
    } else if (view === 'analytics') {
      loadAnalytics()
    } else if (view === 'students') {
      loadUsers()
    } else if (view === 'verifiers') {
      loadVerifierRequests()
    } else if (view === 'certificates') {
      loadCertificates()
    } else if (view === 'reports') {
      loadReports()
    }
  }, [view])

  const loadAdminProfile = async () => {
    try {
      const data = await authService.getMe()
      setAdminProfile(data.user)
    } catch (error) {
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [usersData, verifierData, certsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getVerifiers(),
        adminService.getCertificates(),
      ])
      setUsers(usersData)
      setVerifierRequests(verifierData)
      setCertificates(certsData)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getUsers()
      const studentsOnly = data.filter((user) => user.role === 'student')
      setUsers(studentsOnly)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const loadVerifierRequests = async () => {
    try {
      setLoading(true)
      const data = await adminService.getVerifiers()
      setVerifierRequests(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load verifier requests')
    } finally {
      setLoading(false)
    }
  }

  const loadCertificates = async () => {
    try {
      setLoading(true)
      const data = await adminService.getCertificates()
      setCertificates(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await adminService.getReports()
      setReports(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAnalytics()
      setAnalytics(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      await adminService.deleteUser(id)
      toast.success('User deleted successfully')
      loadUsers()
      loadDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleDeleteCertificate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) {
      return
    }

    try {
      await adminService.deleteCertificate(id)
      toast.success('Certificate deleted successfully')
      loadCertificates()
      loadDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete certificate')
    }
  }

  const handleViewFile = (cert) => {
    const token = localStorage.getItem('token')
    window.open(`${API_URL}/certificates/${cert._id}/file?token=${token}`, '_blank')
  }

  const handleDownloadFile = async (cert) => {
    try {
      const { blob, filename } = await adminService.downloadCertificateFile(cert._id)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Certificate downloaded successfully')
    } catch (error) {
      toast.error('Failed to download file')
    }
  }

  const handleResolveReport = async (id) => {
    try {
      await adminService.resolveReport(id)
      toast.success('Report marked as resolved')
      loadReports()
      loadDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resolve report')
    }
  }

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return
    }

    try {
      await adminService.deleteReport(id)
      toast.success('Report deleted successfully')
      loadReports()
      loadDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report')
    }
  }

  const handleDeleteVerifier = async (id) => {
    if (!window.confirm('Are you sure you want to delete this verifier?')) {
      return
    }

    try {
      await adminService.deleteVerifier(id)
      toast.success('Verifier deleted successfully')
      loadVerifierRequests()
      loadDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete verifier')
    }
  }

  const handleApproveVerifier = async (id) => {
    try {
      await adminService.updateVerifierRequestStatus(id, 'approved')
      toast.success('Verifier request approved')
      loadVerifierRequests()
      loadDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve verifier request')
    }
  }

  const handleRejectVerifier = async (id) => {
    try {
      await adminService.updateVerifierRequestStatus(id, 'rejected')
      toast.success('Verifier request rejected')
      loadVerifierRequests()
      loadDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject verifier request')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getCertStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const studentCount = users.filter((u) => u.role === 'student').length
  const verifierCount = users.filter((u) => u.role === 'verifier').length
  const pendingVerifierCount = verifierRequests.filter((r) => r.status === 'pending').length
  const totalCertificates = certificates.length
  const pendingCertCount = certificates.filter((c) => c.status === 'pending').length
  const verifiedCertCount = certificates.filter((c) => c.status === 'verified').length
  const rejectedCertCount = certificates.filter((c) => c.status === 'rejected').length
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length

  const filteredCertificates = certFilter === 'all'
    ? certificates
    : certificates.filter((c) => c.status === certFilter)

  if (loading && view === 'dashboard') {
    return <Loader />
  }

  if (view === 'dashboard') {
    const pendingVerifierRequests = verifierRequests.filter((r) => r.status === 'pending')

    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader title="Dashboard" subtitle="Admin Overview" />
        
        {adminProfile && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{adminProfile.name || 'Admin'}</h3>
                <p className="text-sm text-gray-500">{adminProfile.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{studentCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Verifiers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{verifierCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Certificates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingCertCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Certificates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{verifiedCertCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalCertificates}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected Certificates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{rejectedCertCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verifier Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingVerifierCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingReportsCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {pendingVerifierRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pending Verifier Requests</h3>
              <p className="text-sm text-gray-500 mt-1">Review and approve or reject verifier requests</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingVerifierRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.organizationName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{request.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(request.requestedAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveVerifier(request._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectVerifier(request._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (view === 'analytics') {
    if (loading) {
      return <Loader />
    }

    // If there is no analytics data yet, show an empty state
    if (!analytics) {
      return (
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeader title="Analytics" subtitle="Platform statistics and trends" />
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No analytics data available</p>
          </div>
        </div>
      )
    }

    // Find the highest monthly count so we can scale the bar chart
    const maxMonthlyCount = Math.max(...analytics.monthlyTrend.map((item) => item.count), 1)

    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader title="Analytics" subtitle="Platform statistics and trends" />

        {/* ===== Statistic Cards ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Verifiers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalVerifiers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalCertificates}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Certificates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.pendingCertificates}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Certificates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.verifiedCertificates}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected Certificates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.rejectedCertificates}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ===== Verification / Rejection Percentages ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Verification Rate</h3>
            </div>
            <p className="text-4xl font-bold text-green-600">{analytics.verificationPercentage}%</p>
            <p className="text-sm text-gray-500 mt-2">
              {analytics.verifiedCertificates} out of {analytics.totalCertificates} certificates verified
            </p>
            <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${analytics.verificationPercentage}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Rejection Rate</h3>
            </div>
            <p className="text-4xl font-bold text-red-600">{analytics.rejectionPercentage}%</p>
            <p className="text-sm text-gray-500 mt-2">
              {analytics.rejectedCertificates} out of {analytics.totalCertificates} certificates rejected
            </p>
            <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${analytics.rejectionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* ===== Monthly Trend Chart (pure CSS bar chart) ===== */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Certificate Activity</h3>
          </div>

          {analytics.monthlyTrend.every((item) => item.count === 0) ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No certificate activity in the last 6 months</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-4 h-48">
              {analytics.monthlyTrend.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <span className="text-sm font-medium text-gray-700 mb-1">{item.count}</span>
                  <div
                    className="w-full max-w-[40px] bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-all"
                    style={{
                      height: `${(item.count / maxMonthlyCount) * 100}%`,
                      minHeight: item.count > 0 ? '8px' : '2px',
                    }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== Most Active Verifiers ===== */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Most Active Verifiers</h3>
          </div>

          {analytics.activeVerifiers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No verifier activity yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.activeVerifiers.map((verifier, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{verifier.name}</p>
                      <p className="text-xs text-gray-500">{verifier.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {verifier.count} certs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (view === 'students') {
    if (loading) {
      return <Loader />
    }

    const students = users.filter((u) => u.role === 'student')

    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader title="Students" subtitle="Manage all registered students" />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No students found</p>
            </div>
          ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">College</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Degree</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" title="Total | Verified | Pending | Rejected">Certs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="text-sm font-medium text-gray-900">{student.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal align-top">
                        <div className="text-sm text-gray-500 max-w-[220px] truncate">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal align-top">
                        <div className="text-sm text-gray-500 max-w-[180px] truncate">{student.college || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal align-top">
                        <div className="text-sm text-gray-500 max-w-[180px] truncate">{student.degree || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="text-sm text-gray-500">{student.batch || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {student.verified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="text-sm text-gray-500">{formatDate(student.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">T {student.totalCertificates || 0}</span>
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">V {student.verifiedCertificates || 0}</span>
                          <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs">P {student.pendingCertificates || 0}</span>
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs">R {student.rejectedCertificates || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <button
                          onClick={() => handleDeleteUser(student._id)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-1"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (view === 'verifiers') {
    if (loading) {
      return <Loader />
    }

    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader title="Verifier Requests" subtitle="Approve or reject verifier requests" />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {verifierRequests.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No verifier requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OTP Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin Approved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trusted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {verifierRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.organizationName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{request.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.user ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {request.user ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.status === 'approved' && request.user ? (
                          <TrustedToggle user={request.user} onToggle={loadVerifierRequests} />
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(request.requestedAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-2">
                          {request.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApproveVerifier(request._id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectVerifier(request._id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">Reviewed</span>
                          )}
                          <button
                            onClick={() => handleDeleteVerifier(request._id)}
                            className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs"
                            title="Delete Verifier"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (view === 'reports') {
    if (loading) {
      return <Loader />
    }

    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader title="Reports" subtitle="Manage abuse reports" />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No abuse reports have been submitted.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.reportedBy || 'Anonymous'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.certificateId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{report.reason}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(report.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleResolveReport(report._id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Resolve
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report._id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDeleteReport(report._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (view === 'certificates') {
    if (loading) {
      return <Loader />
    }

    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader title="Certificates" subtitle="Manage all certificates" />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {certFilter === 'all' ? 'All Certificates' : `${certFilter.charAt(0).toUpperCase() + certFilter.slice(1)} Certificates`}
            </h3>
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setShowCertMenu((value) => !value)}
                className="inline-flex items-center justify-between w-48 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span>{certFilter === 'all' ? 'All' : certFilter.charAt(0).toUpperCase() + certFilter.slice(1)}</span>
                </span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {showCertMenu && (
                <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  {['all', 'pending', 'verified', 'rejected'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setCertFilter(option)
                        setShowCertMenu(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-sm ${certFilter === option ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="p-4">
            {filteredCertificates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No certificates found</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Organization</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Verifier</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Uploaded</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Verified</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Public / QR</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredCertificates.map((cert) => (
                      <tr key={cert._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-normal align-top min-w-0">
                          <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate">{cert.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-normal align-top min-w-0">
                          <div className="text-sm text-gray-900">{cert.studentId?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500 max-w-[200px] truncate">{cert.studentId?.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-normal align-top min-w-0">
                          <div className="text-sm text-gray-900 max-w-[180px] truncate">{cert.organization}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-normal align-top min-w-0">
                          <div>
                            <div className="text-sm text-gray-900">{cert.verifierName || 'N/A'}</div>
                            <div className="text-xs text-gray-500 max-w-[180px] truncate">{cert.verifierEmail || ''}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top">
                          {getCertStatusBadge(cert.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top">
                          <div className="text-sm text-gray-500">{formatDate(cert.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top">
                          <div className="text-sm text-gray-500">{formatDate(cert.verifiedAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-normal align-top min-w-0">
                          <div className="flex flex-wrap gap-2">
                            {cert.publicLinkId ? (
                              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-medium">
                                Public
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-[11px]">
                                No Public
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                              cert.qrCodeUrl ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {cert.qrCodeUrl ? 'QR' : 'No QR'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleViewFile(cert)}
                              className="text-slate-700 hover:text-slate-900 flex items-center gap-1 text-xs"
                              title="View PDF"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadFile(cert)}
                              className="text-slate-700 hover:text-slate-900 flex items-center gap-1 text-xs"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCertificate(cert)
                              }}
                              className="text-slate-700 hover:text-slate-900 flex items-center gap-1 text-xs"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {selectedCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Certificate Details</h3>
                <button onClick={() => setSelectedCertificate(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Student Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Name</p>
                      <p className="text-sm text-gray-900">{selectedCertificate.studentId?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{selectedCertificate.studentId?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">College</p>
                      <p className="text-sm text-gray-900">{selectedCertificate.studentId?.college || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Degree</p>
                      <p className="text-sm text-gray-900">{selectedCertificate.studentId?.degree || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Batch</p>
                      <p className="text-sm text-gray-900">{selectedCertificate.studentId?.batch || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Certificate Title</p>
                  <p className="text-base text-gray-900">{selectedCertificate.title}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-base text-gray-900">{selectedCertificate.description || 'No description'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Organization</p>
                  <p className="text-base text-gray-900">{selectedCertificate.organization}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Issue Date</p>
                    <p className="text-base text-gray-900">{formatDate(selectedCertificate.issueDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Verification Date</p>
                    <p className="text-base text-gray-900">{formatDate(selectedCertificate.verifiedAt)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Verifier Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Verifier Name</p>
                      <p className="text-sm text-gray-900">{selectedCertificate.verifierName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Verifier Email</p>
                      <p className="text-sm text-gray-900">{selectedCertificate.verifierEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Status</p>
                      {getCertStatusBadge(selectedCertificate.status)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Verified By</p>
                      <p className="text-sm text-gray-900">{selectedCertificate.verifiedBy || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {selectedCertificate.comments && (
                  <div className={`p-4 rounded-lg ${selectedCertificate.status === 'rejected' ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-medium mb-1 ${selectedCertificate.status === 'rejected' ? 'text-red-600' : 'text-gray-500'}`}>
                      {selectedCertificate.status === 'rejected' ? 'Rejection Reason' : 'Comments'}
                    </p>
                    <p className="text-base text-gray-900">{selectedCertificate.comments}</p>
                  </div>
                )}

                {selectedCertificate.fileUrl && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Certificate</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewFile(selectedCertificate)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                      >
                        View File
                      </button>
                      <button
                        onClick={() => handleDownloadFile(selectedCertificate)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">QR Code</p>
                    {selectedCertificate.qrCodeUrl ? (
                      <img
                        src={selectedCertificate.qrCodeUrl}
                        alt="QR Code"
                        className="w-24 h-24 border border-gray-200 rounded-lg"
                      />
                    ) : (
                      <p className="text-sm text-gray-400">Not generated</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Public URL</p>
                    {selectedCertificate.publicLinkId ? (
                      <a href={`${window.location.origin}/cert/${selectedCertificate.publicLinkId}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 text-sm">
                        View Public Page
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400">Not available</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Uploaded At</p>
                    <p className="text-base text-gray-900">{formatDate(selectedCertificate.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}