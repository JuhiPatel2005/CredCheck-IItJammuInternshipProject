import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Check,
  X,
  User,
  Mail,
  Calendar,
  ExternalLink,
  Download,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import { verifierService } from '../services/verifierService'
import { authService } from '../services/authService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function VerifierDashboard() {
  const location = useLocation()

  const [view, setView] = useState('dashboard')
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCert, setSelectedCert] = useState(null)
  const [rejectComment, setRejectComment] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [verifierProfile, setVerifierProfile] = useState(null)

  useEffect(() => {
    const path = location.pathname
    if (path.includes('/verified')) {
      setView('verified')
    } else if (path.includes('/rejected')) {
      setView('rejected')
    } else {
      setView('pending')
    }
  }, [location.pathname])

  useEffect(() => {
    loadVerifierProfile()
  }, [])

  useEffect(() => {
    loadCertificates()
  }, [view])

  const loadVerifierProfile = async () => {
    try {
      const data = await authService.getMe()
      setVerifierProfile(data.user)
    } catch (error) {
    }
  }

  const loadCertificates = async () => {
    try {
      setLoading(true)
      const data = await verifierService.getCertificates()
      setCertificates(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (cert) => {
    try {
      const data = await verifierService.getCertificateById(cert._id)
      setSelectedCert(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load certificate details')
    }
  }

  const handleViewFile = (cert) => {
    const token = localStorage.getItem('token')
    window.open(`${API_URL}/certificates/${cert._id}/file?token=${token}`, '_blank')
  }

  const handleDownloadFile = async (cert) => {
    try {
      console.log('Downloading file:', cert._id)
      const { blob, filename } = await verifierService.downloadCertificateFile(cert._id)
      console.log('Got blob, filename:', filename)
      
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
      console.error('Error downloading file:', error)
      toast.error('Failed to download file')
    }
  }

  const handleApprove = async () => {
    if (!selectedCert) return

    try {
      await verifierService.updateStatus(selectedCert._id, 'verified', '')
      toast.success('Certificate approved successfully')
      setSelectedCert(null)
      loadCertificates()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve certificate')
    }
  }

  const handleReject = async () => {
    if (!selectedCert || !rejectComment.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      await verifierService.updateStatus(selectedCert._id, 'rejected', rejectComment)
      toast.success('Certificate rejected')
      setSelectedCert(null)
      setRejectComment('')
      setShowRejectModal(false)
      loadCertificates()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject certificate')
    }
  }

  const openRejectModal = () => {
    setShowRejectModal(true)
    setRejectComment('')
  }

  const getStatusBadge = (status) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const pendingCount = certificates.filter((c) => c.status === 'pending').length
  const verifiedCount = certificates.filter((c) => c.status === 'verified').length
  const rejectedCount = certificates.filter((c) => c.status === 'rejected').length

  if (loading) {
    return <Loader />
  }

  return (
    <div>
      <PageHeader title="Verifier Dashboard" subtitle="Review and verify certificates" />
      
      {verifierProfile && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{verifierProfile.name || 'Verifier'}</h3>
              <p className="text-sm text-gray-500">{verifierProfile.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{verifiedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{rejectedCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {view === 'pending' && 'Pending Certificates'}
            {view === 'verified' && 'Verified Certificates'}
            {view === 'rejected' && 'Rejected Certificates'}
          </h3>
        </div>
        <div className="p-6">
            {certificates.filter((c) => c.status === view).length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No certificate verification requests assigned to you.</p>
                <p className="text-gray-400 text-sm">
                  {view === 'pending' && 'No pending certificates to review'}
                  {view === 'verified' && 'No approved certificates yet'}
                  {view === 'rejected' && 'No rejected certificates'}
                </p>
              </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {certificates
                    .filter((c) => c.status === view)
                    .map((cert) => (
                      <tr key={cert._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{cert.studentId?.name || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cert.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{cert.organization}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(cert.issueDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(cert.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewFile(cert)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Open PDF"
                              >
                                <FileText className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDownloadFile(cert)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Download PDF"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleViewDetails(cert)}
                                className="text-gray-600 hover:text-gray-900"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
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

      {selectedCert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Certificate Details</h3>
              <button
                onClick={() => {
                  setSelectedCert(null)
                  setShowRejectModal(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Student Name</p>
                    <p className="font-medium text-gray-900">{selectedCert.studentId?.name || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedCert.studentId?.email || 'N/A'}</p>
                  </div>
                </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Certificate Title</p>
                  <p className="font-medium text-gray-900">{selectedCert.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-4 h-4 text-gray-400">@</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Organization</p>
                  <p className="font-medium text-gray-900">{selectedCert.organization}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Issue Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedCert.issueDate)}</p>
                </div>
              </div>

              {selectedCert.description && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900">{selectedCert.description}</p>
                </div>
              )}

              {selectedCert.fileUrl && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Uploaded File</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewFile(selectedCert)}
                      className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View File
                    </button>
                    <button
                      onClick={() => handleDownloadFile(selectedCert)}
                      className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              )}

              {selectedCert.status === 'verified' && selectedCert.verifiedAt && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Verification Date</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedCert.verifiedAt)}</p>
                  </div>
                </div>
              )}

              {selectedCert.status === 'verified' && selectedCert.verifiedBy && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Verified By</p>
                    <p className="font-medium text-gray-900">{selectedCert.verifiedBy}</p>
                  </div>
                </div>
              )}

              {selectedCert.comments && (
                <div className={`p-4 rounded-lg ${selectedCert.status === 'rejected' ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className={`text-sm mb-1 ${selectedCert.status === 'rejected' ? 'text-red-600' : 'text-gray-600'}`}>
                    {selectedCert.status === 'rejected' ? 'Rejection Reason' : 'Comments'}
                  </p>
                  <p className="text-gray-900">{selectedCert.comments}</p>
                </div>
              )}

              {selectedCert.status === 'verified' && selectedCert.publicLinkId && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Public Certificate Link</p>
                  <a
                    href={`${window.location.origin}/cert/${selectedCert.publicLinkId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Public Certificate
                  </a>
                </div>
              )}

              {selectedCert.status === 'verified' && selectedCert.qrCodeUrl && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">QR Code</p>
                  <img
                    src={selectedCert.qrCodeUrl}
                    alt="QR Code"
                    className="w-32 h-32 mx-auto"
                  />
                </div>
              )}

              {selectedCert.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleApprove}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Check className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={openRejectModal}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Reject Certificate</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Please provide a reason for rejection..."
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectComment('')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}